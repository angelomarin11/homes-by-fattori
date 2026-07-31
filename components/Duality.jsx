"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";

// ============================================================================
//  DUALITY v2 — gamificação social
//  · GRITO DE GUERRA: cada jogada pode vir com uma frase; quanto maior o
//    gasto, maior o palco (mural → destaque → tela inteira). O dinheiro
//    continua comprando BLOCOS — o grito é o palco que vem junto.
//  · EQUIPES: tag de time no mapa e ranking próprio. Status, nunca payout.
//  · MODO TRANSMISSÃO: tela limpa pra OBS com QR — feito pra streamers.
//  · EMBLEMAS + SKINS: personalização do jogador e do criador.
//  · COMBO e META COLETIVA: momentum visível, propósito pra gastos pequenos.
//  Mecânica econômica intacta (dobra/handicap/vitória 24h/Eterno · split 70/30).
//  Sem atividade fabricada: fora da demo rotulada, todo movimento é pago.
// ============================================================================

import {
  GRID, BASE, WIN_PCT, HOLD_HOURS, ETERNAL_PRICE, ETERNAL_CAP, SPLIT,
  CRY_MAX, cryTier, COMBO_WINDOW_MS, MIN_BUY, AMOUNT_PRESETS,
  FLAIRS, normalizeCrewTag, nextGoal, skinOf, SKINS,
} from "./duality/rules";
import { DICT, MONEY, LangCtx, useT, detectLang, bold } from "./duality/i18n";
import { S, CSS, FONTS, FD, FM, BG, INK, DIM, pickText, fmtHMS } from "./duality/theme";
import Board from "./duality/Board";
import Tv from "./duality/Tv";

/* ---------------- App ---------------- */
// Exemplo padrão: GATOS vs CACHORROS — universal, emocional, memeável e seguro
// (sem religião, sem marca registrada, sem risco com gateway). Ver CONCEITO.md.
const DEFAULT = {
  title: "Gatos vs Cachorros", a: "Gatos", b: "Cachorros",
  emojiA: "🐱", emojiB: "🐶",
  colorA: "#7C5CFF", colorB: "#FF9F1C", imgA: null, imgB: null,
  creator: "Duds Live",
  skin: "carvao",
  cries: ["Miau! 🐱", "Au au! 🐶", "Hoje tem virada"],
  victoryMsg: "",
};

export default function Duality() {
  const [lang, setLang] = useState("pt");
  useEffect(() => { setLang(detectLang()); }, []);
  // v3: a rota crítica abre NO produto — home primeiro; trailer é opcional
  const [screen, setScreen] = useState("home");
  const [playSide, setPlaySide] = useState(null);
  const [cfg, setCfg] = useState(DEFAULT);
  const t = DICT[lang]; const money = MONEY[lang];
  return (
    <LangCtx.Provider value={{ t, lang, setLang, money }}>
      {screen === "trailer" ? <Trailer onEnter={() => setScreen("home")} />
        : screen === "home" ? <Home cfg={cfg} onCreate={() => setScreen("create")} onPlay={(side) => { setPlaySide(side || null); setScreen("play"); }} onReplay={() => setScreen("trailer")} />
          : screen === "create" ? <Create cfg={cfg} setCfg={setCfg} onLaunch={() => setScreen("play")} />
            : <Play cfg={cfg} initialSide={playSide} onBack={() => setScreen("home")} />}
    </LangCtx.Provider>
  );
}

/* ---------------- TRAILER cinematográfico ---------------- */
const T_GRID = 22, TA = "#7C5CFF", TB = "#FF9F1C";
const T_NAMES_A = ["Maria", "João", "Ana", "Gabriel", "Sofia", "Rafael"];
function Trailer({ onEnter }) {
  const { t } = useT();
  const [phase, setPhase] = useState("intro");
  const [cells, setCells] = useState(() => Array.from({ length: T_GRID * T_GRID }, (_, i) => (i % T_GRID) < T_GRID / 2 ? "a" : "b"));
  const [flash, setFlash] = useState([]);
  const [feed, setFeed] = useState([]);
  const [pa, setPa] = useState(50);
  const [winner, setWinner] = useState(null);
  const target = useRef(50);
  const pctA = Math.round(cells.filter(c => c === "a").length / cells.length * 100);

  useEffect(() => {
    const tm = [];
    tm.push(setTimeout(() => setPhase("battle"), 2200));
    tm.push(setTimeout(() => { target.current = 85; }, 2800));
    tm.push(setTimeout(() => { setPhase("win"); setWinner("a"); }, 8500));
    tm.push(setTimeout(() => setPhase("fadeout"), 10500));
    tm.push(setTimeout(() => onEnter(), 11300));
    return () => tm.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase !== "battle") return;
    const iv = setInterval(() => {
      setPa(p => p + (target.current - p) * 0.08);
      setCells(prev => {
        const next = [...prev];
        const cand = [...next.keys()].filter(i => next[i] === "b").sort((x, y) => Math.abs((x % T_GRID) - T_GRID / 2) - Math.abs((y % T_GRID) - T_GRID / 2));
        const take = cand.slice(0, 2 + (Math.random() * 3 | 0)); const fl = [];
        take.forEach(i => { next[i] = "a"; fl.push(i); });
        if (fl.length) { setFlash(fl); setTimeout(() => setFlash([]), 400); }
        return next;
      });
      const nm = T_NAMES_A[Math.random() * T_NAMES_A.length | 0];
      setFeed(f => [{ name: nm, side: "a", qty: 2 + (Math.random() * 6 | 0), ts: Date.now() + Math.random() }, ...f].slice(0, 4));
    }, 600);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <div style={S.troot} className={phase === "fadeout" ? "trailerOut" : ""}><style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div style={{ ...S.aurora, background: SKINS.carvao.aurora }} />
      <button onClick={onEnter} style={S.skip}>{t.skip} →</button>

      <div className={phase === "intro" ? "logoIn" : ""} style={S.tLogoWrap}>
        <div style={S.tLogo}>DUAL<span style={{ color: "#ff3b6b" }}>·</span>ITY</div>
        <div style={S.tTagline}>{t.tagline}</div>
      </div>

      {phase === "intro" && (
        <div style={S.introMatch}>
          <div className="sideInL" style={{ ...S.introSide, color: TA }}><div style={S.introEmoji}>🐱</div>GATOS</div>
          <div className="vsIn" style={S.introVs}>VS</div>
          <div className="sideInR" style={{ ...S.introSide, color: TB }}><div style={S.introEmoji}>🐶</div>CACHORROS</div>
        </div>
      )}

      {(phase === "battle" || phase === "win") && (
        <div className="boardFade" style={{ position: "relative" }}>
          <div style={S.scoreRow}>
            <div style={{ textAlign: "left" }}><div style={{ ...S.scoreName, color: TA }}>Gatos</div><div key={"a" + pctA} className="num" style={{ ...S.scorePct, color: TA }}>{pctA}%</div></div>
            <div style={{ textAlign: "right" }}><div style={{ ...S.scoreName, color: TB }}>Cachorros</div><div key={"b" + pctA} className="num" style={{ ...S.scorePct, color: TB }}>{100 - pctA}%</div></div>
          </div>
          <div style={S.quote}>
            <div style={{ width: `${pa}%`, background: TA, transition: "width .6s ease" }} />
            <div style={{ width: `${100 - pa}%`, background: TB, transition: "width .6s ease" }} />
            <div style={{ ...S.cursor, left: `${pa}%` }} />
          </div>
          <div style={S.tBoardWrap}>
            <div style={{ ...S.tBoard, gridTemplateColumns: `repeat(${T_GRID},1fr)` }}>
              {cells.map((c, i) => <div key={i} className={flash.includes(i) ? "flash" : ""} style={{ background: c === "a" ? TA : TB }} />)}
            </div>
          </div>
          <div style={S.tFeed}>
            {feed.map(f => (<div key={f.ts} className="feedItem" style={S.tFeedItem}><span style={{ color: TA }}>▲</span><strong style={{ margin: "0 5px" }}>{f.name}</strong> +{f.qty}</div>))}
          </div>
        </div>
      )}

      {phase === "win" && winner && (
        <div className="winIn" style={S.tWinOverlay}>
          <div className="crown" style={{ ...S.tCrown, color: TA }}>♛</div>
          <div style={S.tWinLabel}>{t.winner}</div>
          <div style={{ ...S.tWinName, color: TA }}>GATOS</div>
          <button onClick={onEnter} style={S.tEnterBtn}>{t.home_cta_play}</button>
        </div>
      )}

      <div style={S.demoTag}>● {t.home_demo_badge}</div>
    </div>
  );
}

/* ---------------- HOME (demo honesta, rotulada) ---------------- */
// A batalha aparece EM MOVIMENTO nos primeiros segundos — mini-tabuleiro vivo,
// rotulado como demonstração, sem bloquear o CTA.
const MB_COLS = 16, MB_ROWS = 9, MB_N = MB_COLS * MB_ROWS;
// Elenco fixo da encenação: os mesmos nomes lutam, viram e entram pro monumento.
const MB_CAST_A = ["Maria", "Ana", "Bia", "Duda"];
const MB_CAST_B = ["Pedro", "Lucas", "João", "Rafa"];
const MB_EVEN = () => Array.from({ length: MB_N }, (_, i) => (i % MB_COLS) < MB_COLS / 2 ? "a" : "b");
// A demo conta o experimento INTEIRO, em loop: ATO 1 a escolha (50/50) →
// ATO 2 a guerra com virada roteirizada (Gatos avançam, Cachorros viram) →
// ATO 3 o clímax (80% dominado, contagem 3·2·1) → monumento com os nomes →
// recomeça. Começo, meio e fim — ninguém precisa imaginar como termina.
function MiniBattle() {
  const { t } = useT();
  const [cells, setCells] = useState(MB_EVEN);
  const [act, setAct] = useState(1);          // 1 escolha · 2 guerra · 3 clímax · 4 monumento
  const [count, setCount] = useState(3);
  const [painters, setPainters] = useState([]);
  const cellsRef = useRef(null);
  const totals = useRef({});                  // nome → blocos pintados (vira o monumento)
  useEffect(() => {
    let alive = true;
    const timers = [];
    const later = (fn, ms) => { timers.push(setTimeout(() => { if (alive) fn(); }, ms)); };
    let step = 0;
    const war = () => {
      const s = step++;
      // roteiro da virada: Gatos empurram até ~66%… e os Cachorros tomam tudo até 84%
      const targetA = s < 9 ? 66 : 16;
      const next = [...cellsRef.current];
      const pctA = next.filter(c => c === "a").length / MB_N * 100;
      if (pctA > targetA + 1 || pctA < targetA - 1) {
        const me = pctA < targetA ? "a" : "b", opp = me === "a" ? "b" : "a";
        const cand = [...next.keys()].filter(i => next[i] === opp)
          .sort((x, y) => Math.abs((x % MB_COLS) - MB_COLS / 2) - Math.abs((y % MB_COLS) - MB_COLS / 2));
        const take = cand.slice(0, 3 + (s % 3));
        take.forEach(i => { next[i] = me; });
        cellsRef.current = next; setCells(next);
        if (take.length) {
          const cast = me === "a" ? MB_CAST_A : MB_CAST_B;
          const nm = cast[s % cast.length];
          totals.current[nm] = (totals.current[nm] || 0) + take.length;
          setPainters(p => [{ nm, side: me, n: take.length, ts: s }, ...p].slice(0, 2));
        }
      } else if (s >= 9) {
        // 80%+ dominado — ATO 3: contagem pra vitória, depois o monumento
        setAct(3); setCount(3);
        later(() => setCount(2), 1000);
        later(() => setCount(1), 2000);
        later(() => setAct(4), 3000);
        later(play, 9500);
        return;
      }
      later(war, 460);
    };
    const play = () => {
      step = 0; totals.current = {};
      cellsRef.current = MB_EVEN();
      setCells(cellsRef.current); setPainters([]); setCount(3); setAct(1);
      later(() => { setAct(2); war(); }, 3200);
    };
    play();
    return () => { alive = false; timers.forEach(clearTimeout); };
  }, []);
  const pctA = Math.round(cells.filter(c => c === "a").length / MB_N * 100);
  const top3 = Object.entries(totals.current).sort((x, y) => y[1] - x[1]).slice(0, 3);
  const actLine = act === 1 ? t.demo_act1 : act === 2 ? t.demo_act2 : act === 3 ? t.demo_act3(count) : null;
  return (
    <>
      <div key={act === 3 ? "c" + count : "act" + act} className="feedItem"
        style={{ textAlign: "center", fontFamily: FM, fontSize: 11, letterSpacing: .4, minHeight: 16, marginBottom: 6, color: act === 3 ? "#FF9F1C" : "#8b8799", fontWeight: act === 3 ? 700 : 400 }}>
        {actLine}
      </div>
      <div style={S.homeDemoMkt}>
        <span style={{ color: "#7C5CFF", fontFamily: FM, fontWeight: 700, fontSize: 24 }}>🐱 {pctA}%</span>
        <span style={{ color: DIM, fontSize: 12, fontFamily: FM }}>Gatos × Cachorros</span>
        <span style={{ color: "#FF9F1C", fontFamily: FM, fontWeight: 700, fontSize: 24 }}>{100 - pctA}% 🐶</span>
      </div>
      {act === 4 ? (
        /* ATO FINAL — o monumento: vencedor + nomes cravados na história */
        <div className="winIn" style={{ aspectRatio: `${MB_COLS}/${MB_ROWS}`, margin: "10px 0", borderRadius: 10, border: "1px solid rgba(255,159,28,.4)", background: "radial-gradient(ellipse at 50% 0%, rgba(255,159,28,.14), transparent 65%), #12101a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 7, padding: 10 }}>
          <div style={{ fontFamily: FD, fontWeight: 800, fontSize: "clamp(17px,4.6vw,24px)", color: "#FF9F1C", letterSpacing: .5 }}>{t.demo_winner("Cachorros")} 🐶</div>
          <div style={{ fontFamily: FM, fontSize: 10.5, color: DIM, letterSpacing: .5 }}>{t.demo_history}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {top3.map(([nm, n], i) => (
              <div key={nm} style={{ fontFamily: FM, fontSize: 12, color: "#e8e6ef" }}>
                {["🥇", "🥈", "🥉"][i]} <strong>{nm}</strong> · {n} 🖌️
              </div>
            ))}
          </div>
          <div style={{ fontFamily: FM, fontSize: 10.5, color: "#8b8799" }}>{t.demo_next}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${MB_COLS},1fr)`, borderRadius: 10, overflow: "hidden", margin: "10px 0", aspectRatio: `${MB_COLS}/${MB_ROWS}`, ...(act === 3 ? { boxShadow: "0 0 0 2px #FF9F1C" } : {}) }}>
          {cells.map((c, i) => <div key={i} style={{ background: c === "a" ? "#7C5CFF" : "#FF9F1C", transition: "background .35s" }} />)}
        </div>
      )}
      <div style={{ ...S.quote, margin: 0, height: 10 }}>
        <div style={{ width: `${pctA}%`, background: "#7C5CFF", transition: "width .5s ease" }} />
        <div style={{ width: `${100 - pctA}%`, background: "#FF9F1C", transition: "width .5s ease" }} />
        <div style={{ ...S.cursor, left: `${pctA}%`, height: 16 }} />
      </div>
      {/* nomes sendo cravados AO VIVO — a promessa central, visível */}
      <div style={{ minHeight: 46, marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        {painters.map(p => (
          <div key={p.ts} className="feedItem" style={{ fontFamily: FM, fontSize: 11, color: "#c4c1cd" }}>
            ✍️ <strong style={{ color: p.side === "a" ? "#7C5CFF" : "#FF9F1C" }}>{p.nm}</strong> {t.demo_paint(p.n)} {p.side === "a" ? "🐱" : "🐶"}
          </div>
        ))}
      </div>
    </>
  );
}

function Home({ cfg, onCreate, onPlay, onReplay }) {
  const { t } = useT();
  const pick = (side) => { try { localStorage.setItem("duality_welcome", "1"); } catch {} onPlay(side); };
  return (
    <div style={S.root}><style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div style={{ ...S.wrap, paddingTop: 20 }}>
        <div style={S.topRow}><div style={S.brand}>DUALITY</div><LangPicker /></div>
        <div style={{ ...S.homeHero, margin: "18px 0 14px" }}>
          <h1 style={S.homeH1}>{cfg.a} {t.or_word} {cfg.b}?</h1>
          <p style={S.homeLead}>{t.home_prove}</p>
        </div>
        {/* a home JÁ É a primeira jogada: escolher o lado é um toque */}
        <div style={{ ...S.eyebrow, textAlign: "center", marginBottom: 10 }}>{t.pick_a_side_label}</div>
        <div style={S.sideBigRow}>
          <button className="sideBig" onClick={() => pick("a")} style={{ ...S.sideBig, background: cfg.colorA, color: pickText(cfg.colorA), boxShadow: `0 14px 44px -14px ${cfg.colorA}` }}>
            <span style={S.sideBigEmoji}>{cfg.emojiA || "◆"}</span>{cfg.a}
          </button>
          <button className="sideBig" onClick={() => pick("b")} style={{ ...S.sideBig, background: cfg.colorB, color: pickText(cfg.colorB), boxShadow: `0 14px 44px -14px ${cfg.colorB}` }}>
            <span style={S.sideBigEmoji}>{cfg.emojiB || "◆"}</span>{cfg.b}
          </button>
        </div>
        <div style={S.homeDemo}>
          <div style={S.homeDemoBadge}>{t.home_demo_badge}</div>
          <MiniBattle />
        </div>
        <button style={S.homeCtaAlt} onClick={onCreate}>➕ {t.home_cta_create}</button>
        {/* 3 verdades, em linguagem de gente — nada de jargão de mecânica */}
        <div style={S.homeFeatures}>
          {[t.home_f1, t.home_f2, t.home_f3].map((f, i) => (
            <div key={i} style={{ ...S.homeFeature, fontSize: 15 }}><span style={S.homeFeatureIcon}>{["💰", "✍️", "🏆"][i]}</span>{f}</div>
          ))}
        </div>
        {/* PARA STREAMERS — OBS e TikTok Live */}
        <div style={{ ...S.homeDemo, marginTop: 20, marginBottom: 0 }}>
          <div style={{ ...S.homeDemoBadge, color: "#ff5a4c" }}>📺 {t.streamer_head}</div>
          <p style={{ fontSize: 13.5, color: "#c4c1cd", lineHeight: 1.5, textAlign: "center" }}>{t.streamer_text}</p>
        </div>
        <button onClick={onReplay} style={S.replayLink}>↺ {t.replay}</button>
      </div>
    </div>
  );
}

// texto em vez de emoji de bandeira: Windows não renderiza 🇧🇷🇺🇸🇪🇸 (vira caixa)
function LangPicker() {
  const { lang, setLang } = useT();
  return (
    <div style={S.langPick}>
      {Object.values(DICT).map(d => (
        <button key={d.code} onClick={() => setLang(d.code)} title={d.name}
          style={{ ...S.langBtn, ...(lang === d.code ? S.langOn : {}) }}>{d.code.toUpperCase()}</button>
      ))}
    </div>
  );
}

/* ---------------- ESTÚDIO DO CRIADOR ---------------- */
function Create({ cfg, setCfg, onLaunch }) {
  const { t, money } = useT();
  const fA = useRef(), fB = useRef();
  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));
  const setCry = (i, v) => setCfg(c => { const cries = [...c.cries]; cries[i] = v; return { ...c, cries }; });
  const up = (k, file) => { if (!file) return; if (file.size > 2e6) { alert("máx 2MB"); return; } const r = new FileReader(); r.onload = () => set(k, r.result); r.readAsDataURL(file); };
  const ready = cfg.title.trim() && cfg.a.trim() && cfg.b.trim();
  // simulador de ganhos
  const [simPeople, setSimPeople] = useState(100);
  const [simAvg, setSimAvg] = useState(10);
  const simGross = simPeople * simAvg;
  return (
    <div style={S.root}><style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div style={S.wrap}>
        <div style={S.topRow}><div style={S.eyebrow}>{t.create_eyebrow}</div><LangPicker /></div>
        <h1 style={S.h1}>{t.create_h1}</h1>
        <p style={S.lead}>{t.create_lead}</p>
        <div style={S.preview}>
          <div style={S.previewTitle}>{cfg.title || t.name_field}</div>
          <div style={S.previewMkt}>
            <div style={S.pSide}>{cfg.imgA && <img src={cfg.imgA} alt="" style={S.pImg} />}<span style={{ ...S.pName, color: cfg.colorA }}>{cfg.a || t.side_a}</span></div>
            <div style={S.pVs}>×</div>
            <div style={{ ...S.pSide, justifyContent: "flex-end" }}><span style={{ ...S.pName, color: cfg.colorB }}>{cfg.b || t.side_b}</span>{cfg.imgB && <img src={cfg.imgB} alt="" style={S.pImg} />}</div>
          </div>
          <div style={S.previewBar}><div style={{ width: "50%", background: cfg.colorA }} /><div style={{ width: "50%", background: cfg.colorB }} /></div>
        </div>
        <Fld label={t.name_field}><input style={S.input} value={cfg.title} maxLength={42} onChange={e => set("title", e.target.value)} /></Fld>
        <div style={S.row}><Fld label={t.side_a}><input style={S.input} value={cfg.a} maxLength={20} onChange={e => set("a", e.target.value)} /></Fld><Fld label={t.side_b}><input style={S.input} value={cfg.b} maxLength={20} onChange={e => set("b", e.target.value)} /></Fld></div>

        {/* v3.1: criar é SÓ isso — o botão vem antes da personalização */}
        <button style={{ ...S.launch, opacity: ready ? 1 : 0.45 }} disabled={!ready} onClick={onLaunch}>{t.launch}</button>
        <p style={{ ...S.note, marginBottom: 18 }}>{t.create_easy}</p>

        <details className="howBox" style={{ ...S.studioCard, marginBottom: 18 }}>
        <summary style={S.label}>{t.customize}</summary>
        <div style={{ marginTop: 14 }}>
        <div style={S.row}><Fld label={`${t.color} A`}><div style={S.colorRow}><input type="color" value={cfg.colorA} onChange={e => set("colorA", e.target.value)} style={S.color} /><span style={S.hex}>{cfg.colorA}</span></div></Fld><Fld label={`${t.color} B`}><div style={S.colorRow}><input type="color" value={cfg.colorB} onChange={e => set("colorB", e.target.value)} style={S.color} /><span style={S.hex}>{cfg.colorB}</span></div></Fld></div>
        <div style={S.row}>
          <Fld label={`${t.img} A`}><button style={S.up} onClick={() => fA.current.click()}>{cfg.imgA ? t.change : t.upload}</button><input ref={fA} type="file" accept="image/*" hidden onChange={e => up("imgA", e.target.files[0])} />{cfg.imgA && <button style={S.clear} onClick={() => set("imgA", null)}>{t.remove}</button>}</Fld>
          <Fld label={`${t.img} B`}><button style={S.up} onClick={() => fB.current.click()}>{cfg.imgB ? t.change : t.upload}</button><input ref={fB} type="file" accept="image/*" hidden onChange={e => up("imgB", e.target.files[0])} />{cfg.imgB && <button style={S.clear} onClick={() => set("imgB", null)}>{t.remove}</button>}</Fld>
        </div>
        <Fld label={t.your_name}><input style={S.input} value={cfg.creator} maxLength={30} onChange={e => set("creator", e.target.value)} /></Fld>

        {/* VISUAL DA ARENA */}
        <Fld label={t.skin_label}>
          <div style={{ ...S.skinRow, width: "100%" }}>
            {[["carvao", t.skin_carvao], ["neon", t.skin_neon], ["ouro", t.skin_ouro]].map(([k, label]) => (
              <button key={k} onClick={() => set("skin", k)} style={{ ...S.skinChip, ...(cfg.skin === k ? S.skinChipOn : {}) }}>{label}</button>
            ))}
          </div>
        </Fld>

        {/* GRITOS PRONTOS */}
        <div style={S.studioCard}>
          <div style={S.label}>{t.cries_label}</div>
          {cfg.cries.map((c, i) => (
            <input key={i} style={{ ...S.input, marginBottom: 8 }} value={c} maxLength={CRY_MAX}
              placeholder={t.cry_preset_ph(i + 1)} onChange={e => setCry(i, e.target.value)} />
          ))}
          <div style={S.studioHint}>{t.cries_hint}</div>
        </div>

        {/* MENSAGEM DE VITÓRIA */}
        <Fld label={t.victory_label}>
          <input style={S.input} value={cfg.victoryMsg} maxLength={90} placeholder={t.victory_ph} onChange={e => set("victoryMsg", e.target.value)} />
        </Fld>

        {/* SIMULADOR DE GANHOS */}
        <div style={S.studioCard}>
          <div style={S.label}>{t.earn_title}</div>
          <div style={S.earnRow}>
            <span style={S.earnSmall}>{simPeople} {t.earn_people} × {money.cur}{simAvg} {t.earn_avg}</span>
            <span style={S.earnSmall}>{money.cur}{simGross.toLocaleString()}</span>
          </div>
          <input type="range" min={20} max={2000} step={20} value={simPeople} onChange={e => setSimPeople(+e.target.value)} style={{ ...S.range, accentColor: "#5ad07a" }} />
          <input type="range" min={2} max={100} step={2} value={simAvg} onChange={e => setSimAvg(+e.target.value)} style={{ ...S.range, accentColor: "#5ad07a" }} />
          <div style={{ ...S.earnRow, marginTop: 10 }}>
            <span style={S.earnLabel}>{t.earn_you} ({SPLIT.creator}%)</span>
            <span style={S.earnBig}>{money.cur}{Math.round(simGross * SPLIT.creator / 100).toLocaleString()}</span>
          </div>
          <div style={S.earnRow}>
            <span style={S.earnLabel}>{t.earn_platform} ({SPLIT.platform}%)</span>
            <span style={S.earnSmall}>{money.cur}{Math.round(simGross * SPLIT.platform / 100).toLocaleString()}</span>
          </div>
          <div style={S.studioHint}>{t.earn_note}</div>
        </div>

        <div style={S.tip}>{bold(t.tip.replace(`${BASE}`, `${money.cur}${BASE}`))}</div>
        </div>
        </details>
        <p style={S.note}>{t.saved_note}</p>
      </div>
    </div>
  );
}
const Fld = ({ label, children }) => (<div style={{ marginBottom: 15 }}><div style={S.label}>{label}</div><div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{children}</div></div>);

/* ---------------- JOGAR ---------------- */
function Play({ cfg, initialSide, onBack }) {
  const { t, money } = useT();
  const cur = money.cur;
  const [cells, setCells] = useState(() => { const o = {}; for (let p = 0; p < GRID * GRID; p++) o[p] = { side: (p % GRID) < GRID / 2 ? "a" : "b", name: null, price: BASE, flair: null }; return o; });
  const [side, setSide] = useState(initialSide === "b" ? "b" : "a");
  const [budget, setBudget] = useState(10);
  const [name, setName] = useState("");
  const [flair, setFlair] = useState(FLAIRS[0]);
  const [mode, setMode] = useState("normal");
  const [flow, setFlow] = useState(null);
  const [feed, setFeed] = useState([]);
  const [toast, setToast] = useState(null);
  const [justWon, setJustWon] = useState([]);
  const [eternals, setEternals] = useState([]);
  const [scores, setScores] = useState({});
  const [share, setShare] = useState(false);
  const [tick, setTick] = useState(0);
  const [bump, setBump] = useState(0);
  const [winner, setWinner] = useState(null);
  const [holdSide, setHoldSide] = useState(null);
  const [holdDeadline, setHoldDeadline] = useState(0);
  const [holdLeft, setHoldLeft] = useState(0);
  const [freeTries, setFreeTries] = useState(1);
  const [welcome, setWelcome] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem("duality_welcome")) setWelcome(true); } catch {} }, []);
  // v2
  const [cry, setCry] = useState("");
  const [crews, setCrews] = useState({});          // TAG -> { tag, side, points }
  const [myCrew, setMyCrew] = useState(null);
  const [crewInput, setCrewInput] = useState("");
  const [combo, setCombo] = useState(0);
  const comboTimer = useRef(null);
  const [hype, setHype] = useState(null);          // { name, crew, cry, amount, side, eternal }
  const [floatN, setFloatN] = useState(0);
  const [tv, setTv] = useState(false);
  const imgA = useRef(null), imgB = useRef(null);

  useEffect(() => { imgA.current = null; imgB.current = null; if (cfg.imgA) { const i = new Image(); i.onload = () => { imgA.current = i; setTick(t => t + 1); }; i.src = cfg.imgA; } if (cfg.imgB) { const i = new Image(); i.onload = () => { imgB.current = i; setTick(t => t + 1); }; i.src = cfg.imgB; } }, [cfg.imgA, cfg.imgB]);

  const total = GRID * GRID;
  let cA = 0; for (let p = 0; p < total; p++) if (cells[p].side === "a") cA++;
  const pctA = Math.round((cA / total) * 100), pctB = 100 - pctA;
  const haptic = m => { try { navigator.vibrate?.(m); } catch {} };
  const show = m => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const sideDom = side === "a" ? pctA : pctB;
  const sideCount = side === "a" ? cA : total - cA;
  const inWinZone = sideDom >= WIN_PCT;
  const behind = Math.max(0, 50 - sideDom);
  const handicap = 1 - Math.min(0.5, behind / 100);
  const zoneMult = sideDom >= 80 ? 2 : 1;
  const priceFactor = inWinZone ? zoneMult : handicap;
  const goal = nextGoal(sideDom, sideCount, total);

  const plan = useMemo(() => {
    if (winner) return { list: [], spent: 0, count: 0 };
    const opp = side === "a" ? "b" : "a"; const targets = [];
    for (let p = 0; p < total; p++) { if (cells[p].eternal) continue; if (cells[p].side === opp) { const cost = +(cells[p].price * priceFactor).toFixed(2); targets.push({ p, cost }); } }
    targets.sort((x, y) => x.cost - y.cost || (Math.abs((x.p % GRID) - GRID / 2) - Math.abs((y.p % GRID) - GRID / 2)));
    let spent = 0; const list = [];
    for (const tt of targets) { if (spent + tt.cost > budget + 1e-9) continue; spent += tt.cost; list.push(tt); }
    return { list, spent: +spent.toFixed(2), count: list.length };
  }, [cells, side, budget, priceFactor, winner, total]);

  function bumpCombo() {
    setCombo(c => c + 1);
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setCombo(0), COMBO_WINDOW_MS);
  }
  useEffect(() => () => { if (comboTimer.current) clearTimeout(comboTimer.current); }, []);

  function applyBuy(list, who, crewTag) {
    setCells(prev => { const next = { ...prev }; list.forEach(({ p }) => { next[p] = { ...next[p], side, name: who, flair, price: +(next[p].price * 2).toFixed(2) }; }); return next; });
    setScores(s => ({ ...s, [who]: (s[who] || 0) + list.length }));
    if (crewTag) setCrews(c => ({ ...c, [crewTag]: { ...(c[crewTag] || { tag: crewTag, side }), points: (c[crewTag]?.points || 0) + list.length } }));
    setJustWon(list.map(x => x.p)); setTimeout(() => setJustWon([]), 1000); setBump(b => b + 1);
    setFloatN(0); setTimeout(() => setFloatN(list.length), 30); setTimeout(() => setFloatN(0), 1200);
  }

  // VALIDAÇÃO 24h — na produção o deadline vive no servidor (ver check-wins)
  useEffect(() => {
    if (winner) return;
    const leader = pctA >= WIN_PCT ? "a" : pctB >= WIN_PCT ? "b" : null;
    if (!leader) { if (holdSide) { setHoldSide(null); setHoldDeadline(0); } return; }
    if (leader !== holdSide) { setHoldSide(leader); setHoldDeadline(Date.now() + HOLD_HOURS * 3600 * 1000); }
  }, [pctA, pctB, winner]);
  useEffect(() => {
    if (!holdSide || winner) return;
    const iv = setInterval(() => {
      const left = holdDeadline - Date.now();
      setHoldLeft(Math.max(0, left));
      if (left <= 0) { setWinner(holdSide); clearInterval(iv); }
    }, 1000);
    return () => clearInterval(iv);
  }, [holdSide, holdDeadline, winner]);

  function freeTry() {
    if (freeTries <= 0 || winner) return; setFreeTries(n => n - 1);
    const opp = side === "a" ? "b" : "a"; const cand = [];
    for (let p = 0; p < total; p++) if (!cells[p].eternal && cells[p].side === opp) cand.push(p);
    cand.sort((a, b) => Math.abs((a % GRID) - GRID / 2) - Math.abs((b % GRID) - GRID / 2));
    applyBuy(cand.slice(0, 3).map(p => ({ p })), name.trim() || t.your_name.toLowerCase(), null); haptic(12);
  }
  function joinCrew() {
    const tag = normalizeCrewTag(crewInput);
    if (tag.length < 2) return;
    setCrews(c => c[tag] ? c : { ...c, [tag]: { tag, side, points: 0 } });
    setMyCrew(tag); setCrewInput(""); haptic(10);
  }
  function openBuy(m) { if (winner) return; setMode(m); setFlow("qr"); haptic(10); }
  function confirm() {
    setFlow("processing"); haptic(20);
    setTimeout(() => {
      const fn = (name.trim() || "Anon").slice(0, 16);
      const cryTxt = cry.trim().slice(0, CRY_MAX) || null;
      const spent = mode === "eternal" ? ETERNAL_PRICE : plan.spent;
      const tier = mode === "eternal" ? 3 : cryTier(spent);
      if (mode === "eternal") {
        setCells(prev => { const next = { ...prev }; let best = -1, bs = Infinity; for (let p = 0; p < total; p++) { if (next[p].eternal) continue; const d = Math.abs((p % GRID) - GRID / 2) + Math.abs(((p / GRID) | 0) - GRID / 2); if (d < bs) { bs = d; best = p; } } if (best >= 0) { next[best] = { side, name: fn, eternal: true, price: Infinity, flair }; setEternals(e => [...e, fn]); setJustWon([best]); setTimeout(() => setJustWon([]), 1400); } return next; });
        setScores(s => ({ ...s, [fn]: (s[fn] || 0) + 5 }));
        if (myCrew) setCrews(c => ({ ...c, [myCrew]: { ...(c[myCrew] || { tag: myCrew, side }), points: (c[myCrew]?.points || 0) + 5 } }));
        setFeed(f => [{ name: fn, qty: "★", side, ts: Date.now(), me: true, eternal: true, cry: cryTxt, tier: 3, crew: myCrew }, ...f].slice(0, 8));
      } else {
        applyBuy(plan.list, fn, myCrew);
        setFeed(f => [{ name: fn, qty: plan.count, side, ts: Date.now(), me: true, cry: cryTxt, tier, crew: myCrew }, ...f].slice(0, 8));
      }
      bumpCombo();
      if (tier === 3) { setHype({ name: fn, crew: myCrew, cry: cryTxt, amount: spent, side, eternal: mode === "eternal" }); setTimeout(() => setHype(null), 3400); }
      setCry("");
      setFlow("done"); haptic([30, 40, 60]); setTimeout(() => setFlow(null), 1800);
    }, 1100);
  }
  async function doShare() {
    const url = location.href;
    const txt = winner ? t.win_share(winner === "a" ? cfg.a : cfg.b, cfg.title) : t.live_share(side === "a" ? cfg.a : cfg.b, sideDom, cfg.title);
    try { if (navigator.share) await navigator.share({ title: cfg.title, text: txt, url }); else { await navigator.clipboard.writeText(`${txt} ${url}`); show(t.copied); } } catch {}
  }

  const isA = side === "a", accent = isA ? cfg.colorA : cfg.colorB;
  const skin = skinOf(cfg.skin);
  const eternalLeft = ETERNAL_CAP - eternals.length;
  const ranking = useMemo(() => Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 5), [scores]);
  const crewRanking = useMemo(() => Object.values(crews).sort((a, b) => b.points - a.points).slice(0, 5), [crews]);
  const payValue = mode === "eternal" ? ETERNAL_PRICE.toFixed(2) : plan.spent.toFixed(2);
  const holdColor = holdSide === "a" ? cfg.colorA : cfg.colorB;

  if (tv) {
    return (<><style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} /><Tv cfg={cfg} cells={cells} pctA={pctA} holdSide={holdSide} holdLeft={holdLeft} feed={feed} imgA={imgA} imgB={imgB} tick={tick} onExit={() => setTv(false)} /></>);
  }

  return (
    <div style={{ ...S.proot, background: BG }}><style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div style={{ ...S.aurora, background: skin.aurora, position: "fixed" }} />
      <header style={{ ...S.phead, position: "relative" }}>
        <button onClick={onBack} style={S.back}>← {t.back_home}</button>
        <div style={S.brand}>DUALITY</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setTv(true)} style={S.tvTop} title={t.tv_tip}>⏺ {t.tv_btn}</button>
          <button onClick={() => setShare(true)} style={S.shareTop}>{t.share}</button>
        </div>
      </header>
      <div style={{ ...S.demoBadge, position: "relative" }}>{t.demo}</div>

      <div style={{ ...S.hero, position: "relative" }}>
        {combo >= 2 && <div className="comboChip" key={combo} style={S.comboChip}>🔥 {t.combo(combo)}</div>}
        <div style={S.tickerRow}>
          <div style={S.tkSide}><div style={{ ...S.tkName, color: cfg.colorA }}>{cfg.a}</div><div key={"a" + bump} className="bumpNum" style={{ ...S.tkPct, color: cfg.colorA }}>{pctA}<span style={S.pctMini}>%</span></div></div>
          <div style={S.tkVs}>×</div>
          <div style={{ ...S.tkSide, alignItems: "flex-end" }}><div style={{ ...S.tkName, color: cfg.colorB }}>{cfg.b}</div><div key={"b" + bump} className="bumpNum" style={{ ...S.tkPct, color: cfg.colorB }}>{pctB}<span style={S.pctMini}>%</span></div></div>
        </div>
        <div style={S.title}>{cfg.title}</div>
        {!winner && <div style={S.onboard}>{t.onboard}</div>}
      </div>

      <div style={{ ...S.quote, position: "relative" }}>
        <div style={{ width: `${pctA}%`, background: cfg.colorA, transition: "width .7s cubic-bezier(.34,1.3,.5,1)" }} />
        <div style={{ width: `${pctB}%`, background: cfg.colorB, transition: "width .7s cubic-bezier(.34,1.3,.5,1)" }} />
        <div style={{ ...S.winMark, left: `${WIN_PCT}%`, background: "#ffb84a" }} />
        <div style={{ ...S.winMark, left: `${100 - WIN_PCT}%`, background: "#ffb84a" }} />
        <div style={{ ...S.cursor, left: `${pctA}%` }} />
      </div>

      {/* META COLETIVA — propósito pra jogada pequena */}
      {!winner && goal && (
        <div className="goalGlint" style={{ ...S.goalBar, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={S.goalIcon}>◎</span><span>{t.goal(goal.need, isA ? cfg.a : cfg.b, goal.pct)}</span></div>
          <div style={S.goalFill}><div style={{ height: "100%", width: `${Math.min(100, Math.round(sideCount / Math.ceil(total * goal.pct / 100) * 100))}%`, background: accent, transition: "width .6s ease" }} /></div>
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
        {floatN > 0 && <div key={floatN + bump} className="floatUp" style={S.floatN}>🖌️ +{floatN}</div>}
        {(() => { const c = feed.find(x => x.cry); return c && !winner ? (
          <div className="feedItem" style={S.boardCry}>📣 <strong style={{ color: c.side === "a" ? cfg.colorA : cfg.colorB }}>{c.name}</strong> “{c.cry}”</div>
        ) : null; })()}
        <Board cells={cells} justWon={justWon} cfg={cfg} imgA={imgA} imgB={imgB} tick={tick} dimmed={!!winner} />
      </div>
      {/* cutucada de quem apanha: perder tem que doer (e ter desconto) */}
      {!winner && sideDom < 50 && priceFactor < 1 && (
        <div style={{ ...S.handicapNote, position: "relative", marginTop: 10 }}>🔥 {t.discount(Math.round((1 - priceFactor) * 100))}</div>
      )}


      {!winner && (
        <>
          <div style={{ ...S.panel, position: "relative" }}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder={t.your_name_map} maxLength={16} style={S.nameInput} />
            <div style={S.sides}>
              <button onClick={() => { setSide("a"); haptic(8); }} style={{ ...S.sideBtn, ...(isA ? { borderColor: cfg.colorA, background: cfg.colorA + "1c", color: "#fff" } : {}) }}>{cfg.imgA && <img src={cfg.imgA} alt="" style={S.sideImg} />}{cfg.a}</button>
              <button onClick={() => { setSide("b"); haptic(8); }} style={{ ...S.sideBtn, ...(!isA ? { borderColor: cfg.colorB, background: cfg.colorB + "1c", color: "#fff" } : {}) }}>{cfg.imgB && <img src={cfg.imgB} alt="" style={S.sideImg} />}{cfg.b}</button>
            </div>

            {freeTries > 0 && <button onClick={freeTry} style={{ ...S.tryBtn, borderColor: accent, color: accent }}>{t.try_free}</button>}

            {/* FICHAS DE VALOR (v3) — ancoragem, zero slider, matemática invisível */}
            <div style={S.label}>{t.push_label}</div>
            <div style={S.amtRow}>
              {AMOUNT_PRESETS.map(v => (
                <button key={v} className="amtChip" onClick={() => { setBudget(v); haptic(6); }}
                  style={{ ...S.amtChip, ...(budget === v ? { ...S.amtChipOn, borderColor: accent } : {}) }}>{cur}{v}</button>
              ))}
              <input type="number" min={MIN_BUY} max={100000} placeholder={t.other_amt}
                value={AMOUNT_PRESETS.includes(budget) ? "" : budget || ""}
                onChange={e => setBudget(Math.max(0, +e.target.value || 0))} style={S.amtCustom} />
            </div>
            <div style={S.amtMeta}>
              <span>{budget >= MIN_BUY ? t.approx_blocks(plan.count) : t.min_note(cur, MIN_BUY)}</span>
              {!inWinZone && priceFactor < 1 && <span style={{ color: "#5ad07a" }}>⬇ -{Math.round((1 - priceFactor) * 100)}%</span>}
            </div>
            {inWinZone && <div style={{ ...S.epic, marginBottom: 10 }}>⚡ {t.win_banner_zone}</div>}

            {/* grito vai junto da jogada */}
            <div style={{ ...S.cryBox, marginTop: 10 }}>
              <div style={S.cryLabel}>📣 {t.cry_label}</div>
              <textarea value={cry} onChange={e => setCry(e.target.value)} placeholder={t.cry_ph} maxLength={CRY_MAX} rows={2} style={S.cryInput} />
              {cfg.cries.filter(c => c.trim()).length > 0 && (
                <div style={S.cryChips}>
                  {cfg.cries.filter(c => c.trim()).map((c, i) => (
                    <button key={i} onClick={() => setCry(c)} style={{ ...S.cryChip, ...(cry === c ? { borderColor: accent, color: "#fff" } : {}) }}>{c}</button>
                  ))}
                </div>
              )}
              <div style={S.cryTierNote}>{t.cry_tier2} · {t.cry_tier3}</div>
            </div>

            <details className="howBox" style={{ background: "#0e0c14", border: `1px solid #221F2B`, borderRadius: 12, padding: "11px 13px", margin: "12px 0 4px" }}>
              <summary style={S.label}>{t.more_opts}</summary>
              <div style={{ marginTop: 12 }}>
                <div style={S.label}>{t.flair_label} · <span style={{ textTransform: "none", letterSpacing: 0 }}>{t.flair_hint}</span></div>
                <div style={S.flairRow}>
                  {FLAIRS.map(f => (
                    <button key={f} onClick={() => { setFlair(f); haptic(6); }} style={{ ...S.flairBtn, ...(flair === f ? S.flairOn : {}) }}>{f}</button>
                  ))}
                </div>
                <div style={S.label}>{myCrew ? t.crew_yours : t.crew_head}</div>
                {myCrew ? (
                  <div style={S.crewMine}>
                    <span style={{ ...S.crewMineTag, color: accent }}>⚑ {myCrew}</span>
                    <span style={{ ...S.crewHint, flex: 1 }}>{t.crew_member(myCrew)}</span>
                    <button onClick={() => setMyCrew(null)} style={S.crewLeave}>{t.crew_leave}</button>
                  </div>
                ) : (
                  <div style={S.crewJoinRow}>
                    <input value={crewInput} onChange={e => setCrewInput(normalizeCrewTag(e.target.value))} placeholder={t.crew_ph} maxLength={5} style={S.crewInput} />
                    <button onClick={joinCrew} disabled={normalizeCrewTag(crewInput).length < 2} style={{ ...S.crewBtn, borderColor: accent, color: accent, opacity: normalizeCrewTag(crewInput).length < 2 ? .45 : 1 }}>⚑ {t.crew_join}</button>
                  </div>
                )}
                <div style={S.crewHint}>{t.crew_hint}</div>
              </div>
            </details>

            <div style={{ ...S.eternal, borderColor: accent + "66" }}>
              <div style={S.eternalHead}><div><div style={S.eternalTitle}><span style={{ color: accent }}>★</span> {t.eternal_title}</div><div style={S.eternalSub}>{t.eternal_sub}</div></div><div style={S.eternalScarce}><div style={{ ...S.eternalLeft, color: eternalLeft <= 10 ? "#ff5a4c" : accent }}>{eternalLeft}</div><div style={S.eternalCap}>{t.eternal_of}</div></div></div>
              <div style={S.eternalPreview}><span style={{ ...S.eternalChip, background: accent, color: pickText(accent) }}>{flair} {(name.trim() || t.your_name.toLowerCase())}</span><span style={S.eternalIn}>{t.eternal_in} {isA ? cfg.a : cfg.b}</span></div>
              <button onClick={() => openBuy("eternal")} disabled={eternalLeft <= 0} style={{ ...S.eternalBtn, borderColor: accent, color: accent, opacity: eternalLeft <= 0 ? 0.4 : 1 }}>{eternalLeft <= 0 ? t.eternal_sold : t.eternal_btn(cur)}</button>
            </div>
          </div>
          <div style={S.sticky}>
            <button onClick={() => openBuy("normal")} className="payPulse" disabled={plan.count === 0 || budget < MIN_BUY} style={{ ...S.pay, background: accent, color: pickText(accent), boxShadow: `0 12px 38px -12px ${accent}`, opacity: (plan.count === 0 || budget < MIN_BUY) ? 0.5 : 1 }}>
              <span>{sideDom < 49 ? t.cta_losing(isA ? cfg.a : cfg.b) : sideDom > 51 ? t.cta_winning(isA ? cfg.a : cfg.b) : t.cta_tied(isA ? cfg.a : cfg.b)}</span><span style={S.payAmt}>{cur}{payValue}</span>
            </button>
            <button onClick={() => setShare(true)} style={S.payShare}>↗</button>
          </div>
        </>
      )}

      {/* RANKING DE EQUIPES */}
      {crewRanking.length > 0 && (
        <div style={{ ...S.rank, position: "relative" }}>
          <div style={S.rankTitle}>{t.crew_head}</div>
          {crewRanking.map((c, i) => (
            <div key={c.tag} style={S.rankRow}>
              <span style={S.rankPos}>{i + 1}</span>
              <span style={{ ...S.rankName, fontFamily: FD, fontWeight: 800, color: c.side === "a" ? cfg.colorA : cfg.colorB }}>⚑ {c.tag}</span>
              <span style={S.rankVal}>{c.points}</span>
            </div>
          ))}
        </div>
      )}

      {ranking.length > 0 && (
        <div style={{ ...S.rank, position: "relative" }}><div style={S.rankTitle}>{t.contributors}</div>{ranking.map(([n, v], i) => (<div key={n} style={S.rankRow}><span style={S.rankPos}>{i + 1}</span><span style={S.rankName}>{n}</span><span style={S.rankVal}>{v}</span></div>))}</div>
      )}

      {/* MURAL — gritos de guerra pagos, com camadas */}
      <div style={{ ...S.feed, position: "relative" }}>
        {feed.length === 0 ? <div style={S.feedEmpty}>{t.feed_empty}</div> : feed.map(f => (
          <div key={f.ts} className={f.tier >= 2 ? "cry2" : "feedItem"}
            style={{ ...S.feedItem, ...(f.me ? S.feedMe : {}), ...(f.tier >= 2 ? { ...S.feedTier2, borderColor: (f.side === "a" ? cfg.colorA : cfg.colorB) + "88" } : {}) }}>
            <span style={{ color: f.side === "a" ? cfg.colorA : cfg.colorB }}>{f.eternal ? "★" : "▲"}</span>
            {f.crew && <span style={{ ...S.crewTag, marginLeft: 6, color: f.side === "a" ? cfg.colorA : cfg.colorB }}>{f.crew}</span>}
            <strong style={{ margin: "0 5px" }}>{f.name}</strong>
            {f.eternal ? "★" : `+${f.qty}`} · {f.side === "a" ? cfg.a : cfg.b}
            {f.cry && <span style={{ ...S.feedCry, ...(f.tier >= 2 ? S.feedTier2Cry : {}) }}>“{f.cry}”</span>}
          </div>
        ))}
      </div>


      {/* v3: regras viram consulta, não leitura obrigatória — a arena fala por si */}
      <details className="howBox" style={{ ...S.diagram, position: "relative" }}>
        <summary style={S.diagTitle}>{t.how}</summary>
        <div style={{ ...S.diagSteps, marginTop: 12 }}>
          {[t.step1, t.step2, t.step3, t.step4].map((s, i) => (
            <div key={i} style={S.diagStep}><span style={{ ...S.diagIcon, color: ["#EDE9E0", "#EDE9E0", "#ffb84a", "#5ad07a"][i] }}>{["🖌", "⇄", "⚡", "⬇"][i]}</span><span style={S.diagText}>{bold(s)}</span></div>
          ))}
        </div>
        <div style={S.diagRuler}>
          <div style={{ display: "flex", borderRadius: 99, overflow: "hidden" }}><div style={{ height: 8, width: "80%", background: "#2a2730" }} /><div style={{ height: 8, width: "20%", background: "#ffb84a" }} /></div>
          <div style={S.diagRulerLabel}><span>{t.normal_zone}</span><span style={{ color: "#ffb84a" }}>{t.win_zone}</span></div>
        </div>
      </details>

      {winner && (
        <div style={S.winOverlay}><div className="winIn" style={S.winCard}>
          <div className="crown" style={{ ...S.crown, color: winner === "a" ? cfg.colorA : cfg.colorB }}>♛</div>
          <div style={S.winLabel}>{t.winner}</div>
          <div style={{ ...S.winName, color: winner === "a" ? cfg.colorA : cfg.colorB }}>{winner === "a" ? cfg.a : cfg.b}</div>
          <div style={S.winSub}>{t.sustained} · "{cfg.title}"</div>
          {cfg.victoryMsg && <div style={S.winMsg}>“{cfg.victoryMsg}”</div>}
          {crewRanking.length > 0 && (
            <div style={S.winRank}><div style={S.rankTitle}>{t.crew_head}</div>{crewRanking.slice(0, 3).map((c, i) => (<div key={c.tag} style={S.rankRow}><span style={S.rankPos}>{["①", "②", "③"][i]}</span><span style={{ ...S.rankName, fontFamily: FD, fontWeight: 800 }}>⚑ {c.tag}</span><span style={S.rankVal}>{c.points}</span></div>))}</div>
          )}
          {ranking.length > 0 && <div style={S.winRank}><div style={S.rankTitle}>{t.podium}</div>{ranking.slice(0, 3).map(([n, v], i) => (<div key={n} style={S.rankRow}><span style={S.rankPos}>{["①", "②", "③"][i]}</span><span style={S.rankName}>{n}</span><span style={S.rankVal}>{v}</span></div>))}</div>}
          <button onClick={() => doShare()} style={{ ...S.sheetCta, background: winner === "a" ? cfg.colorA : cfg.colorB, color: pickText(winner === "a" ? cfg.colorA : cfg.colorB), marginTop: 16 }}>{t.share_result}</button>
        </div></div>
      )}

      {/* HYPE — jogada tier 3 / Eterno toma a tela (o momento streamável) */}
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

      {flow && (
        <div style={S.overlay} onClick={() => flow === "qr" && setFlow(null)}>
          <div style={{ ...S.sheet, borderTop: `3px solid ${accent}` }} onClick={e => e.stopPropagation()}>
            {flow === "done" ? (
              <div style={{ textAlign: "center", padding: "8px 0" }}><div className="checkPop" style={{ ...S.check, background: accent, color: pickText(accent) }}>{mode === "eternal" ? "★" : "▲"}</div><h3 style={S.sheetH}>{mode === "eternal" ? t.eternal_done : t.territory_taken}</h3><button onClick={() => { setFlow(null); setShare(true); }} style={{ ...S.sheetCta, background: accent, color: pickText(accent), marginTop: 12 }}>{t.share_my_play}</button></div>
            ) : flow === "processing" ? (
              <div style={{ textAlign: "center", padding: "26px 0" }}><div className="spin" style={{ ...S.spin, borderTopColor: accent }} /><p style={{ ...S.sheetP, marginTop: 14 }}>{t.processing}</p></div>
            ) : (
              <>
                <div style={S.grab} />
                <div style={S.sheetTop}>{((isA && cfg.imgA) || (!isA && cfg.imgB)) && <img src={isA ? cfg.imgA : cfg.imgB} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} />}<div><div style={{ fontFamily: "'Archivo Narrow'", fontWeight: 700, fontSize: 17, color: accent }}>{mode === "eternal" ? `★ ${isA ? cfg.a : cfg.b}` : isA ? cfg.a : cfg.b}</div><div style={S.sheetMeta}>{cur}{payValue} · {money.label}</div></div></div>

                {cry.trim() && <p style={{ ...S.sheetP, textAlign: "center", fontStyle: "italic", marginBottom: 10 }}>📣 “{cry.trim().slice(0, CRY_MAX)}”</p>}
                <div style={S.qr}><div style={S.qrInner} /></div>
                <p style={{ ...S.sheetP, textAlign: "center", marginBottom: 12 }}>{money.method === "pix" ? t.pay_card : t.pay_card}</p>
                {mode === "eternal" && <p style={S.term}>{bold(t.term)}</p>}
                <button onClick={confirm} style={{ ...S.sheetCta, background: accent, color: pickText(accent) }}>{t.confirm_pay} {cur}{payValue}</button>
              </>
            )}
          </div>
        </div>
      )}

      {share && (
        <div style={S.overlay} onClick={() => setShare(false)}>
          <div style={S.sheet} onClick={e => e.stopPropagation()}>
            <div style={S.grab} />
            <div style={S.shareCard}><div style={S.shareCardTop}>{cfg.title}</div><div style={S.shareCardMkt}><span style={{ color: cfg.colorA, fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 30 }}>{pctA}%</span><span style={{ color: "#555", fontSize: 13 }}>{cfg.a} × {cfg.b}</span><span style={{ color: cfg.colorB, fontFamily: "'Space Mono'", fontWeight: 700, fontSize: 30 }}>{pctB}%</span></div><div style={{ ...S.quote, margin: "12px 0 0" }}><div style={{ width: `${pctA}%`, background: cfg.colorA }} /><div style={{ width: `${pctB}%`, background: cfg.colorB }} /></div><div style={S.shareCardFoot}>duality.app</div></div>
            <button onClick={() => doShare()} style={{ ...S.sheetCta, background: "#fff", color: "#000", marginTop: 14 }}>{t.share} ↗</button>
            <div style={S.shareGrid}>
              {[
                { k: "WhatsApp", c: "#25D366", u: (txt, url) => `https://wa.me/?text=${encodeURIComponent(txt + " " + url)}` },
                { k: "Reddit", c: "#FF4500", u: (txt, url) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(txt)}` },
                { k: "X", c: "#fff", u: (txt, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(txt)}&url=${encodeURIComponent(url)}` },
                { k: "Telegram", c: "#0088cc", u: (txt, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(txt)}` },
                { k: "Facebook", c: "#1877F2", u: (txt, url) => `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
              ].map(p => {
                const txt = winner ? t.win_share(winner === "a" ? cfg.a : cfg.b, cfg.title) : t.live_share(side === "a" ? cfg.a : cfg.b, sideDom, cfg.title);
                return <a key={p.k} href={p.u(txt, location.href)} target="_blank" rel="noopener noreferrer" style={{ ...S.shareChip, color: p.c }}>{p.k}</a>;
              })}
            </div>
            <p style={S.shareHint}>{t.share_hint}</p>
          </div>
        </div>
      )}

      {/* primeira visita: o jogo em 3 linhas (feedback do teste com usuário real) */}
      {welcome && (
        <div style={{ ...S.winOverlay, zIndex: 95 }}>
          <div className="winIn" style={S.winCard}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>🐱⚔️🐶</div>
            <div style={{ ...S.winName, fontSize: 26, letterSpacing: -.5 }}>{cfg.title}</div>
            <div style={{ textAlign: "left", margin: "16px 0 4px", display: "flex", flexDirection: "column", gap: 9 }}>
              {[t.welcome_1, t.welcome_2, t.welcome_3].map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 10, fontSize: 14.5, color: "#c4c1cd", lineHeight: 1.35 }}><span>{["1️⃣", "2️⃣", "3️⃣"][i]}</span><span>{w}</span></div>
              ))}
            </div>
            <div style={{ marginTop: 12, padding: "9px 12px", background: "#0b0910", border: "1px solid #221F2B", borderRadius: 10, fontFamily: FM, fontSize: 12, textAlign: "center", color: "#EDE9E0" }}>{t.welcome_eq(`${money.cur}${MIN_BUY}`)}</div>
            <button onClick={() => { setWelcome(false); try { localStorage.setItem("duality_welcome", "1"); } catch {} }}
              style={{ ...S.sheetCta, background: INK, color: BG, marginTop: 14 }}>{t.welcome_cta}</button>
          </div>
        </div>
      )}

      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}
