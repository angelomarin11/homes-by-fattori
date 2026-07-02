// ============================================================================
//  Regras do jogo — fonte única de constantes + helpers puros de gamificação.
//  A MECÂNICA econômica não mudou (ver CLAUDE.md): o que a v2 adiciona é
//  status, voz e time — nunca vantagem econômica comprável fora das regras.
// ============================================================================

export const GRID = 24;
export const BASE = 2;             // preço do bloco virgem na moeda do locale
export const WIN_PCT = 80;
export const HOLD_HOURS = 24;      // sustentar 80% por 24h reais pra vencer
export const ETERNAL_PRICE = 100;
export const ETERNAL_CAP = 50;
export const SPLIT = { creator: 70, platform: 30 };

// GRITO DE GUERRA — camadas por gasto (estilo super-chat, mas o dinheiro
// continua comprando BLOCOS; o grito é o palco que vem junto):
//   tier 1: aparece no mural · tier 2 (15+): destacado · tier 3 (50+): toma a tela
export const CRY_MAX = 80;
export const CRY_TIER2_MIN = 15;
export const CRY_TIER3_MIN = 50;
export const cryTier = (spent) => (spent >= CRY_TIER3_MIN ? 3 : spent >= CRY_TIER2_MIN ? 2 : 1);

// COMBO — jogadas seguidas dentro da janela mantêm o fogo aceso (só status)
export const COMBO_WINDOW_MS = 90_000;

// EMBLEMAS que o jogador crava nos blocos que toma (personalização)
export const FLAIRS = ["★", "⚔️", "🔥", "👑", "🛡️", "⚡", "💎", "🕊️", "😈", "🎯"];

// EQUIPES — tag curta, só status (sem payout: pagar por recrutar = pirâmide)
export const CREW_TAG_MAX = 5;
export const normalizeCrewTag = (s) =>
  (s || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CREW_TAG_MAX);

// META COLETIVA — próximo marco de território acima do atual (dá propósito
// a gastos pequenos: "faltam N blocos pra chegar a X%")
export const MILESTONES = [55, 60, 65, 70, 75, WIN_PCT];
export function nextGoal(sidePct, sideCount, total) {
  const next = MILESTONES.find((m) => m > sidePct);
  if (!next) return null;
  const need = Math.ceil((total * next) / 100) - sideCount;
  return need > 0 ? { pct: next, need } : null;
}

// SKINS da arena — personalização visual do criador
export const SKINS = {
  carvao: {
    key: "carvao",
    aurora: "radial-gradient(ellipse at 25% 8%, #ffce5514, transparent 42%), radial-gradient(ellipse at 78% 12%, #c0231d1a, transparent 45%)",
    boardShadow: "0 0 0 1px #ffffff0e, 0 30px 80px -32px #000",
  },
  neon: {
    key: "neon",
    aurora: "radial-gradient(ellipse at 20% 6%, #22e0ff22, transparent 40%), radial-gradient(ellipse at 82% 12%, #ff3b6b26, transparent 44%)",
    boardShadow: "0 0 0 1px #ffffff14, 0 0 44px -8px #22e0ff55, 0 0 70px -18px #ff3b6b55, 0 30px 80px -32px #000",
  },
  ouro: {
    key: "ouro",
    aurora: "radial-gradient(ellipse at 50% 0%, #ffce5526, transparent 50%)",
    boardShadow: "0 0 0 1.5px #f5c84b44, 0 0 50px -12px #f5c84b66, 0 30px 80px -32px #000",
  },
};
export const skinOf = (key) => SKINS[key] || SKINS.carvao;
