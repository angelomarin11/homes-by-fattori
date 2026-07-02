import React, { useState, useEffect, useRef, useMemo } from "react";

// ============================================================================
//  DUALITY — DEMO CINEMATOGRÁFICA (auto-play, loop)
//  Um "trailer" da página: logo se monta, disputa roda sozinha, nomes sobem,
//  vitória, e recomeça. Pensado pra gravar tela / mostrar a ideia.
// ============================================================================

const GRID = 22;
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Archivo+Narrow:wght@600;700&family=Space+Mono:wght@400;700&display=swap');`;

const NAMES_A = ["Maria", "João", "Ana", "Gabriel", "Sofia", "Lúcia", "Rafael", "Bia"];
const NAMES_B = ["Nyx", "Belial", "Dante", "Lilith", "Vex", "Mara", "Asmo", "Kaos"];
const A = "#F5C84B", B = "#E03A2F";

export default function DualityDemo() {
  const [phase, setPhase] = useState("intro"); // intro → battle → win → (loop)
  const [cells, setCells] = useState(() => Array.from({ length: GRID * GRID }, (_, i) => (i % GRID) < GRID / 2 ? "a" : "b"));
  const [flash, setFlash] = useState([]);
  const [feed, setFeed] = useState([]);
  const [winner, setWinner] = useState(null);
  const targetRef = useRef(50);
  const [pa, setPa] = useState(50);
  const cycle = useRef(0);

  const pctA = useMemo(() => Math.round(cells.filter(c => c === "a").length / cells.length * 100), [cells]);

  // sequência cinematográfica
  useEffect(() => {
    let timers = [];
    function run() {
      setPhase("intro");
      setCells(Array.from({ length: GRID * GRID }, (_, i) => (i % GRID) < GRID / 2 ? "a" : "b"));
      setFeed([]); setWinner(null); targetRef.current = 50; setPa(50);

      timers.push(setTimeout(() => setPhase("battle"), 2600));
      // a batalha é dirigida: tende a um vencedor (alterna a cada ciclo)
      timers.push(setTimeout(() => {
        const win = cycle.current % 2 === 0 ? "a" : "b";
        targetRef.current = win === "a" ? 85 : 15;
      }, 3200));
      timers.push(setTimeout(() => {
        setPhase("win");
        setWinner(cycle.current % 2 === 0 ? "a" : "b");
      }, 12000));
      timers.push(setTimeout(() => { cycle.current++; run(); }, 16000));
    }
    run();
    return () => timers.forEach(clearTimeout);
  }, []);

  // motor da batalha: move a fronteira em direção ao alvo, pinta blocos, solta nomes
  useEffect(() => {
    if (phase !== "battle") return;
    const iv = setInterval(() => {
      setPa(p => p + (targetRef.current - p) * 0.08);
      // pinta alguns blocos na direção do alvo
      setCells(prev => {
        const goA = targetRef.current > 50;
        const next = [...prev];
        const opp = goA ? "b" : "a";
        const me = goA ? "a" : "b";
        const cand = [...next.keys()].filter(i => next[i] === opp)
          .sort((x, y) => Math.abs((x % GRID) - GRID / 2) - Math.abs((y % GRID) - GRID / 2));
        const take = cand.slice(0, 2 + (Math.random() * 3 | 0));
        const fl = [];
        take.forEach(i => { next[i] = me; fl.push(i); });
        if (fl.length) { setFlash(fl); setTimeout(() => setFlash([]), 400); }
        return next;
      });
      // nome no feed
      const goA = targetRef.current > 50;
      const pool = goA ? NAMES_A : NAMES_B;
      const nm = pool[Math.random() * pool.length | 0];
      setFeed(f => [{ name: nm, side: goA ? "a" : "b", qty: 2 + (Math.random() * 6 | 0), ts: Date.now() + Math.random() }, ...f].slice(0, 5));
    }, 600);
    return () => clearInterval(iv);
  }, [phase]);

  return (
    <div style={S.root}>
      <style>{FONTS}{CSS}</style>
      <div style={S.aurora} />

      {/* LOGO sempre, com entrada */}
      <div className={phase === "intro" ? "logoIn" : ""} style={S.logoWrap}>
        <div style={S.logo}>DUAL<span style={{ color: "#ff3b6b" }}>·</span>ITY</div>
        <div style={S.tagline}>escolha um lado · mova o mapa</div>
      </div>

      {/* INTRO: os dois lados surgem */}
      {phase === "intro" && (
        <div style={S.introMatch}>
          <div className="sideInL" style={{ ...S.introSide, color: A }}>
            <div style={S.introEmoji}>✦</div>JESUS
          </div>
          <div className="vsIn" style={S.introVs}>VS</div>
          <div className="sideInR" style={{ ...S.introSide, color: B }}>
            <div style={S.introEmoji}>🔥</div>DIABO
          </div>
        </div>
      )}

      {/* BATTLE + WIN */}
      {(phase === "battle" || phase === "win") && (
        <div className="boardFade">
          <div style={S.scoreRow}>
            <div style={{ textAlign: "left" }}>
              <div style={{ ...S.scoreName, color: A }}>Jesus</div>
              <div key={"a" + pctA} className="num" style={{ ...S.scorePct, color: A }}>{pctA}%</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...S.scoreName, color: B }}>Diabo</div>
              <div key={"b" + pctA} className="num" style={{ ...S.scorePct, color: B }}>{100 - pctA}%</div>
            </div>
          </div>

          <div style={S.quote}>
            <div style={{ width: `${pa}%`, background: A, transition: "width .6s ease" }} />
            <div style={{ width: `${100 - pa}%`, background: B, transition: "width .6s ease" }} />
            <div style={{ ...S.cursor, left: `${pa}%` }} />
          </div>

          <div style={S.boardWrap}>
            <div style={{ ...S.board, gridTemplateColumns: `repeat(${GRID},1fr)` }}>
              {cells.map((c, i) => (
                <div key={i} className={flash.includes(i) ? "flash" : ""}
                  style={{ background: c === "a" ? A : B }} />
              ))}
            </div>
          </div>

          {/* feed flutuante */}
          <div style={S.feed}>
            {feed.map(f => (
              <div key={f.ts} className="feedItem" style={S.feedItem}>
                <span style={{ color: f.side === "a" ? A : B }}>▲</span>
                <strong style={{ margin: "0 5px" }}>{f.name}</strong> +{f.qty}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WIN overlay */}
      {phase === "win" && winner && (
        <div className="winIn" style={S.winOverlay}>
          <div className="crown" style={{ ...S.crown, color: winner === "a" ? A : B }}>♛</div>
          <div style={S.winLabel}>VENCEDOR</div>
          <div style={{ ...S.winName, color: winner === "a" ? A : B }}>{winner === "a" ? "JESUS" : "DIABO"}</div>
          <div style={S.winSub}>sustentou 80% até o fim</div>
        </div>
      )}

      {/* selo de demo */}
      <div style={S.demoTag}>● demonstração · loop automático</div>
    </div>
  );
}

const CSS = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#08070c}
.logoIn{animation:logoIn 1.2s cubic-bezier(.2,1,.3,1)}
@keyframes logoIn{0%{opacity:0;transform:translateY(20px) scale(.9);filter:blur(8px)}100%{opacity:1;transform:none;filter:none}}
.sideInL{animation:slL .9s cubic-bezier(.2,1.2,.3,1) .6s both}
.sideInR{animation:slR .9s cubic-bezier(.2,1.2,.3,1) .6s both}
.vsIn{animation:vsP .6s ease 1.2s both}
@keyframes slL{0%{opacity:0;transform:translateX(-60px)}100%{opacity:1;transform:none}}
@keyframes slR{0%{opacity:0;transform:translateX(60px)}100%{opacity:1;transform:none}}
@keyframes vsP{0%{opacity:0;transform:scale(2)}100%{opacity:1;transform:scale(1)}}
.boardFade{animation:fade .8s ease}
@keyframes fade{0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:none}}
.flash{animation:flash .5s ease}
@keyframes flash{0%{box-shadow:inset 0 0 0 2px #fff, 0 0 12px #fff;transform:scale(1.1)}100%{box-shadow:none;transform:none}}
.num{animation:num .4s cubic-bezier(.3,1.6,.4,1)}
@keyframes num{0%{transform:scale(1.25)}100%{transform:scale(1)}}
.feedItem{animation:fSlide .4s ease}
@keyframes fSlide{0%{opacity:0;transform:translateX(-12px)}100%{opacity:1;transform:none}}
.winIn{animation:winIn .7s cubic-bezier(.2,1.3,.3,1)}
@keyframes winIn{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:none}}
.crown{animation:crownDrop .9s cubic-bezier(.2,1.5,.3,1)}
@keyframes crownDrop{0%{transform:translateY(-50px) scale(.3) rotate(-15deg);opacity:0}100%{transform:none;opacity:1}}
.cell{transition:background .4s}
`;

const FD = "'Archivo',system-ui,sans-serif", FC = "'Archivo Narrow',system-ui,sans-serif", FM = "'Space Mono',monospace";
const INK = "#EDE9E0", DIM = "#8A8792";

const S = {
  root: { position: "relative", minHeight: "100vh", maxWidth: 460, margin: "0 auto", background: "#08070c", color: INK, fontFamily: FC, padding: "26px 20px", overflow: "hidden", display: "flex", flexDirection: "column" },
  aurora: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 25% 12%, #ffce5520, transparent 42%), radial-gradient(ellipse at 78% 16%, #c0231d28, transparent 45%)", pointerEvents: "none" },
  logoWrap: { textAlign: "center", marginBottom: 22, position: "relative" },
  logo: { fontFamily: FD, fontWeight: 900, fontStyle: "italic", fontSize: 34, letterSpacing: -1 },
  tagline: { fontFamily: FM, fontSize: 11, letterSpacing: 2, color: DIM, marginTop: 6 },
  introMatch: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flex: 1 },
  introSide: { fontFamily: FD, fontWeight: 900, fontSize: 30, letterSpacing: -1, textAlign: "center" },
  introEmoji: { fontSize: 44, marginBottom: 8 },
  introVs: { fontFamily: FM, fontSize: 18, fontStyle: "italic", color: "#555" },
  scoreRow: { position: "relative", display: "flex", justifyContent: "space-between", marginBottom: 10 },
  scoreName: { fontFamily: FD, fontWeight: 800, fontSize: 16 },
  scorePct: { fontFamily: FM, fontWeight: 700, fontSize: 38, lineHeight: .9, letterSpacing: -2 },
  quote: { position: "relative", height: 12, borderRadius: 99, overflow: "hidden", display: "flex", marginBottom: 16, boxShadow: "inset 0 0 0 1px #ffffff18" },
  cursor: { position: "absolute", top: -3, width: 2, height: 18, background: "#fff", boxShadow: "0 0 12px #fff", transition: "left .6s ease" },
  boardWrap: { position: "relative", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 1px #ffffff10, 0 30px 70px -30px #000, 0 0 60px -24px #ffae3a33" },
  board: { display: "grid", gap: 0, aspectRatio: "1" },
  feed: { marginTop: 14, display: "flex", flexDirection: "column", gap: 5, minHeight: 90 },
  feedItem: { fontFamily: FC, fontSize: 13, color: "#b6b3bf", background: "#13111980", borderRadius: 8, padding: "7px 11px", border: "1px solid #221F2B" },
  winOverlay: { position: "absolute", inset: 0, background: "#08070cee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, backdropFilter: "blur(3px)" },
  crown: { fontSize: 70, lineHeight: 1 },
  winLabel: { fontFamily: FM, fontSize: 12, letterSpacing: 5, color: DIM, marginTop: 12 },
  winName: { fontFamily: FD, fontWeight: 900, fontSize: 54, letterSpacing: -2, lineHeight: 1, margin: "6px 0" },
  winSub: { fontFamily: FC, fontSize: 14, color: DIM },
  demoTag: { position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", fontFamily: FM, fontSize: 10, letterSpacing: 1, color: "#5ad07a", whiteSpace: "nowrap" },
};
