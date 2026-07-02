"use client";
import React from "react";
import { WIN_PCT, skinOf } from "./rules";
import { useT } from "./i18n";
import { S, FD, FC, FM, INK, DIM, LINE, fmtHMS } from "./theme";
import Board from "./Board";

// ============================================================================
//  MODO TRANSMISSÃO — tela limpa pra streamers capturarem no OBS.
//  Placar gigante, tabuleiro, contagem de vitória, últimos gritos e um QR
//  fixo: quem assiste escaneia e vira jogador. O streamer é o criador —
//  cada pagamento que a live gera cai no split 70/30 dele.
// ============================================================================
export default function Tv({ cfg, cells, pctA, holdSide, holdLeft, feed, imgA, imgB, tick, onExit }) {
  const { t } = useT();
  const pctB = 100 - pctA;
  const cries = feed.filter(f => f.cry).slice(0, 3);
  const holdColor = holdSide === "a" ? cfg.colorA : cfg.colorB;
  return (
    <div style={TV.root}>
      <div style={{ ...S.aurora, background: skinOf(cfg.skin).aurora }} />
      <button onClick={onExit} style={TV.exit}>✕ {t.tv_exit}</button>

      <div style={TV.head}>
        <div style={TV.brand}>DUALITY</div>
        <div style={TV.live}><span className="tvDot" style={TV.liveDot} /> {t.tv_live}</div>
      </div>

      <div style={TV.title}>{cfg.title}</div>

      <div style={TV.ticker}>
        <div style={{ textAlign: "left" }}>
          <div style={{ ...TV.tkName, color: cfg.colorA }}>{cfg.a}</div>
          <div key={"a" + pctA} className="num" style={{ ...TV.tkPct, color: cfg.colorA }}>{pctA}<span style={TV.pctMini}>%</span></div>
        </div>
        <div style={TV.vs}>×</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ ...TV.tkName, color: cfg.colorB }}>{cfg.b}</div>
          <div key={"b" + pctA} className="num" style={{ ...TV.tkPct, color: cfg.colorB }}>{pctB}<span style={TV.pctMini}>%</span></div>
        </div>
      </div>

      <div style={{ ...S.quote, height: 16, marginBottom: 14 }}>
        <div style={{ width: `${pctA}%`, background: cfg.colorA, transition: "width .7s cubic-bezier(.34,1.3,.5,1)" }} />
        <div style={{ width: `${pctB}%`, background: cfg.colorB, transition: "width .7s cubic-bezier(.34,1.3,.5,1)" }} />
        <div style={{ ...S.winMark, left: `${WIN_PCT}%`, background: "#ffb84a" }} />
        <div style={{ ...S.winMark, left: `${100 - WIN_PCT}%`, background: "#ffb84a" }} />
        <div style={{ ...S.cursor, left: `${pctA}%` }} />
      </div>

      {holdSide && (
        <div className="holdBanner" style={{ ...S.holdBanner, borderColor: holdColor, marginBottom: 14 }}>
          <div style={S.holdText}><strong style={{ color: holdColor }}>{holdSide === "a" ? cfg.a : cfg.b}</strong> {t.wins_in}</div>
          <div key={Math.floor(holdLeft / 1000)} className="holdNum" style={{ ...S.holdNum, color: holdColor }}>{fmtHMS(holdLeft)}</div>
        </div>
      )}

      <Board cells={cells} justWon={[]} cfg={cfg} imgA={imgA} imgB={imgB} tick={tick} dimmed={false} />

      <div style={TV.foot}>
        <div style={TV.cries}>
          {cries.length === 0
            ? <div style={TV.criesEmpty}>{t.feed_empty}</div>
            : cries.map(f => (
              <div key={f.ts} className="feedItem" style={TV.cryItem}>
                <span style={{ color: f.side === "a" ? cfg.colorA : cfg.colorB, fontFamily: FM }}>▲</span>
                <strong style={{ margin: "0 6px" }}>{f.crew ? `[${f.crew}] ` : ""}{f.name}</strong>
                <span style={TV.cryTxt}>“{f.cry}”</span>
              </div>
            ))}
        </div>
        <div style={TV.qrBox}>
          <div style={TV.qr}><div style={S.qrInner} /></div>
          <div style={TV.qrLabel}>{t.tv_scan}</div>
        </div>
      </div>

      <div style={TV.watermark}>{t.tv_watermark} · {cfg.creator}</div>
    </div>
  );
}

const TV = {
  root: { position: "fixed", inset: 0, zIndex: 85, background: "#08070c", color: INK, fontFamily: FC, padding: "22px clamp(16px, 5vw, 60px)", overflowY: "auto", display: "flex", flexDirection: "column", maxWidth: "100vw" },
  exit: { position: "absolute", top: 16, right: 16, zIndex: 5, background: "none", border: `1px solid ${LINE}`, color: DIM, fontFamily: FM, fontSize: 11, padding: "6px 12px", borderRadius: 8, cursor: "pointer" },
  head: { position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  brand: { fontFamily: FD, fontWeight: 900, fontStyle: "italic", fontSize: 22, letterSpacing: -.5 },
  live: { display: "flex", alignItems: "center", gap: 7, fontFamily: FM, fontSize: 12, letterSpacing: 2, color: "#ff5a4c", marginRight: 110 },
  liveDot: { width: 8, height: 8, borderRadius: 99, background: "#ff5a4c", display: "inline-block" },
  title: { position: "relative", fontFamily: FD, fontWeight: 800, fontSize: "clamp(18px, 3vw, 28px)", textAlign: "center", letterSpacing: -.5, marginBottom: 8 },
  ticker: { position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8 },
  tkName: { fontFamily: FD, fontWeight: 800, fontSize: "clamp(16px, 2.4vw, 24px)" },
  tkPct: { fontFamily: FM, fontWeight: 700, fontSize: "clamp(44px, 8vw, 84px)", lineHeight: .9, letterSpacing: -3 },
  pctMini: { fontSize: "0.38em", opacity: .5, letterSpacing: 0 },
  vs: { fontFamily: FM, color: "#3a3744", fontSize: 24, alignSelf: "center" },
  foot: { position: "relative", display: "flex", gap: 16, alignItems: "stretch", marginTop: 16 },
  cries: { flex: 1, display: "flex", flexDirection: "column", gap: 6, justifyContent: "flex-end", minWidth: 0 },
  criesEmpty: { fontFamily: FM, fontSize: 12, color: "#55525f" },
  cryItem: { display: "flex", alignItems: "baseline", flexWrap: "wrap", fontSize: 14, color: "#c4c1cd", background: "#13111990", borderRadius: 10, padding: "9px 13px", border: `1px solid ${LINE}` },
  cryTxt: { fontStyle: "italic", color: INK },
  qrBox: { textAlign: "center", flexShrink: 0 },
  qr: { width: 120, height: 120, background: "#fff", borderRadius: 12, padding: 8, display: "grid", placeItems: "center" },
  qrLabel: { fontFamily: FM, fontSize: 10, letterSpacing: 1, color: DIM, marginTop: 7, maxWidth: 120, lineHeight: 1.4 },
  watermark: { position: "relative", textAlign: "center", fontFamily: FM, fontSize: 11, letterSpacing: 2, color: "#55525f", marginTop: 14 },
};
