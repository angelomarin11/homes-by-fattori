"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FONTS, CSS, S, FD, FC, FM, BG, INK, DIM, CARD, LINE } from "@/components/duality/theme";
import { curSymbol } from "@/components/duality/rules";

// ============================================================================
//  /admin — painel do OPERADOR (Angelo). PT de propósito; uma tela.
//  O que era curl + SQL Editor: criar criador, criar disputa (Relâmpago ou
//  Clássica), acompanhar arrecadação e moderar gritos/nomes com um clique.
//  Protegido pelo DUELS_ADMIN_SECRET — o segredo fica só no seu navegador.
// ============================================================================

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  // forms
  const [creator, setCreator] = useState({ name: "", email: "", country: "BR", pagarmeRecipientId: "" });
  const [duel, setDuel] = useState({ creatorId: "", title: "", sideA: "", sideB: "", colorA: "#F5C84B", colorB: "#E03A2F", holdHours: 24, currency: "BRL" });

  useEffect(() => { try { const s = localStorage.getItem("duality_admin"); if (s) { setSecret(s); } } catch {} }, []);
  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(null), 3000); };

  const load = useCallback(async (sec) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin", { headers: { "x-admin-secret": sec } });
      if (res.status === 401) { setUnlocked(false); toast("segredo incorreto"); return; }
      const d = await res.json();
      setData(d); setUnlocked(true);
      try { localStorage.setItem("duality_admin", sec); } catch {}
    } catch { toast("falha de rede"); }
    finally { setBusy(false); }
  }, []);

  async function act(body) {
    setBusy(true);
    try {
      const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-secret": secret }, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) { toast(d.error || "erro"); return null; }
      await load(secret);
      return d;
    } catch { toast("falha de rede"); return null; }
    finally { setBusy(false); }
  }

  async function createDuel() {
    setBusy(true);
    try {
      const res = await fetch("/api/duels", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-secret": secret }, body: JSON.stringify(duel) });
      const d = await res.json();
      if (!res.ok) { toast(d.error || "erro"); return; }
      toast(`disputa criada: ${d.url}`);
      setDuel(x => ({ ...x, title: "", sideA: "", sideB: "" }));
      await load(secret);
    } catch { toast("falha de rede"); }
    finally { setBusy(false); }
  }

  if (!unlocked) return (
    <div style={{ ...S.root, display: "grid", placeItems: "center" }}>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 26, width: 340 }}>
        <div style={{ ...S.brand, marginBottom: 4 }}>DUALITY</div>
        <div style={{ ...S.eyebrow, marginBottom: 16 }}>PAINEL DO OPERADOR</div>
        <input type="password" value={secret} onChange={e => setSecret(e.target.value)} placeholder="DUELS_ADMIN_SECRET" style={S.input}
          onKeyDown={e => e.key === "Enter" && secret && load(secret)} />
        <button onClick={() => secret && load(secret)} disabled={busy || !secret} style={{ ...S.launch, marginTop: 12, opacity: busy || !secret ? .5 : 1 }}>{busy ? "…" : "Entrar"}</button>
      </div>
      {msg && <div style={S.toast}>{msg}</div>}
    </div>
  );

  const A = data || { creators: [], duels: [], recent: [] };
  return (
    <div style={{ ...S.root, padding: "0 0 60px" }}>
      <style dangerouslySetInnerHTML={{ __html: FONTS + CSS }} />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "26px 18px" }}>
        <div style={S.topRow}>
          <div><div style={S.brand}>DUALITY</div><div style={S.eyebrow}>PAINEL DO OPERADOR</div></div>
          <button onClick={() => load(secret)} disabled={busy} style={S.shareTop}>{busy ? "…" : "↻ atualizar"}</button>
        </div>

        {/* DISPUTAS */}
        <div style={{ ...S.rank, marginTop: 18 }}>
          <div style={S.rankTitle}>DISPUTAS ({A.duels.length})</div>
          {A.duels.length === 0 && <div style={AD.empty}>nenhuma ainda — crie abaixo</div>}
          {A.duels.map(d => (
            <div key={d.id} style={{ ...S.rankRow, gap: 8, flexWrap: "wrap" }}>
              <a href={`/d/${d.id}`} target="_blank" rel="noreferrer" style={AD.link}>{d.title}</a>
              <span style={AD.dim}>{d.side_a}×{d.side_b} · {d.hold_hours}h {d.hold_hours <= 2 ? "⚡" : ""}</span>
              <span style={{ ...AD.badge, color: d.status === "active" ? "#5ad07a" : "#ffb84a" }}>{d.status}</span>
              <span style={{ ...AD.money, marginLeft: "auto" }}>{curSymbol(d.currency)}{(d.gross || 0).toFixed(2)} · {d.count || 0} tx</span>
            </div>
          ))}
        </div>

        {/* CRIAR DISPUTA */}
        <div style={AD.card}>
          <div style={S.rankTitle}>NOVA DISPUTA</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select value={duel.creatorId} onChange={e => setDuel(x => ({ ...x, creatorId: e.target.value }))} style={{ ...S.input, gridColumn: "1 / -1" }}>
              <option value="">criador…</option>
              {A.creators.filter(c => c.approved).map(c => <option key={c.id} value={c.id}>{c.name} ({c.country})</option>)}
            </select>
            <input style={{ ...S.input, gridColumn: "1 / -1" }} placeholder="título (ex: Flamengo vs Vasco)" value={duel.title} onChange={e => setDuel(x => ({ ...x, title: e.target.value }))} />
            <input style={S.input} placeholder="Lado A" value={duel.sideA} onChange={e => setDuel(x => ({ ...x, sideA: e.target.value }))} />
            <input style={S.input} placeholder="Lado B" value={duel.sideB} onChange={e => setDuel(x => ({ ...x, sideB: e.target.value }))} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="color" value={duel.colorA} onChange={e => setDuel(x => ({ ...x, colorA: e.target.value }))} style={S.color} /><input type="color" value={duel.colorB} onChange={e => setDuel(x => ({ ...x, colorB: e.target.value }))} style={S.color} /></div>
            <div style={{ display: "flex", gap: 6 }}>
              {[[1, "⚡ Relâmpago 1h"], [24, "Clássica 24h"]].map(([h, l]) => (
                <button key={h} onClick={() => setDuel(x => ({ ...x, holdHours: h }))} style={{ ...S.skinChip, ...(duel.holdHours === h ? S.skinChipOn : {}) }}>{l}</button>
              ))}
            </div>
            <select value={duel.currency} onChange={e => setDuel(x => ({ ...x, currency: e.target.value }))} style={S.input}>
              <option value="BRL">BRL · Pix</option><option value="USD">USD · Stripe</option><option value="EUR">EUR · Stripe</option>
            </select>
            <button onClick={createDuel} disabled={busy || !duel.creatorId || !duel.title || !duel.sideA || !duel.sideB}
              style={{ ...S.launch, opacity: (busy || !duel.creatorId || !duel.title || !duel.sideA || !duel.sideB) ? .45 : 1 }}>Criar →</button>
          </div>
        </div>

        {/* CRIADORES */}
        <div style={AD.card}>
          <div style={S.rankTitle}>CRIADORES ({A.creators.length})</div>
          {A.creators.map(c => (
            <div key={c.id} style={{ ...S.rankRow, gap: 8 }}>
              <span style={S.rankName}>{c.name}</span><span style={AD.dim}>{c.email} · {c.country}</span>
              <span style={{ ...AD.badge, color: c.approved ? "#5ad07a" : "#ff5a4c", marginLeft: "auto" }}>{c.approved ? "aprovado" : "pendente"}</span>
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
            <input style={S.input} placeholder="nome" value={creator.name} onChange={e => setCreator(x => ({ ...x, name: e.target.value }))} />
            <input style={S.input} placeholder="email" value={creator.email} onChange={e => setCreator(x => ({ ...x, email: e.target.value }))} />
            <input style={S.input} placeholder="país (BR)" maxLength={2} value={creator.country} onChange={e => setCreator(x => ({ ...x, country: e.target.value.toUpperCase() }))} />
            <input style={S.input} placeholder="recipient Pagar.me (re_…)" value={creator.pagarmeRecipientId} onChange={e => setCreator(x => ({ ...x, pagarmeRecipientId: e.target.value }))} />
            <button onClick={() => act({ action: "create_creator", ...creator }).then(r => r && setCreator({ name: "", email: "", country: "BR", pagarmeRecipientId: "" }))}
              disabled={busy || !creator.name || !creator.email} style={{ ...S.launch, gridColumn: "1 / -1", opacity: (busy || !creator.name || !creator.email) ? .45 : 1 }}>+ Criador aprovado</button>
          </div>
        </div>

        {/* MODERAÇÃO */}
        <div style={AD.card}>
          <div style={S.rankTitle}>ÚLTIMAS JOGADAS PAGAS · MODERAÇÃO</div>
          {A.recent.length === 0 && <div style={AD.empty}>nenhum pagamento ainda</div>}
          {A.recent.map(tx => (
            <div key={tx.id} style={{ ...S.feedItem, marginBottom: 6 }}>
              <strong>{tx.buyer_name}</strong>
              <span style={{ ...AD.dim, margin: "0 6px" }}>{tx.kind} · {curSymbol(tx.currency)}{Number(tx.gross).toFixed(2)}{tx.crew ? ` · ⚑${tx.crew}` : ""}</span>
              {tx.cry && <span style={{ ...S.feedCry }}>"{tx.cry}"</span>}
              <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                {tx.cry && <button onClick={() => act({ action: "clear_cry", txnId: tx.id })} style={AD.mod}>limpar grito</button>}
                <button onClick={() => act({ action: "anon_buyer", txnId: tx.id })} style={AD.mod}>anonimizar</button>
              </span>
            </div>
          ))}
        </div>

        <p style={{ ...S.note, marginTop: 20 }}>criar pelo painel = curadoria aprovada · segredo fica só neste navegador</p>
      </div>
      {msg && <div style={S.toast}>{msg}</div>}
    </div>
  );
}

const AD = {
  card: { background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "12px 14px", marginTop: 14 },
  link: { fontFamily: FD, fontWeight: 800, fontSize: 14, color: INK, textDecoration: "none" },
  dim: { fontFamily: FM, fontSize: 11, color: DIM },
  badge: { fontFamily: FM, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" },
  money: { fontFamily: FM, fontSize: 12, color: INK },
  empty: { fontFamily: FM, fontSize: 12, color: "#55525f", padding: "6px 0" },
  mod: { background: "none", border: `1px solid ${LINE}`, color: "#ff6a6a", fontFamily: FM, fontSize: 10, padding: "4px 8px", borderRadius: 7, cursor: "pointer", whiteSpace: "nowrap" },
};
