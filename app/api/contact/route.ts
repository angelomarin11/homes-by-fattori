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

export async function POST(request: Request) {
  let data: ContactPayload;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const fullName = (data.fullName ?? "").trim();
  const email = (data.email ?? "").trim();
  const country = (data.country ?? "").trim();
  const property = (data.property ?? "").trim();
  const format = (data.format ?? "").trim();
  const framing = (data.framing ?? "").trim();

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

  const phone = (data.phone ?? "").trim();
  const source = (data.source ?? "").trim();
  const notes = (data.notes ?? "").trim();

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
      reply_to: email,
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
