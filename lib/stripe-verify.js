// Verificação da assinatura do webhook do Stripe (header `stripe-signature`)
// sem depender da lib oficial: HMAC-SHA256 de `${timestamp}.${payload}` com o
// STRIPE_WEBHOOK_SECRET, comparação em tempo constante e tolerância de relógio
// pra bloquear replay. Formato do header: "t=123,v1=abc,v1=def,v0=..."
import crypto from "crypto";

export function verifyStripeSignature(payload, sigHeader, secret, { toleranceSec = 300, nowSec } = {}) {
  if (!payload || !sigHeader || !secret) return false;
  let t = null; const v1s = [];
  for (const part of String(sigHeader).split(",")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
    if (k === "t") t = v;
    else if (k === "v1") v1s.push(v);
  }
  if (!t || v1s.length === 0) return false;
  const now = nowSec ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(t)) > toleranceSec) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const exp = Buffer.from(expected, "hex");
  return v1s.some(v => {
    try { const got = Buffer.from(v, "hex"); return got.length === exp.length && crypto.timingSafeEqual(got, exp); }
    catch { return false; }
  });
}
