// Testes da verificação de assinatura do webhook Stripe.
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { verifyStripeSignature } from "../lib/stripe-verify.js";

const SECRET = "whsec_test_123";
const NOW = 1_750_000_000;
const sign = (payload, t = NOW, secret = SECRET) =>
  crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");

test("assinatura válida passa", () => {
  const payload = JSON.stringify({ type: "checkout.session.completed" });
  const header = `t=${NOW},v1=${sign(payload)}`;
  assert.equal(verifyStripeSignature(payload, header, SECRET, { nowSec: NOW }), true);
});

test("payload adulterado falha", () => {
  const payload = JSON.stringify({ gross: 10 });
  const header = `t=${NOW},v1=${sign(payload)}`;
  const tampered = JSON.stringify({ gross: 10000 });
  assert.equal(verifyStripeSignature(tampered, header, SECRET, { nowSec: NOW }), false);
});

test("segredo errado falha", () => {
  const payload = "{}";
  const header = `t=${NOW},v1=${sign(payload, NOW, "whsec_other")}`;
  assert.equal(verifyStripeSignature(payload, header, SECRET, { nowSec: NOW }), false);
});

test("timestamp velho (replay) falha", () => {
  const payload = "{}";
  const old = NOW - 3600;
  const header = `t=${old},v1=${sign(payload, old)}`;
  assert.equal(verifyStripeSignature(payload, header, SECRET, { nowSec: NOW }), false);
});

test("múltiplos v1 — basta um válido (rotação de segredo)", () => {
  const payload = "{}";
  const header = `t=${NOW},v1=${"0".repeat(64)},v1=${sign(payload)},v0=ignorado`;
  assert.equal(verifyStripeSignature(payload, header, SECRET, { nowSec: NOW }), true);
});

test("header ausente/malformado falha sem lançar", () => {
  assert.equal(verifyStripeSignature("{}", null, SECRET), false);
  assert.equal(verifyStripeSignature("{}", "", SECRET), false);
  assert.equal(verifyStripeSignature("{}", "lixo", SECRET), false);
  assert.equal(verifyStripeSignature("{}", `t=${NOW},v1=nao-hex`, SECRET, { nowSec: NOW }), false);
  assert.equal(verifyStripeSignature("{}", `t=${NOW},v1=abc`, undefined, { nowSec: NOW }), false);
});
