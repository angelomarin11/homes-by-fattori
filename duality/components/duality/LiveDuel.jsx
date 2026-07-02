"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ============================================================================
//  /d/[id] — a DISPUTA REAL. Lê o Supabase (Realtime em `blocks`), gera o
//  pagamento via /api/charge e espera o webhook confirmar. O navegador NUNCA
//  escreve estado de jogo — só reflete o banco. ?demo=1 mostra uma
//  pré-visualização rotulada com dados de exemplo (sem banco, sem cobrança).
// ============================================================================

import {
  GRID, BASE, WIN_PCT, ETERNAL_PRICE, FLAIRS, CRY_MAX,
  normalizeCrewTag, nextGoal, skinOf,
} from "./rules";
import { DICT, MONEY, LangCtx, useT, detectLang, bold } from "./i18n";
import { S, CSS, FONTS, FD, FM, BG, INK, DIM, LINE, pickText, fmtHMS } from "./theme";
import Board from "./Board";
import Tv from "./Tv";
import { getBrowserDb } from "@/lib/supabase-browser";
import { MOCK_DUEL, mockBlocks, MOCK_RANKING, MOCK_CREWS, MOCK_FEED } from "./mock";

const CUR = { BRL: "R$ ", USD: "$", EUR: "€" };

export default function LiveDuel({ duelId, demo = false }) {
  const [lang, setLang] = useState("pt");
  useEffect(() => { setLang(detectLang()); }, []);
  const t = DICT[lang]; const money = MONEY[lang];
  return (
    <LangCtx.Provider value={{ t, lang, setLang, money }}>
      <LiveInner duelId={duelId} demo={demo} />
    </LangCtx.Provider>
  );
}

function LiveInner({ duelId, demo }) {
  const { t } = useT();
  const db = useMemo(() => (demo ? null : getBrowserDb()), [demo]);

  const [status, setStatus] = useState("loading");   // loading | unconfigured | notfound | ready
  const [duel, setDuel] = useState(null);
  const [blockRows, setBlockRows] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [crews, setCrews] = useState([]);
  const [feed, setFeed] = useState([]);
  // jogador (persistido no navegador)
  const [side, setSide] = useState("a");
  const [budget, setBudget] = useState(10);
  const [name, setName] = useState("");
  const [flair, setFlair] = useState(FLAIRS[0]);
  const [myCrew, setMyCrew] = useState(null);
  const [crewInput, setCrewInput] = useState("");
  const [cry, setCry] = useState("");
  // fluxos
  const [buy, setBuy] = useState(null);              // { phase: creating|qr|paid, kind, ...charge }
  const [toast, setToast] = useState(null);
  const [tv, setTv] = useState(false);
  const [hype, setHype] = useState(null);
  const [tick, setTick] = useState(0);
  const [holdLeft, setHoldLeft] = useState(0);
  const lastFeedTs = useRef(null);
  const imgA = useRef(null), imgB = useRef(null);

  const show = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem("duality_profile") || "{}");
      if (p.name) setName(p.name); if (p.flair) setFlair(p.flair); if (p.crew) setMyCrew(p.crew);
    } catch {}
  }, []);
  const saveProfile = useCallback((patch) => {
    try { const p = JSON.parse(localStorage.getItem("duality_profile") || "{}"); localStorage.setItem("duality_profile", JSON.stringify({ ...p, ...patch })); } catch {}
  }, []);

  /* ---------- carga + realtime ---------- */
  const refreshSocial = useCallback(async () => {
    if (!db) return;
    const [r, c, f] = await Promise.all([
      db.from("contributions").select("buyer_name, blocks").eq("duel_id", duelId).order("blocks", { ascending: false }).limit(5),
      db.from("crews").select("tag, side, points").eq("duel_id", duelId).order("points", { ascending: false }).limit(5),
      db.from("transactions").select("buyer_name, side, cry, crew, gross, kind, positions, paid_at").eq("duel_id", duelId).eq("status", "paid").order("paid_at", { ascending: false }).limit(8),
    ]);
    setRanking(r.data || []); setCrews(c.data || []);
    const feedRows = f.data || [];
    setFeed(feedRows);
    // jogada nova tier 3 → hype na tela (dado real, vindo de pagamento confirmado)
    const newest = feedRows[0];
    if (newest && lastFeedTs.current && newest.paid_at !== lastFeedTs.current && Number(newest.gross) >= 50) {
      setHype({ name: newest.buyer_name, crew: newest.crew, cry: newest.cry, amount: newest.gross, side: newest.side, eternal: newest.kind === "eternal" });
      setTimeout(() => setHype(null), 3400);
    }
    if (newest) lastFeedTs.current = newest.paid_at;
  }, [db, duelId]);

  const refreshDuel = useCallback(async () => {
    if (!db) return;
    const { data } = await db.from("duels").select("*, creators(name)").eq("id", duelId).single();
    if (data) setDuel(data);
  }, [db, duelId]);

  useEffect(() => {
    let channel;
    (async () => {
      if (demo) {
        setDuel(MOCK_DUEL); setBlockRows(mockBlocks());
        setRanking(MOCK_RANKING); setCrews(MOCK_CREWS); setFeed(MOCK_FEED);
        setStatus("ready"); return;
      }
      if (!db) { setStatus("unconfigured"); return; }
      const { data: d } = await db.from("duels").select("*, creators(name)").eq("id", duelId).single();
      if (!d) { setStatus("notfound"); return; }
      setDuel(d);
      const { data: bl } = await db.from("blocks").select("pos, side, owner_name, price, eternal, flair").eq("duel_id", duelId);
      setBlockRows(bl || []);
      await refreshSocial();
      setStatus("ready");
      // Realtime: cada bloco pago por QUALQUER pessoa aparece aqui
      channel = db.channel(`blocks:${duelId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "blocks", filter: `duel_id=eq.${duelId}` }, (payload) => {
          const b = payload.new;
          setBlockRows(prev => { const i = prev.findIndex(x => x.pos === b.pos); if (i < 0) return [...prev, b]; const next = [...prev]; next[i] = b; return next; });
          refreshSocial(); refreshDuel();
        })
        .subscribe();
    })();
    return () => { if (channel && db) db.removeChannel(channel); };
  }, [db, duelId, demo, refreshSocial, refreshDuel]);

  // fallback: estado da disputa (prazo 24h / vencedor) a cada 20s
  useEffect(() => {
    if (demo || !db || status !== "ready") return;
    const iv = setInterval(refreshDuel, 20000);
    return () => clearInterval(iv);
  }, [demo, db, status, refreshDuel]);

  // contagem regressiva do prazo de vitória
  useEffect(() => {
    if (!duel?.hold_until) { setHoldLeft(0); return; }
    const target = new Date(duel.hold_until).getTime();
    const iv = setInterval(() => setHoldLeft(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(iv);
  }, [duel?.hold_until]);

  // imagens dos lados
  useEffect(() => {
    imgA.current = null; imgB.current = null;
    if (duel?.img_a) { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => { imgA.current = i; setTick(x => x + 1); }; i.src = duel.img_a; }
    if (duel?.img_b) { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => { imgB.current = i; setTick(x => x + 1); }; i.src = duel.img_b; }
  }, [duel?.img_a, duel?.img_b]);

  /* ---------- derivados ---------- */
  const grid = duel?.grid || GRID;
  const total = grid * grid;
  const cells = useMemo(() => {
    const o = {};
    for (let p = 0; p < total; p++) o[p] = { side: (p % grid) < grid / 2 ? "a" : "b", name: null, price: Number(duel?.base_price || BASE), flair: null };
    blockRows.forEach(b => { o[b.pos] = { side: b.side, name: b.owner_name, price: Number(b.price), eternal: b.eternal, flair: b.flair }; });
    return o;
  }, [blockRows, total, grid, duel?.base_price]);

  let cA = 0; for (let p = 0; p < total; p++) if (cells[p].side === "a") cA++;
  const pctA = total ? Math.round((cA / total) * 100) : 50;
  const pctB = 100 - pctA;
  const winPct = duel?.win_pct || WIN_PCT;
  const sideDom = side === "a" ? pctA : pctB;
  const sideCount = side === "a" ? cA : total - cA;
  const behind = Math.max(0, 50 - sideDom);
  const handicap = 1 - Math.min(0.5, behind / 100);
  const priceFactor = sideDom >= winPct ? 2 : handicap;
  const goal = nextGoal(sideDom, sideCount, total);

  // estimativa local do que o orçamento compra (o servidor é a fonte da verdade)
  const plan = useMemo(() => {
    const opp = side === "a" ? "b" : "a"; const targets = [];
    for (let p = 0; p < total; p++) { if (cells[p].eternal) continue; if (cells[p].side === opp) targets.push(+(cells[p].price * priceFactor).toFixed(2)); }
    targets.sort((x, y) => x - y);
    let spent = 0, count = 0;
    for (const cost of targets) { if (spent + cost > budget + 1e-9) continue; spent += cost; count++; }
    return { spent: +spent.toFixed(2), count };
  }, [cells, side, budget, priceFactor, total]);

  const eternalCount = blockRows.filter(b => b.eternal).length;
  const eternalLeft = (duel?.eternal_cap ?? 50) - eternalCount;
  const cur = CUR[duel?.currency] || duel?.currency || "R$ ";
  const cfg = duel ? {
    title: duel.title, a: duel.side_a, b: duel.side_b,
    colorA: duel.color_a, colorB: duel.color_b, imgA: duel.img_a, imgB: duel.img_b,
    creator: duel.creators?.name || "", skin: duel.skin || "carvao",
    cries: duel.cries || [], victoryMsg: duel.victory_msg || "",
  } : null;
  const winner = duel?.status === "won" ? duel.winner : null;
  const holdSide = duel?.leading_side || null;

  /* ---------- compra real ---------- */
  async function startBuy(kind) {
    if (winner) return;
    if (demo) { show(t.demo); return; }
    setBuy({ phase: "creating", kind });
    try {
      const res = await fetch("/api/charge", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duelId, side, budget, kind,
          buyerName: (name.trim() || "Anon").slice(0, 16),
          cry: cry.trim().slice(0, CRY_MAX) || null,
          crew: myCrew, flair,
        }),
      });
      const data = await res.json();
      if (!res.ok) { show(data.error || "erro"); setBuy(null); return; }
      saveProfile({ name: name.trim(), flair, crew: myCrew });
      setBuy({ phase: "qr", kind, ...data });
    } catch { show(t.net_err); setBuy(null); }
  }

  // enquanto o QR está aberto, espera o webhook marcar a transação como paga
  useEffect(() => {
    if (!buy?.txnId || buy.phase !== "qr" || !db) return;
    const iv = setInterval(async () => {
      const { data } = await db.from("transactions").select("status").eq("id", buy.txnId).single();
      if (data?.status === "paid") {
        clearInterval(iv);
        setBuy(b => ({ ...b, phase: "paid" }));
        setCry("");
        refreshSocial();
        setTimeout(() => setBuy(null), 2000);
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [buy?.txnId, buy?.phase, db, refreshSocial]);

  /* ---------- telas de borda ---------- */
  if (status === "loading") return <Shell><p style={ST.center}>…</p></Shell>;
  if (status === "unconfigured") return (
    <Shell>
      <div style={ST.setupCard}>
        <div style={S.brand}>DUALITY</div>
        <p style={ST.setupTxt}>Backend não configurado. Preencha <code style={ST.code}>NEXT_PUBLIC_SUPABASE_URL</code> e <code style={ST.code}>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no <code style={ST.code}>.env.local</code> e rode <code style={ST.code}>db/schema.sql</code> no Supabase.</p>
        <p style={ST.setupTxt}>Pra ver esta página com dados de exemplo: <a href={`/d/${duelId}?demo=1`} style={{ color: "#5ad07a" }}>/d/{duelId}?demo=1</a></p>
      </div>
    </Shell>
  );
  if (status === "notfound") return <Shell><p style={ST.center}>{t.not_found}</p></Shell>;

  const isA = side === "a", accent = isA ? cfg.colorA : cfg.colorB;
  const skin = skinOf(cfg.skin);
  const holdColor = holdSide === "a" ? cfg.colorA : cfg.colorB;
  const feedItems = feed.map(f => ({
    name: f.buyer_name, side: f.side, cry: f.cry, crew: f.crew, ts: f.paid_at,
    qty: f.kind === "eternal" ? "★" : (f.positions?.length ?? 0), eternal: f.kind === "eternal",
    tier: f.kind === "eternal" || Number(f.gross) >= 50 ? 3 : Number(f.gross) >= 15 ? 2 : 1,
  }));

  if (tv) {
    return (<><style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} /><Tv cfg={cfg} cells={cells} pctA={pctA} holdSide={holdSide} holdLeft={holdLeft} feed={feedItems} imgA={imgA} imgB={imgB} tick={tick} onExit={() => setTv(false)} /></>);
  }

  return (
    <div style={{ ...S.proot, background: BG }}><style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div style={{ ...S.aurora, background: skin.aurora, position: "fixed" }} />
      <header style={{ ...S.phead, position: "relative" }}>
        <div style={S.brand}>DUALITY</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setTv(true)} style={S.tvTop} title={t.tv_tip}>⏺ {t.tv_btn}</button>
          <button onClick={async () => { const txt = t.live_share(isA ? cfg.a : cfg.b, sideDom, cfg.title); try { if (navigator.share) await navigator.share({ title: cfg.title, text: txt, url: location.href }); else { await navigator.clipboard.writeText(`${txt} ${location.href}`); show(t.copied); } } catch {} }} style={S.shareTop}>{t.share}</button>
        </div>
      </header>
      {demo && <div style={{ ...S.demoBadge, position: "relative" }}>{t.demo}</div>}

      <div style={{ ...S.hero, position: "relative" }}>
        <div style={S.tickerRow}>
          <div style={S.tkSide}><div style={{ ...S.tkName, color: cfg.colorA }}>{cfg.a}</div><div key={"a" + pctA} className="bumpNum" style={{ ...S.tkPct, color: cfg.colorA }}>{pctA}<span style={S.pctMini}>%</span></div></div>
          <div style={S.tkVs}>×</div>
          <div style={{ ...S.tkSide, alignItems: "flex-end" }}><div style={{ ...S.tkName, color: cfg.colorB }}>{cfg.b}</div><div key={"b" + pctA} className="bumpNum" style={{ ...S.tkPct, color: cfg.colorB }}>{pctB}<span style={S.pctMini}>%</span></div></div>
        </div>
        <div style={S.title}>{cfg.title}</div>
        {!winner && <div style={S.onboard}>{t.onboard}</div>}
      </div>

      <div style={{ ...S.quote, position: "relative" }}>
        <div style={{ width: `${pctA}%`, background: cfg.colorA, transition: "width .7s cubic-bezier(.34,1.3,.5,1)" }} />
        <div style={{ width: `${pctB}%`, background: cfg.colorB, transition: "width .7s cubic-bezier(.34,1.3,.5,1)" }} />
        <div style={{ ...S.winMark, left: `${winPct}%`, background: "#ffb84a" }} />
        <div style={{ ...S.winMark, left: `${100 - winPct}%`, background: "#ffb84a" }} />
        <div style={{ ...S.cursor, left: `${pctA}%` }} />
      </div>

      {!winner && goal && (
        <div className="goalGlint" style={{ ...S.goalBar, position: "relative" }}>
          <span style={S.goalIcon}>◎</span>
          <span>{t.goal(goal.need, isA ? cfg.a : cfg.b, goal.pct)}</span>
        </div>
      )}

      {holdSide && !winner && (
        <div className="holdBanner" style={{ ...S.holdBanner, borderColor: holdColor, position: "relative" }}>
          <div style={S.holdText}><strong style={{ color: holdColor }}>{holdSide === "a" ? cfg.a : cfg.b}</strong> {t.wins_in}</div>
          <div key={Math.floor(holdLeft / 1000)} className="holdNum" style={{ ...S.holdNum, color: holdColor }}>{fmtHMS(holdLeft)}</div>
          <div style={S.holdHint}>{t.drop_below}</div>
        </div>
      )}

      <div style={{ position: "relative" }}>
        <Board cells={cells} justWon={[]} cfg={cfg} imgA={imgA} imgB={imgB} tick={tick} dimmed={!!winner} />
      </div>

      <div style={{ ...S.byline ?? {}, position: "relative", textAlign: "center", fontFamily: FM, fontSize: 11, color: "#65626f", margin: "12px 0 14px" }}>
        {cfg.creator && <>por <strong>{cfg.creator}</strong> · 70/30</>}
      </div>

      {crews.length > 0 && (
        <div style={{ ...S.rank, position: "relative" }}>
          <div style={S.rankTitle}>{t.crew_head}</div>
          {crews.map((c, i) => (
            <div key={c.tag} style={S.rankRow}>
              <span style={S.rankPos}>{i + 1}</span>
              <span style={{ ...S.rankName, fontFamily: FD, fontWeight: 800, color: c.side === "a" ? cfg.colorA : cfg.colorB }}>⚑ {c.tag}</span>
              <span style={S.rankVal}>{c.points}</span>
            </div>
          ))}
        </div>
      )}

      {ranking.length > 0 && (
        <div style={{ ...S.rank, position: "relative" }}><div style={S.rankTitle}>{t.contributors}</div>{ranking.map((r, i) => (<div key={r.buyer_name} style={S.rankRow}><span style={S.rankPos}>{i + 1}</span><span style={S.rankName}>{r.buyer_name}</span><span style={S.rankVal}>{r.blocks}</span></div>))}</div>
      )}

      <div style={{ ...S.feed, position: "relative" }}>
        {feedItems.length === 0 ? <div style={S.feedEmpty}>{t.feed_empty}</div> : feedItems.map(f => (
          <div key={f.ts} className={f.tier >= 2 ? "cry2" : "feedItem"}
            style={{ ...S.feedItem, ...(f.tier >= 2 ? { ...S.feedTier2, borderColor: (f.side === "a" ? cfg.colorA : cfg.colorB) + "88" } : {}) }}>
            <span style={{ color: f.side === "a" ? cfg.colorA : cfg.colorB }}>{f.eternal ? "★" : "▲"}</span>
            {f.crew && <span style={{ ...S.crewTag, marginLeft: 6, color: f.side === "a" ? cfg.colorA : cfg.colorB }}>{f.crew}</span>}
            <strong style={{ margin: "0 5px" }}>{f.name}</strong>
            {f.eternal ? "★" : `+${f.qty}`} · {f.side === "a" ? cfg.a : cfg.b}
            {f.cry && <span style={{ ...S.feedCry, ...(f.tier >= 2 ? S.feedTier2Cry : {}) }}>“{f.cry}”</span>}
          </div>
        ))}
      </div>

      {!winner && (
        <>
          <div style={{ ...S.panel, position: "relative" }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t.your_name_map} maxLength={16} style={S.nameInput} />
            <div style={S.sides}>
              <button onClick={() => setSide("a")} style={{ ...S.sideBtn, ...(isA ? { borderColor: cfg.colorA, background: cfg.colorA + "1c", color: "#fff" } : {}) }}>{cfg.imgA && <img src={cfg.imgA} alt="" style={S.sideImg} />}{cfg.a}</button>
              <button onClick={() => setSide("b")} style={{ ...S.sideBtn, ...(!isA ? { borderColor: cfg.colorB, background: cfg.colorB + "1c", color: "#fff" } : {}) }}>{cfg.imgB && <img src={cfg.imgB} alt="" style={S.sideImg} />}{cfg.b}</button>
            </div>

            <div style={S.label}>{t.flair_label} · <span style={{ textTransform: "none", letterSpacing: 0 }}>{t.flair_hint}</span></div>
            <div style={S.flairRow}>
              {FLAIRS.map(f => (<button key={f} onClick={() => setFlair(f)} style={{ ...S.flairBtn, ...(flair === f ? S.flairOn : {}) }}>{f}</button>))}
            </div>

            <div style={S.label}>{myCrew ? t.crew_yours : t.crew_head}</div>
            {myCrew ? (
              <div style={S.crewMine}>
                <span style={{ ...S.crewMineTag, color: accent }}>⚑ {myCrew}</span>
                <span style={{ ...S.crewHint, flex: 1 }}>{t.crew_member(myCrew)}</span>
                <button onClick={() => { setMyCrew(null); saveProfile({ crew: null }); }} style={S.crewLeave}>{t.crew_leave}</button>
              </div>
            ) : (
              <div style={S.crewJoinRow}>
                <input value={crewInput} onChange={e => setCrewInput(normalizeCrewTag(e.target.value))} placeholder={t.crew_ph} maxLength={5} style={S.crewInput} />
                <button onClick={() => { const tag = normalizeCrewTag(crewInput); if (tag.length >= 2) { setMyCrew(tag); setCrewInput(""); saveProfile({ crew: tag }); } }} disabled={normalizeCrewTag(crewInput).length < 2} style={{ ...S.crewBtn, borderColor: accent, color: accent, opacity: normalizeCrewTag(crewInput).length < 2 ? .45 : 1 }}>⚑ {t.crew_join}</button>
              </div>
            )}
            <div style={{ ...S.crewHint, marginBottom: 14 }}>{t.crew_hint}</div>

            <div style={S.qtyRow}><span style={S.qtyNum}>{cur}{budget}<span style={S.qtyUnit}>{t.budget}</span></span><span style={S.qtyPrice}>{plan.count} {t.blocks}</span></div>
            <input type="range" min={2} max={100} step={2} value={budget} onChange={e => setBudget(+e.target.value)} style={{ ...S.range, accentColor: accent }} />
            {sideDom >= winPct && <div style={S.epic}>⚡ {t.win_banner_zone}</div>}
            {sideDom < winPct && priceFactor < 1 && <div style={S.handicapNote}>⬇ {t.discount(Math.round((1 - priceFactor) * 100))}</div>}
            <div style={S.planNote}>{t.plan_note(plan.count, isA ? cfg.b : cfg.a, plan.spent.toFixed(2), cur)}</div>

            {/* grito vai JUNTO da jogada (é gravado na transação) */}
            <div style={{ ...S.cryBox, marginTop: 12 }}>
              <div style={S.cryLabel}>📣 {t.cry_label}</div>
              <textarea value={cry} onChange={e => setCry(e.target.value)} placeholder={t.cry_ph} maxLength={CRY_MAX} rows={2} style={S.cryInput} />
              {(cfg.cries || []).filter(c => c && c.trim()).length > 0 && (
                <div style={S.cryChips}>
                  {(cfg.cries || []).filter(c => c && c.trim()).map((c, i) => (
                    <button key={i} onClick={() => setCry(c)} style={{ ...S.cryChip, ...(cry === c ? { borderColor: accent, color: "#fff" } : {}) }}>{c}</button>
                  ))}
                </div>
              )}
              <div style={S.cryTierNote}>{t.cry_tier2} · {t.cry_tier3}</div>
            </div>

            <div style={{ ...S.eternal, borderColor: accent + "66" }}>
              <div style={S.eternalHead}><div><div style={S.eternalTitle}><span style={{ color: accent }}>★</span> {t.eternal_title}</div><div style={S.eternalSub}>{t.eternal_sub}</div></div><div style={S.eternalScarce}><div style={{ ...S.eternalLeft, color: eternalLeft <= 10 ? "#ff5a4c" : accent }}>{eternalLeft}</div><div style={S.eternalCap}>de {duel?.eternal_cap ?? 50}</div></div></div>
              <button onClick={() => startBuy("eternal")} disabled={eternalLeft <= 0} style={{ ...S.eternalBtn, borderColor: accent, color: accent, opacity: eternalLeft <= 0 ? 0.4 : 1 }}>{eternalLeft <= 0 ? t.eternal_sold : `${t.eternal_title} · ${cur}${Number(duel?.eternal_price ?? ETERNAL_PRICE).toFixed(0)}`}</button>
            </div>
          </div>
          <div style={S.sticky}>
            <button onClick={() => startBuy("blocks")} className="payPulse" disabled={plan.count === 0} style={{ ...S.pay, background: accent, color: pickText(accent), boxShadow: `0 12px 38px -12px ${accent}`, opacity: plan.count === 0 ? 0.5 : 1 }}>
              <span>{t.move_by} {isA ? cfg.a : cfg.b}</span><span style={S.payAmt}>{cur}{plan.spent.toFixed(2)}</span>
            </button>
          </div>
        </>
      )}

      {winner && (
        <div style={S.winOverlay}><div className="winIn" style={S.winCard}>
          <div className="crown" style={{ ...S.crown, color: winner === "a" ? cfg.colorA : cfg.colorB }}>♛</div>
          <div style={S.winLabel}>{t.winner}</div>
          <div style={{ ...S.winName, color: winner === "a" ? cfg.colorA : cfg.colorB }}>{winner === "a" ? cfg.a : cfg.b}</div>
          <div style={S.winSub}>{t.sustained} · "{cfg.title}"</div>
          {cfg.victoryMsg && <div style={S.winMsg}>“{cfg.victoryMsg}”</div>}
          {ranking.length > 0 && <div style={S.winRank}><div style={S.rankTitle}>{t.podium}</div>{ranking.slice(0, 3).map((r, i) => (<div key={r.buyer_name} style={S.rankRow}><span style={S.rankPos}>{["①", "②", "③"][i]}</span><span style={S.rankName}>{r.buyer_name}</span><span style={S.rankVal}>{r.blocks}</span></div>))}</div>}
        </div></div>
      )}

      {hype && (
        <div style={{ ...S.hypeOverlay, background: (hype.side === "a" ? cfg.colorA : cfg.colorB) + "2e" }} onClick={() => setHype(null)}>
          <div className="hypeIn" style={S.hypeCard}>
            <div style={{ ...S.hypeAmt, color: hype.side === "a" ? cfg.colorA : cfg.colorB }}>{hype.eternal ? "★" : "▲"} {cur}{Number(hype.amount).toFixed(0)}</div>
            <div style={{ ...S.hypeName, color: hype.side === "a" ? cfg.colorA : cfg.colorB }}>{hype.name}</div>
            {hype.crew && <div style={{ ...S.hypeCrew, color: hype.side === "a" ? cfg.colorA : cfg.colorB }}>⚑ {hype.crew}</div>}
            <div style={{ ...S.hypeTitle, color: INK }}>{hype.eternal ? t.hype_eternal : t.hype_title}</div>
            {hype.cry && <div className="hypeCry" style={{ ...S.hypeCryTxt, color: INK }}>“{hype.cry}”</div>}
          </div>
        </div>
      )}

      {/* PAGAMENTO REAL — QR do gateway + espera do webhook */}
      {buy && (
        <div style={S.overlay} onClick={() => buy.phase === "qr" && setBuy(null)}>
          <div style={{ ...S.sheet, borderTop: `3px solid ${accent}` }} onClick={e => e.stopPropagation()}>
            {buy.phase === "creating" ? (
              <div style={{ textAlign: "center", padding: "26px 0" }}><div className="spin" style={{ ...S.spin, borderTopColor: accent }} /><p style={{ ...S.sheetP, marginTop: 14 }}>…</p></div>
            ) : buy.phase === "paid" ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}><div className="checkPop" style={{ ...S.check, background: accent, color: pickText(accent) }}>{buy.kind === "eternal" ? "★" : "▲"}</div><h3 style={S.sheetH}>{buy.kind === "eternal" ? t.eternal_done : t.territory_taken}</h3></div>
            ) : (
              <>
                <div style={S.grab} />
                <div style={S.sheetTop}><div><div style={{ fontFamily: "'Archivo Narrow'", fontWeight: 700, fontSize: 17, color: accent }}>{isA ? cfg.a : cfg.b}</div><div style={S.sheetMeta}>{cur}{Number(buy.gross).toFixed(2)} · {buy.gateway === "pix" ? "Pix" : "Card"}</div></div></div>
                {buy.gateway === "pix" ? (
                  <>
                    {buy.qrCodeUrl ? <img src={buy.qrCodeUrl} alt="QR Pix" style={{ ...S.qr, objectFit: "contain" }} /> : <div style={S.qr}><div style={S.qrInner} /></div>}
                    {buy.qrCode && <button onClick={() => { navigator.clipboard.writeText(buy.qrCode); show(t.copied); }} style={{ ...S.sheetCta, background: "#1a1722", color: INK, marginBottom: 10, border: `1px solid ${LINE}` }}>{t.pix_copy}</button>}
                    <p style={{ ...S.sheetP, textAlign: "center", marginBottom: 12 }}>{t.pay_pix} · {t.processing}</p>
                  </>
                ) : (
                  <>
                    {/* internacional: checkout hospedado do Stripe no idioma do comprador */}
                    <a href={buy.checkoutUrl} target="_blank" rel="noopener noreferrer"
                      style={{ ...S.sheetCta, background: accent, color: pickText(accent), display: "block", textAlign: "center", textDecoration: "none", marginBottom: 10 }}>{t.card_btn}</a>
                    <p style={{ ...S.sheetP, textAlign: "center", marginBottom: 12 }}>{t.card_note}</p>
                  </>
                )}
                {buy.kind === "eternal" && <p style={S.term}>{bold(t.term)}</p>}
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

const Shell = ({ children }) => (
  <div style={{ ...S.proot, background: BG, display: "grid", placeItems: "center" }}>
    <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
    {children}
  </div>
);

const ST = {
  center: { color: DIM, fontFamily: FM, fontSize: 13, textAlign: "center" },
  setupCard: { background: "#131119", border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, maxWidth: 420, textAlign: "center" },
  setupTxt: { color: DIM, fontSize: 13, lineHeight: 1.6, marginTop: 14 },
  code: { fontFamily: FM, fontSize: 11, background: "#0b0910", padding: "2px 6px", borderRadius: 5, color: "#c4c1cd" },
};
