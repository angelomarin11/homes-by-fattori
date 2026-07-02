import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type ContactPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  property?: string;
  format?: string;
  framing?: string;
  source?: string;
  notes?: string;
  agree?: boolean;
  /** Honeypot — humans never see or fill this field. */
  company?: string;
};

// --- basic in-memory rate limiting -----------------------------------------
// Good enough for a single long-lived server; on serverless each instance
// keeps its own window, which still blunts bursts from one client.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recent = (hits.get(ip) ?? []).filter((t) => t > windowStart);

  if (recent.length >= RATE_LIMIT_MAX) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 10_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => t <= windowStart)) hits.delete(key);
    }
  }

  return false;
}

// ---------------------------------------------------------------------------

const FIELD_LIMITS: Record<string, number> = {
  fullName: 120,
  email: 254,
  phone: 40,
  country: 80,
  property: 1500,
  format: 20,
  framing: 30,
  source: 60,
  notes: 3000,
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clean(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let data: ContactPayload;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  // Honeypot filled in → almost certainly a bot. Pretend success so the bot
  // doesn't learn anything, and send nothing.
  if (typeof data.company === "string" && data.company.trim() !== "") {
    return NextResponse.json({ ok: true, emailed: false }, { status: 200 });
  }

  const fullName = clean(data.fullName, FIELD_LIMITS.fullName);
  const email = clean(data.email, FIELD_LIMITS.email);
  const country = clean(data.country, FIELD_LIMITS.country);
  const property = clean(data.property, FIELD_LIMITS.property);
  const format = clean(data.format, FIELD_LIMITS.format);
  const framing = clean(data.framing, FIELD_LIMITS.framing);

  // Server-side validation mirroring the form's required fields.
  if (!fullName || !email || !country || !property || !format || !framing) {
    return NextResponse.json(
      { error: "Please complete all required fields." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  if (!data.agree) {
    return NextResponse.json(
      { error: "Please agree to the Terms & Conditions and Privacy Policy." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "hello@homesbyfattori.com";
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? "Homes by Fattori <onboarding@resend.dev>";

  // If email isn't configured yet, don't 500 — log and let the client show
  // the success state so the site is fully demoable before keys are added.
  if (!apiKey) {
    console.warn(
      "[contact] RESEND_API_KEY not set — skipping email send. Submission:",
      { fullName, email, country, format, framing }
    );
    return NextResponse.json(
      { ok: true, emailed: false },
      { status: 200 }
    );
  }

  const resend = new Resend(apiKey);

  const phone = clean(data.phone, FIELD_LIMITS.phone);
  const source = clean(data.source, FIELD_LIMITS.source);
  const notes = clean(data.notes, FIELD_LIMITS.notes);

  const rows: Array<[string, string]> = [
    ["Name", fullName],
    ["Email", email],
    ["Phone / WhatsApp", phone || "—"],
    ["Country", country],
    ["Property", property],
    ["Format", format],
    ["Framing", framing],
    ["Heard about us", source || "—"],
    ["Additional notes", notes || "—"],
  ];

  const internalHtml = `
    <div style="font-family: Arial, sans-serif; color: #1A2E4A; max-width: 600px;">
      <h2 style="font-weight: 600;">New Commission Enquiry</h2>
      <table style="border-collapse: collapse; width: 100%;">
        ${rows
          .map(
            ([label, value]) => `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #F0EBE0; font-weight: 600; vertical-align: top; width: 180px;">${escapeHtml(
              label
            )}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #F0EBE0;">${escapeHtml(
              value
            ).replace(/\n/g, "<br/>")}</td>
          </tr>`
          )
          .join("")}
      </table>
    </div>`;

  const clientHtml = `
    <div style="font-family: Georgia, 'Times New Roman', serif; color: #1A2E4A; max-width: 560px; line-height: 1.6;">
      <h2 style="font-weight: 400;">Thank you, ${escapeHtml(fullName)}.</h2>
      <p>
        We've received your commission enquiry for a hand-drawn portrait of your home.
        Telma will personally review the details and be in touch within 24 hours to begin.
      </p>
      <p style="color: #555;">
        In the meantime, if you'd like to share photographs of your property, simply reply
        to this email — 3 to 5 high-resolution images help us capture every detail.
      </p>
      <p style="margin-top: 32px;">
        Warmly,<br/>
        <strong>Telma Fattori</strong><br/>
        <span style="color: #B89650;">Homes by Fattori</span>
      </p>
    </div>`;

  try {
    // 1) Internal notification to the studio.
    const internal = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `New commission enquiry — ${fullName} (${format})`,
      html: internalHtml,
    });

    if (internal.error) {
      console.error("[contact] internal email error:", internal.error);
      return NextResponse.json(
        { error: "We couldn't send your enquiry. Please email us directly." },
        { status: 502 }
      );
    }

    // 2) Confirmation to the client (best-effort — don't fail the request if
    //    only this one errors, since the studio already received the enquiry).
    const confirmation = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Thank you — your Homes by Fattori commission enquiry",
      html: clientHtml,
    });

    if (confirmation.error) {
      console.error("[contact] confirmation email error:", confirmation.error);
    }

    return NextResponse.json({ ok: true, emailed: true }, { status: 200 });
  } catch (err) {
    console.error("[contact] unexpected error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please email us directly." },
      { status: 500 }
    );
  }
}
