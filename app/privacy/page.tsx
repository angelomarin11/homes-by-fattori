import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Homes by Fattori collects, uses, and protects the information you share through our commission enquiry form.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2026">
      <p>
        Homes by Fattori (&ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your
        privacy. This policy explains what we collect when you contact us and
        how we use it. Questions? Email{" "}
        <a href="mailto:hello@homesbyfattori.com">hello@homesbyfattori.com</a>.
      </p>

      <h2>What we collect</h2>
      <p>
        When you submit the commission enquiry form we collect the details you
        provide: your name, email address, optional phone/WhatsApp number,
        country, a description of your property, your format and framing
        preferences, how you heard about us, and any notes you add.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To respond to your enquiry and prepare a quote.</li>
        <li>To create and deliver a portrait if you choose to commission one.</li>
        <li>To keep in touch about your specific order.</li>
      </ul>
      <p>
        We do not sell, rent, or trade your personal information. We do not send
        marketing emails unless you ask us to.
      </p>

      <h2>Analytics</h2>
      <p>
        We may use privacy-respecting analytics to understand how the site is
        used. This data is aggregated and not used to identify you personally.
      </p>

      <h2>Retention &amp; your rights</h2>
      <p>
        We keep enquiry details only as long as needed to serve you. You may ask
        us to access, correct, or delete your information at any time by emailing{" "}
        <a href="mailto:hello@homesbyfattori.com">hello@homesbyfattori.com</a> —
        consistent with your rights under applicable law (including the LGPD in
        Brazil and the GDPR in Europe).
      </p>
    </LegalShell>
  );
}
