// Testes das regras puras — rodar com `npm test` (node --test).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cryTier, CRY_TIER2_MIN, CRY_TIER3_MIN,
  normalizeCrewTag, nextGoal, MILESTONES, skinOf, GRID, WIN_PCT,
} from "../components/duality/rules.js";
import { computeSplit, gatewayFor, SPLIT } from "../lib/payments.js";

test("cryTier: palco cresce com o gasto", () => {
  assert.equal(cryTier(1), 1);
  assert.equal(cryTier(CRY_TIER2_MIN - 0.01), 1);
  assert.equal(cryTier(CRY_TIER2_MIN), 2);
  assert.equal(cryTier(CRY_TIER3_MIN - 0.01), 2);
  assert.equal(cryTier(CRY_TIER3_MIN), 3);
  assert.equal(cryTier(500), 3);
});

test("normalizeCrewTag: maiúsculas, sem símbolos, máx 5", () => {
  assert.equal(normalizeCrewTag("fiel"), "FIEL");
  assert.equal(normalizeCrewTag("  lo-bo! "), "LOBO");
  assert.equal(normalizeCrewTag("ABCDEFGH"), "ABCDE");
  assert.equal(normalizeCrewTag("⚑⚑"), "");
  assert.equal(normalizeCrewTag(null), "");
});

test("nextGoal: aponta o próximo marco acima do atual", () => {
  const total = GRID * GRID; // 576
  const g50 = nextGoal(50, total / 2, total);
  assert.equal(g50.pct, 55);
  assert.equal(g50.need, Math.ceil(total * 0.55) - total / 2);
  // já na zona de vitória → sem próximo marco
  assert.equal(nextGoal(WIN_PCT, Math.ceil(total * WIN_PCT / 100), total), null);
  assert.equal(nextGoal(99, 570, total), null);
});

test("nextGoal: marcos são crescentes e terminam na zona de vitória", () => {
  assert.deepEqual([...MILESTONES].sort((a, b) => a - b), MILESTONES);
  assert.equal(MILESTONES[MILESTONES.length - 1], WIN_PCT);
});

test("skinOf: skin desconhecida cai no padrão carvão", () => {
  assert.equal(skinOf("neon").key, "neon");
  assert.equal(skinOf("hacker").key, "carvao");
  assert.equal(skinOf(undefined).key, "carvao");
});

test("computeSplit: 70/30 fecha o total sem perder centavo", () => {
  assert.deepEqual(SPLIT, { creator: 0.70, platform: 0.30 });
  for (const gross of [1, 2, 9.99, 10, 52.37, 100, 999.99]) {
    const { creatorCut, platformCut } = computeSplit(gross);
    assert.equal(+(creatorCut + platformCut).toFixed(2), +gross.toFixed(2), `gross=${gross}`);
    assert.ok(creatorCut >= gross * 0.69 && creatorCut <= gross * 0.71, `creatorCut=${creatorCut}`);
  }
});

test("gatewayFor: BRL→Pix, resto→Stripe", () => {
  assert.equal(gatewayFor("BRL"), "pix");
  assert.equal(gatewayFor("USD"), "stripe");
  assert.equal(gatewayFor("EUR"), "stripe");
});
