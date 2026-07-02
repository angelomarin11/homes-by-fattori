// ============================================================================
//  Tema compartilhado — fontes, paleta carvão, CSS de animação e o objeto S.
//  Visual "câmbio sagrado": fundo #0B0A0F, as cores da disputa são os únicos
//  acentos. A v2 adiciona os estilos de grito/hype/equipe/TV/estúdio.
// ============================================================================

export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Archivo+Narrow:wght@600;700&family=Space+Mono:wght@400;700&display=swap');`;

export const FD = "'Archivo',system-ui,sans-serif";
export const FC = "'Archivo Narrow',system-ui,sans-serif";
export const FM = "'Space Mono',monospace";
export const BG = "#0B0A0F", INK = "#EDE9E0", DIM = "#8A8792", CARD = "#131119", LINE = "#221F2B";

export function pickText(hex) {
  if (!hex) return "#fff";
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#1a1200" : "#fff";
}
export function fmtHMS(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(x).padStart(2, "0")}s`;
}

export const CSS = `
*{box-sizing:border-box;margin:0;padding:0}body{background:#0B0A0F}
.feedItem{animation:slide .4s ease}@keyframes slide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
.bumpNum{animation:bump .5s cubic-bezier(.3,1.6,.4,1)}@keyframes bump{0%{transform:scale(1.18)}100%{transform:scale(1)}}
.payPulse{animation:pp 2.6s ease-in-out infinite}@keyframes pp{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
.checkPop{animation:cp .5s cubic-bezier(.2,1.5,.4,1)}@keyframes cp{0%{transform:scale(.3);opacity:0}100%{transform:scale(1);opacity:1}}
.spin{animation:sp 1s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
.crown{animation:crownDrop .9s cubic-bezier(.2,1.5,.3,1)}@keyframes crownDrop{0%{transform:translateY(-50px) scale(.3) rotate(-15deg);opacity:0}100%{transform:none;opacity:1}}
.holdBanner{animation:holdPulse 1.5s ease-in-out infinite}@keyframes holdPulse{0%,100%{box-shadow:0 0 0 0 #ffffff00}50%{box-shadow:0 0 30px -6px #ffffff40}}
.holdNum{animation:holdTick .4s cubic-bezier(.3,1.6,.4,1)}@keyframes holdTick{0%{transform:scale(1.3)}100%{transform:scale(1)}}
@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.logoIn{animation:logoIn 1.2s cubic-bezier(.2,1,.3,1)}@keyframes logoIn{0%{opacity:0;transform:translateY(20px) scale(.9);filter:blur(8px)}100%{opacity:1;transform:none;filter:none}}
.sideInL{animation:slL .9s cubic-bezier(.2,1.2,.3,1) .6s both}.sideInR{animation:slR .9s cubic-bezier(.2,1.2,.3,1) .6s both}
@keyframes slL{0%{opacity:0;transform:translateX(-60px)}100%{opacity:1;transform:none}}@keyframes slR{0%{opacity:0;transform:translateX(60px)}100%{opacity:1;transform:none}}
.vsIn{animation:vsP .6s ease 1.2s both}@keyframes vsP{0%{opacity:0;transform:scale(2)}100%{opacity:1;transform:scale(1)}}
.boardFade{animation:bfade .8s ease}@keyframes bfade{0%{opacity:0;transform:scale(.96)}100%{opacity:1;transform:none}}
.flash{animation:flashA .5s ease}@keyframes flashA{0%{box-shadow:inset 0 0 0 2px #fff,0 0 12px #fff;transform:scale(1.1)}100%{box-shadow:none;transform:none}}
.num{animation:numA .4s cubic-bezier(.3,1.6,.4,1)}@keyframes numA{0%{transform:scale(1.25)}100%{transform:scale(1)}}
.winIn{animation:winInA .7s cubic-bezier(.2,1.3,.3,1)}@keyframes winInA{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:none}}
.trailerOut{animation:trailerOut .8s ease forwards}@keyframes trailerOut{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-30px)}}
.hypeIn{animation:hypeIn .55s cubic-bezier(.2,1.4,.3,1)}@keyframes hypeIn{0%{opacity:0;transform:scale(1.35)}60%{opacity:1;transform:scale(.97)}100%{opacity:1;transform:scale(1)}}
.hypeCry{animation:hypeCry .7s ease .25s both}@keyframes hypeCry{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:none}}
.comboChip{animation:comboPop .45s cubic-bezier(.3,1.7,.4,1)}@keyframes comboPop{0%{transform:scale(1.5) rotate(-4deg)}100%{transform:scale(1) rotate(0)}}
.cry2{animation:cry2In .5s cubic-bezier(.2,1.4,.4,1)}@keyframes cry2In{0%{opacity:0;transform:scale(.92) translateX(-10px)}100%{opacity:1;transform:none}}
.tvDot{animation:p 1.4s infinite}@keyframes p{0%,100%{opacity:1}50%{opacity:.3}}
.goalGlint{position:relative;overflow:hidden}
.goalGlint::after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,#ffffff18 50%,transparent 70%);animation:glint 3.2s ease-in-out infinite}
@keyframes glint{0%{transform:translateX(-100%)}60%,100%{transform:translateX(100%)}}
input,button,textarea{font-family:inherit}input::placeholder,textarea::placeholder{color:#55525f}
button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid #fff8;outline-offset:2px}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

export const S = {
  root: { minHeight: "100vh", background: BG, color: INK, fontFamily: FC, padding: "0 0 50px" },
  wrap: { maxWidth: 540, margin: "0 auto", padding: "26px 18px" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  langPick: { display: "flex", gap: 4 },
  langBtn: { width: 30, height: 30, borderRadius: 8, border: `1px solid ${LINE}`, background: CARD, fontSize: 15, cursor: "pointer", opacity: .5, lineHeight: 1 },
  langOn: { opacity: 1, borderColor: "#fff5" },
  eyebrow: { fontFamily: FM, fontSize: 11, letterSpacing: 3, color: DIM },
  homeHero: { textAlign: "center", margin: "30px 0 22px" },
  homeH1: { fontFamily: FD, fontWeight: 900, fontSize: 40, letterSpacing: -1.8, lineHeight: .95, marginBottom: 12 },
  homeLead: { color: DIM, fontSize: 15, lineHeight: 1.5, maxWidth: 380, margin: "0 auto" },
  homeDemo: { background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 18, marginBottom: 18 },
  homeDemoBadge: { fontFamily: FM, fontSize: 10, letterSpacing: 2, color: "#5ad07a", textAlign: "center", marginBottom: 12 },
  homeDemoMkt: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  homeCtaMain: { width: "100%", padding: 16, borderRadius: 13, border: "none", background: INK, color: BG, fontFamily: FD, fontWeight: 800, fontSize: 16, cursor: "pointer", marginBottom: 10 },
  homeCtaAlt: { width: "100%", padding: 14, borderRadius: 13, border: `1px solid ${LINE}`, background: "transparent", color: INK, fontFamily: FD, fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 24 },
  homeFeatures: { display: "flex", flexDirection: "column", gap: 10 },
  homeFeature: { display: "flex", alignItems: "center", gap: 11, fontFamily: FC, fontSize: 14, color: "#c4c1cd" },
  homeFeatureIcon: { fontFamily: FM, fontSize: 17, color: "#ffb84a", width: 20, textAlign: "center" },
  replayLink: { display: "block", margin: "20px auto 0", background: "none", border: "none", color: DIM, fontFamily: FM, fontSize: 11, letterSpacing: 1, cursor: "pointer" },
  // TRAILER
  troot: { position: "relative", minHeight: "100vh", maxWidth: 460, margin: "0 auto", background: "#08070c", color: INK, fontFamily: FC, padding: "26px 20px", overflow: "hidden", display: "flex", flexDirection: "column" },
  aurora: { position: "absolute", inset: 0, pointerEvents: "none" },
  skip: { position: "absolute", top: 18, right: 18, zIndex: 30, background: "none", border: `1px solid ${LINE}`, color: DIM, fontFamily: FM, fontSize: 11, padding: "5px 11px", borderRadius: 8, cursor: "pointer" },
  tLogoWrap: { textAlign: "center", marginBottom: 22, position: "relative" },
  tLogo: { fontFamily: FD, fontWeight: 900, fontStyle: "italic", fontSize: 34, letterSpacing: -1 },
  tTagline: { fontFamily: FM, fontSize: 11, letterSpacing: 2, color: DIM, marginTop: 6 },
  introMatch: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, flex: 1 },
  introSide: { fontFamily: FD, fontWeight: 900, fontSize: 30, letterSpacing: -1, textAlign: "center" },
  introEmoji: { fontSize: 44, marginBottom: 8 },
  introVs: { fontFamily: FM, fontSize: 18, fontStyle: "italic", color: "#555" },
  scoreRow: { position: "relative", display: "flex", justifyContent: "space-between", marginBottom: 10 },
  scoreName: { fontFamily: FD, fontWeight: 800, fontSize: 16 },
  scorePct: { fontFamily: FM, fontWeight: 700, fontSize: 38, lineHeight: .9, letterSpacing: -2 },
  tBoardWrap: { position: "relative", borderRadius: 14, overflow: "hidden", boxShadow: "0 0 0 1px #ffffff10, 0 30px 70px -30px #000, 0 0 60px -24px #ffae3a33" },
  tBoard: { display: "grid", gap: 0, aspectRatio: "1" },
  tFeed: { marginTop: 14, display: "flex", flexDirection: "column", gap: 5, minHeight: 76 },
  tFeedItem: { fontFamily: FC, fontSize: 13, color: "#b6b3bf", background: "#13111980", borderRadius: 8, padding: "7px 11px", border: `1px solid ${LINE}` },
  tWinOverlay: { position: "absolute", inset: 0, background: "#08070cee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, backdropFilter: "blur(3px)" },
  tCrown: { fontSize: 70, lineHeight: 1 },
  tWinLabel: { fontFamily: FM, fontSize: 12, letterSpacing: 5, color: DIM, marginTop: 12 },
  tWinName: { fontFamily: FD, fontWeight: 900, fontSize: 54, letterSpacing: -2, lineHeight: 1, margin: "6px 0 18px" },
  tEnterBtn: { padding: "13px 28px", borderRadius: 12, border: "none", background: INK, color: BG, fontFamily: FD, fontWeight: 800, fontSize: 15, cursor: "pointer" },
  demoTag: { position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", fontFamily: FM, fontSize: 10, letterSpacing: 1, color: "#5ad07a", whiteSpace: "nowrap" },
  // CRIAR
  h1: { fontFamily: FD, fontWeight: 900, fontSize: 38, letterSpacing: -1.5, lineHeight: .95, marginBottom: 8 },
  lead: { color: DIM, fontSize: 15, marginBottom: 24, maxWidth: 380 },
  preview: { background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 26 },
  previewTitle: { fontFamily: FD, fontWeight: 800, fontSize: 17, textAlign: "center", marginBottom: 12 },
  previewMkt: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  pSide: { flex: 1, display: "flex", alignItems: "center", gap: 7 }, pImg: { width: 26, height: 26, objectFit: "contain" },
  pName: { fontFamily: FD, fontWeight: 800, fontSize: 16 }, pVs: { fontFamily: FM, color: "#444", fontSize: 16 },
  previewBar: { display: "flex", height: 8, borderRadius: 99, overflow: "hidden" },
  label: { fontFamily: FM, fontSize: 11, letterSpacing: 1, color: DIM, marginBottom: 7, textTransform: "uppercase" },
  input: { width: "100%", padding: "12px 14px", borderRadius: 11, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 15, fontFamily: FC, outline: "none" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  colorRow: { display: "flex", alignItems: "center", gap: 9 },
  color: { width: 46, height: 38, border: `1px solid ${LINE}`, borderRadius: 10, background: "none", cursor: "pointer", padding: 2 },
  hex: { fontFamily: FM, fontSize: 12, color: DIM },
  up: { padding: "11px 14px", borderRadius: 11, border: `1px dashed #3a3744`, background: CARD, color: INK, fontSize: 13, cursor: "pointer", flex: 1, fontFamily: FC, fontWeight: 600 },
  clear: { background: "none", border: "none", color: "#ff6a6a", fontSize: 12, cursor: "pointer" },
  tip: { background: CARD, border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#b6b3bf", margin: "6px 0 22px", lineHeight: 1.5 },
  launch: { width: "100%", padding: 16, borderRadius: 13, border: "none", background: INK, color: BG, fontFamily: FD, fontWeight: 800, fontSize: 16, cursor: "pointer" },
  note: { textAlign: "center", fontFamily: FM, fontSize: 10, color: "#55525f", marginTop: 12 },
  // ESTÚDIO v2
  skinRow: { display: "flex", gap: 8, marginBottom: 4 },
  skinChip: { flex: 1, padding: "11px 6px", borderRadius: 11, border: `1px solid ${LINE}`, background: "#0e0c14", color: DIM, fontFamily: FD, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: ".18s" },
  skinChipOn: { borderColor: "#fff6", color: "#fff", background: CARD },
  studioCard: { background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 16px", marginBottom: 18 },
  studioHint: { fontSize: 12, color: DIM, marginTop: 8, lineHeight: 1.45 },
  earnRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 },
  earnBig: { fontFamily: FM, fontWeight: 700, fontSize: 26, color: "#5ad07a" },
  earnSmall: { fontFamily: FM, fontSize: 12, color: DIM },
  earnLabel: { fontFamily: FM, fontSize: 10, letterSpacing: 1, color: DIM, textTransform: "uppercase" },
  // JOGAR
  proot: { minHeight: "100vh", maxWidth: 540, margin: "0 auto", color: INK, fontFamily: FC, padding: "14px 16px 96px", position: "relative", overflowX: "hidden" },
  phead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  back: { background: "none", border: `1px solid ${LINE}`, color: DIM, fontSize: 12, padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontFamily: FM },
  brand: { fontFamily: FD, fontWeight: 900, fontSize: 18, letterSpacing: 1 },
  demoBadge: { textAlign: "center", fontFamily: FM, fontSize: 10, letterSpacing: 1, color: "#75727f", background: "#15131c", border: `1px solid ${LINE}`, borderRadius: 99, padding: "5px 0", marginBottom: 16 },
  shareTop: { background: "none", border: `1px solid ${LINE}`, color: INK, fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontFamily: FM },
  tvTop: { background: "none", border: `1px solid ${LINE}`, color: "#5ad07a", fontSize: 12, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontFamily: FM, fontWeight: 700 },
  hero: { marginBottom: 14 },
  tickerRow: { display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 6 },
  tkSide: { display: "flex", flexDirection: "column", gap: 2 },
  tkName: { fontFamily: FD, fontWeight: 800, fontSize: 17, letterSpacing: -.3 },
  tkPct: { fontFamily: FM, fontWeight: 700, fontSize: 46, lineHeight: .9, letterSpacing: -2 },
  pctMini: { fontSize: 18, opacity: .5, letterSpacing: 0 },
  tkVs: { fontFamily: FM, color: "#3a3744", fontSize: 20, alignSelf: "center" },
  title: { fontFamily: FD, fontWeight: 800, fontSize: 21, textAlign: "center", letterSpacing: -.5, marginTop: 2 },
  onboard: { textAlign: "center", fontSize: 13, color: DIM, marginTop: 8, maxWidth: 360, marginLeft: "auto", marginRight: "auto", lineHeight: 1.45 },
  comboChip: { position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", fontFamily: FD, fontWeight: 900, fontSize: 12, letterSpacing: 1, color: "#1a1200", background: "linear-gradient(100deg,#ffd24a,#ff8a3b)", borderRadius: 99, padding: "5px 13px", boxShadow: "0 6px 22px -6px #ff8a3b99", zIndex: 5, whiteSpace: "nowrap" },
  quote: { position: "relative", height: 14, borderRadius: 99, overflow: "hidden", display: "flex", marginBottom: 8, boxShadow: "inset 0 0 0 1px #ffffff14" },
  winMark: { position: "absolute", top: 0, bottom: 0, width: 2, zIndex: 1 },
  cursor: { position: "absolute", top: -3, width: 2, height: 20, background: "#fff", boxShadow: "0 0 14px #fff", transition: "left .7s cubic-bezier(.34,1.3,.5,1)" },
  goalBar: { display: "flex", alignItems: "center", gap: 8, fontFamily: FM, fontSize: 11, color: DIM, marginBottom: 14, padding: "7px 11px", background: "#100e16", border: `1px solid ${LINE}`, borderRadius: 9 },
  goalIcon: { color: "#ffb84a", fontSize: 13 },
  holdBanner: { textAlign: "center", border: "2px solid", borderRadius: 14, padding: "12px 16px", marginBottom: 16, background: "#15131c" },
  holdText: { fontFamily: FC, fontSize: 14, color: INK },
  holdNum: { fontFamily: FM, fontWeight: 700, fontSize: 40, lineHeight: 1, margin: "2px 0" },
  holdHint: { fontFamily: FM, fontSize: 10, color: DIM, letterSpacing: 1 },
  boardWrap: { borderRadius: 16, overflow: "hidden" },
  board: { width: "100%", display: "block", aspectRatio: "1" },
  diagram: { background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 16px", margin: "12px 0 16px" },
  diagTitle: { fontFamily: FM, fontSize: 10, letterSpacing: 2, color: DIM, marginBottom: 12 },
  diagSteps: { display: "flex", flexDirection: "column", gap: 10 },
  diagStep: { display: "flex", gap: 11, alignItems: "flex-start" },
  diagIcon: { fontFamily: FM, fontSize: 17, width: 20, textAlign: "center", flexShrink: 0, lineHeight: 1.3 },
  diagText: { fontFamily: FC, fontSize: 13.5, color: "#c4c1cd", lineHeight: 1.4 },
  diagRuler: { marginTop: 14 },
  diagRulerLabel: { display: "flex", justifyContent: "space-between", fontFamily: FM, fontSize: 10, color: DIM, marginTop: 5 },
  rank: { background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "12px 14px", marginBottom: 14 },
  rankTitle: { fontFamily: FM, fontSize: 10, letterSpacing: 2, color: DIM, marginBottom: 8 },
  rankRow: { display: "flex", alignItems: "center", padding: "5px 0", borderBottom: `1px solid ${LINE}` },
  rankPos: { fontFamily: FM, fontWeight: 700, fontSize: 14, color: INK, width: 26 },
  rankName: { flex: 1, fontFamily: FC, fontSize: 14, color: INK },
  rankVal: { fontFamily: FM, fontWeight: 700, fontSize: 14, color: DIM },
  crewTag: { fontFamily: FM, fontWeight: 700, fontSize: 11, padding: "1px 6px", borderRadius: 5, marginRight: 6, background: "#0b0910", border: `1px solid ${LINE}` },
  crewJoinRow: { display: "flex", gap: 7, marginBottom: 8 },
  crewInput: { flex: 1, padding: "10px 12px", borderRadius: 10, border: `1px solid ${LINE}`, background: "#0e0c14", color: INK, fontSize: 14, fontFamily: FM, outline: "none", textTransform: "uppercase", minWidth: 0 },
  crewBtn: { padding: "10px 14px", borderRadius: 10, border: "1.5px solid", background: "transparent", fontFamily: FD, fontWeight: 800, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" },
  crewHint: { fontFamily: FC, fontSize: 11.5, color: DIM, lineHeight: 1.4 },
  crewMine: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 12px", background: "#0b0910", borderRadius: 10, marginBottom: 8, border: `1px solid ${LINE}` },
  crewMineTag: { fontFamily: FD, fontWeight: 900, fontSize: 15 },
  crewLeave: { background: "none", border: "none", color: "#ff6a6a", fontSize: 11, cursor: "pointer", fontFamily: FM },
  feed: { display: "flex", flexDirection: "column", gap: 5, marginBottom: 18, minHeight: 34 },
  feedEmpty: { fontFamily: FM, fontSize: 12, color: "#55525f", textAlign: "center", padding: "8px 0" },
  feedItem: { display: "flex", alignItems: "center", flexWrap: "wrap", fontSize: 13, color: "#b6b3bf", background: CARD, borderRadius: 8, padding: "8px 12px", border: `1px solid ${LINE}` },
  feedMe: { borderColor: "#ffffff33", color: "#fff" },
  feedCry: { width: "100%", marginTop: 5, fontFamily: FC, fontSize: 13, color: INK, fontStyle: "italic" },
  feedTier2: { borderWidth: 1.5, background: "#191420", padding: "11px 13px" },
  feedTier2Cry: { fontSize: 15, fontWeight: 700, fontStyle: "normal" },
  panel: { background: CARD, border: `1px solid ${LINE}`, borderRadius: 18, padding: 16, marginBottom: 14 },
  nameInput: { width: "100%", padding: "12px 14px", borderRadius: 11, border: `1px solid ${LINE}`, background: "#0e0c14", color: INK, fontSize: 15, marginBottom: 12, outline: "none", fontFamily: FC },
  sides: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 },
  sideBtn: { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "13px 6px", borderRadius: 11, border: `1px solid ${LINE}`, background: "#0e0c14", color: DIM, fontFamily: FD, fontSize: 14, fontWeight: 800, cursor: "pointer", transition: ".18s" },
  sideImg: { width: 20, height: 20, objectFit: "contain" },
  flairRow: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 },
  flairBtn: { width: 36, height: 36, borderRadius: 9, border: `1px solid ${LINE}`, background: "#0e0c14", fontSize: 17, cursor: "pointer", opacity: .55, lineHeight: 1 },
  flairOn: { opacity: 1, borderColor: "#fff6", background: CARD },
  tryBtn: { width: "100%", padding: 12, borderRadius: 11, border: "1.5px dashed", background: "transparent", fontFamily: FD, fontWeight: 800, fontSize: 14, cursor: "pointer", marginBottom: 14 },
  firstMove: { background: "#0e0c14", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", marginBottom: 4 },
  firstMoveTag: { fontFamily: FM, fontSize: 10, letterSpacing: 2, color: DIM, marginBottom: 6 },
  firstMoveRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline" },
  firstMoveText: { fontFamily: FC, fontSize: 15, color: INK },
  firstMovePrice: { fontFamily: FM, fontWeight: 700, fontSize: 24 },
  qtyRow: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  qtyNum: { fontFamily: FM, fontWeight: 700, fontSize: 24 },
  qtyUnit: { fontSize: 12, color: DIM, marginLeft: 6, fontFamily: FC },
  qtyPrice: { fontFamily: FM, fontSize: 16, color: INK },
  range: { width: "100%", marginBottom: 4 },
  epic: { fontFamily: FC, fontSize: 12, color: "#ffb84a", background: "#1e1605", border: "1px solid #3a2a08", borderRadius: 8, padding: "8px 10px", marginTop: 8 },
  handicapNote: { fontFamily: FC, fontSize: 12, color: "#5ad07a", background: "#06160c", border: "1px solid #0e3a1e", borderRadius: 8, padding: "8px 10px", marginTop: 8 },
  planNote: { fontFamily: FM, fontSize: 11, color: DIM, marginTop: 8, lineHeight: 1.4 },
  eternal: { marginTop: 16, border: "1px solid", borderRadius: 14, padding: 14, background: "linear-gradient(180deg,#16131e,#0e0c14)" },
  eternalHead: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  eternalTitle: { fontFamily: FD, fontWeight: 800, fontSize: 16 },
  eternalSub: { fontSize: 12, color: DIM, marginTop: 3 },
  eternalScarce: { textAlign: "center", lineHeight: 1 },
  eternalLeft: { fontFamily: FM, fontWeight: 700, fontSize: 24 },
  eternalCap: { fontFamily: FM, fontSize: 10, color: DIM, marginTop: 2 },
  eternalPreview: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "9px 11px", background: "#0b0910", borderRadius: 9 },
  eternalChip: { fontFamily: FD, fontWeight: 800, fontSize: 12, padding: "4px 9px", borderRadius: 6 },
  eternalIn: { fontSize: 12, color: DIM },
  eternalBtn: { width: "100%", padding: 12, borderRadius: 10, border: "1.5px solid", background: "transparent", fontFamily: FD, fontWeight: 800, fontSize: 14, cursor: "pointer" },
  sticky: { position: "sticky", bottom: 14, zIndex: 30, display: "flex", gap: 8 },
  pay: { flex: 1, padding: "16px 18px", borderRadius: 14, border: "none", fontFamily: FD, fontWeight: 900, fontSize: 15, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" },
  payAmt: { fontFamily: FM, fontSize: 16 },
  payShare: { width: 54, borderRadius: 14, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 20, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "#000c", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50, backdropFilter: "blur(5px)" },
  sheet: { background: "#131119", borderRadius: "22px 22px 0 0", padding: "16px 18px 30px", width: "100%", maxWidth: 540, animation: "slideUp .3s ease" },
  grab: { width: 40, height: 4, borderRadius: 99, background: "#33303d", margin: "0 auto 16px" },
  sheetTop: { display: "flex", alignItems: "center", gap: 11, marginBottom: 14 },
  sheetMeta: { fontFamily: FM, fontSize: 12, color: DIM, marginTop: 2 },
  qr: { width: 180, height: 180, background: "#fff", borderRadius: 14, margin: "0 auto 12px", display: "grid", placeItems: "center", padding: 10 },
  qrInner: { width: "100%", height: "100%", background: "repeating-conic-gradient(#000 0 25%,#fff 0 50%) 0 0/22px 22px", borderRadius: 4 },
  cryBox: { marginBottom: 12 },
  cryLabel: { fontFamily: FM, fontSize: 10, letterSpacing: 2, color: DIM, marginBottom: 7 },
  cryInput: { width: "100%", padding: "11px 13px", borderRadius: 11, border: `1px solid ${LINE}`, background: "#0e0c14", color: INK, fontSize: 14, fontFamily: FC, outline: "none", resize: "none" },
  cryChips: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 },
  cryChip: { fontFamily: FC, fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: 99, border: `1px solid ${LINE}`, background: "#0e0c14", color: "#c4c1cd", cursor: "pointer" },
  cryTierNote: { fontFamily: FM, fontSize: 10, color: DIM, marginTop: 7, lineHeight: 1.5 },
  term: { fontSize: 11, color: DIM, background: "#0b0910", border: `1px solid ${LINE}`, borderRadius: 10, padding: "10px 12px", marginBottom: 12, lineHeight: 1.5 },
  sheetCta: { width: "100%", padding: 15, borderRadius: 12, border: "none", fontFamily: FD, fontWeight: 800, fontSize: 15, cursor: "pointer" },
  sheetH: { fontFamily: FD, fontWeight: 800, fontSize: 20, margin: "12px 0 3px" },
  sheetP: { fontSize: 13, color: DIM },
  check: { width: 60, height: 60, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 28, margin: "0 auto", fontWeight: 900 },
  spin: { width: 44, height: 44, borderRadius: "50%", border: "3px solid #ffffff22", margin: "0 auto" },
  winOverlay: { position: "fixed", inset: 0, background: "#000d", display: "grid", placeItems: "center", zIndex: 70, padding: 22, backdropFilter: "blur(7px)" },
  winCard: { background: "linear-gradient(170deg,#1a1722,#0b0910)", border: `1px solid ${LINE}`, borderRadius: 22, padding: "30px 24px", maxWidth: 360, width: "100%", textAlign: "center" },
  crown: { fontSize: 56, lineHeight: 1 },
  winLabel: { fontFamily: FM, fontSize: 11, letterSpacing: 4, color: DIM, marginTop: 8 },
  winName: { fontFamily: FD, fontWeight: 900, fontSize: 42, letterSpacing: -1, lineHeight: 1, margin: "4px 0" },
  winSub: { fontSize: 13, color: DIM, marginBottom: 8 },
  winMsg: { fontFamily: FC, fontSize: 15, color: INK, fontStyle: "italic", margin: "10px 0 2px", lineHeight: 1.4 },
  winRank: { background: "#0b0910", border: `1px solid ${LINE}`, borderRadius: 12, padding: "12px 14px", marginTop: 14, textAlign: "left" },
  shareCard: { background: "linear-gradient(160deg,#1a1722,#0b0910)", border: `1px solid ${LINE}`, borderRadius: 16, padding: 20 },
  shareCardTop: { fontFamily: FD, fontWeight: 800, fontSize: 19, textAlign: "center", marginBottom: 16 },
  shareCardMkt: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  shareCardFoot: { fontFamily: FM, fontSize: 11, color: DIM, textAlign: "center", marginTop: 16, letterSpacing: 1 },
  shareHint: { textAlign: "center", fontSize: 11, color: DIM, marginTop: 10 },
  shareGrid: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10, justifyContent: "center" },
  shareChip: { fontFamily: FM, fontSize: 12, fontWeight: 700, padding: "8px 13px", borderRadius: 99, border: `1px solid ${LINE}`, background: "#0e0c14", textDecoration: "none" },
  toast: { position: "fixed", bottom: 92, left: "50%", transform: "translateX(-50%)", background: "#fff", color: "#000", padding: "11px 20px", borderRadius: 99, fontFamily: FD, fontWeight: 700, fontSize: 13, zIndex: 80, whiteSpace: "nowrap", boxShadow: "0 10px 40px -10px #000" },
  // HYPE — tomada de tela em jogadas tier 3 / Eterno
  hypeOverlay: { position: "fixed", inset: 0, zIndex: 90, display: "grid", placeItems: "center", padding: 24, backdropFilter: "blur(6px)" },
  hypeCard: { textAlign: "center", maxWidth: 420 },
  hypeAmt: { fontFamily: FM, fontWeight: 700, fontSize: 20, letterSpacing: 1, marginBottom: 8 },
  hypeName: { fontFamily: FD, fontWeight: 900, fontSize: 46, letterSpacing: -1.5, lineHeight: 1 },
  hypeTitle: { fontFamily: FM, fontSize: 12, letterSpacing: 4, margin: "10px 0 2px" },
  hypeCryTxt: { fontFamily: FC, fontSize: 20, fontWeight: 700, fontStyle: "italic", marginTop: 14, lineHeight: 1.35 },
  hypeCrew: { display: "inline-block", fontFamily: FM, fontWeight: 700, fontSize: 13, padding: "3px 10px", borderRadius: 7, marginTop: 12, border: "1px solid #ffffff44" },
};
