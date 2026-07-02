// Dados de exemplo para a pré-visualização de /d/[id]?demo=1.
// Rotulado na tela como demonstração — nunca confundir com disputa real.
import { GRID, BASE } from "./rules";

export const MOCK_DUEL = {
  id: "demo", title: "Jesus vs Diabo",
  side_a: "Jesus", side_b: "Diabo",
  color_a: "#F5C84B", color_b: "#E03A2F",
  img_a: null, img_b: null,
  grid: GRID, base_price: BASE, currency: "BRL",
  skin: "carvao",
  cries: ["Pela Luz!", "Hoje tem virada", "Ninguém segura a gente"],
  victory_msg: "A fé moveu o mapa.",
  win_pct: 80, hold_hours: 24, eternal_cap: 50, eternal_price: 100,
  status: "active", leading_side: null, hold_until: null, winner: null,
  creators: { name: "Padre André" },
};

export function mockBlocks() {
  // fronteira levemente irregular + alguns blocos com dono/emblema
  const rows = [];
  for (let p = 0; p < GRID * GRID; p++) {
    const col = p % GRID, row = (p / GRID) | 0;
    const shift = row % 5 === 0 ? 1 : row % 7 === 0 ? -1 : 0;
    const side = col < GRID / 2 + shift ? "a" : "b";
    rows.push({ pos: p, side, owner_name: null, price: BASE, eternal: false, flair: null });
  }
  [{ p: 275, n: "Maria", f: "⚔️" }, { p: 276, n: "Maria", f: "⚔️" }, { p: 299, n: "Dante", f: "😈" }].forEach(({ p, n, f }) => {
    rows[p] = { ...rows[p], owner_name: n, flair: f, price: BASE * 2 };
  });
  rows[288] = { ...rows[288], owner_name: "Lúcia", flair: "🕊️", eternal: true, price: 999999 };
  return rows;
}

export const MOCK_RANKING = [
  { buyer_name: "Maria", blocks: 34 }, { buyer_name: "Dante", blocks: 27 },
  { buyer_name: "Lúcia", blocks: 19 }, { buyer_name: "Gabriel", blocks: 8 },
];
export const MOCK_CREWS = [
  { tag: "FIEL", side: "a", points: 61 }, { tag: "CAOS", side: "b", points: 44 },
];
export const MOCK_FEED = [
  { buyer_name: "Maria", side: "a", cry: "Pela Luz!", crew: "FIEL", gross: 52, kind: "blocks", positions: Array(11), paid_at: "2026-01-01T12:03:00Z" },
  { buyer_name: "Dante", side: "b", cry: "Hoje o mapa escurece", crew: "CAOS", gross: 18, kind: "blocks", positions: Array(6), paid_at: "2026-01-01T12:01:00Z" },
  { buyer_name: "Lúcia", side: "a", cry: null, crew: null, gross: 100, kind: "eternal", positions: [], paid_at: "2026-01-01T11:58:00Z" },
];
