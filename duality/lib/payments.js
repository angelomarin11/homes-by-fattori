// ============================================================================
//  lib/payments.js — roteamento de gateway por país + split
//  BR → Pagar.me (Pix, split nativo). Outros → Stripe Connect.
// ============================================================================

export const SPLIT = { creator: 0.70, platform: 0.30 };

// decide o gateway pela moeda da disputa / país do criador
export function gatewayFor(currency) {
  return currency === "BRL" ? "pix" : "stripe";
}

export function computeSplit(gross) {
  const creatorCut = Math.round(gross * 100 * SPLIT.creator) / 100;
  const platformCut = Math.round(gross * 100 - creatorCut * 100) / 100;
  return { creatorCut, platformCut };
}

// ---- PAGAR.ME (Pix com split nativo) ----
export async function createPixOrder({ gross, currency, description, txnId, creatorRecipient, positions }) {
  const { creatorCut, platformCut } = computeSplit(gross);
  const res = await fetch("https://api.pagar.me/core/v5/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(process.env.PAGARME_SECRET_KEY + ":").toString("base64"),
    },
    body: JSON.stringify({
      items: [{ amount: Math.round(gross * 100), description, quantity: 1 }],
      customer: { name: "Player", type: "individual" },
      payments: [{
        payment_method: "pix",
        pix: { expires_in: 3600 },
        split: [
          { amount: Math.round(creatorCut * 100), recipient_id: creatorRecipient, type: "flat",
            options: { charge_processing_fee: true, liable: true } },
          { amount: Math.round(platformCut * 100), recipient_id: process.env.PAGARME_PLATFORM_RECIPIENT_ID, type: "flat",
            options: { charge_processing_fee: false, liable: false } },
        ],
      }],
      metadata: { txn_id: txnId },
    }),
  });
  const order = await res.json();
  if (!res.ok) throw new Error("pagarme: " + JSON.stringify(order));
  const pix = order.charges?.[0]?.last_transaction;
  return { gatewayId: order.id, qrCode: pix?.qr_code, qrCodeUrl: pix?.qr_code_url, expiresAt: pix?.expires_at };
}

// ---- STRIPE (cartão internacional com split via Connect) ----
// Usa o CHECKOUT hospedado do Stripe: página de pagamento pronta no idioma do
// comprador, com Apple Pay / Google Pay e SCA — zero UI de cartão pra manter.
// O split continua nativo: transfer_data manda os 70% pra conta do criador e
// application_fee_amount retém os 30% da plataforma.
export async function createStripeCheckout({ gross, currency, description, txnId, creatorAccount, returnUrl }) {
  const { platformCut } = computeSplit(gross);
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("line_items[0][quantity]", "1");
  params.append("line_items[0][price_data][currency]", currency.toLowerCase());
  params.append("line_items[0][price_data][unit_amount]", String(Math.round(gross * 100)));
  params.append("line_items[0][price_data][product_data][name]", description);
  params.append("payment_intent_data[transfer_data][destination]", creatorAccount);
  params.append("payment_intent_data[application_fee_amount]", String(Math.round(platformCut * 100)));
  params.append("payment_intent_data[metadata][txn_id]", txnId);
  params.append("metadata[txn_id]", txnId);
  params.append("success_url", `${returnUrl}?paid=1`);
  params.append("cancel_url", returnUrl);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Bearer " + process.env.STRIPE_SECRET_KEY,
    },
    body: params,
  });
  const session = await res.json();
  if (!res.ok) throw new Error("stripe: " + JSON.stringify(session));
  return { gatewayId: session.id, checkoutUrl: session.url };
}
