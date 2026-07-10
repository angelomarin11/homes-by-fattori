import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply to commissioning a hand-drawn home portrait from Homes by Fattori.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms & Conditions" updated="July 2026">
      <p>
        These terms apply when you commission artwork from Homes by Fattori. By
        submitting an enquiry or placing an order, you agree to them.
      </p>

      <h2>Commissions &amp; quotes</h2>
      <p>
        Every portrait is a bespoke, made-to-order work. Submitting the enquiry
        form is a request, not a confirmed order. We&rsquo;ll reply with a quote
        and details; an order is confirmed once you approve it and payment terms
        are agreed.
      </p>

      <h2>The process</h2>
      <p>
        You&rsquo;ll receive a digital sketch to approve before the final artwork
        begins. Reasonable adjustments at the sketch stage are part of the
        service. Once the final hand-drawn original is underway, changes may not
        be possible.
      </p>

      <h2>Originals &amp; intellectual property</h2>
      <p>
        Each portrait is a one-of-a-kind original, signed and certified. You
        receive the physical artwork. The artist retains copyright in the work
        and may display images of completed portraits as part of her portfolio
        unless you request otherwise in writing.
      </p>

      <h2>Payment, cancellation &amp; liability</h2>
      <ul>
        <li>Prices are quoted in USD; Brazilian Real pricing is available on request.</li>
        <li>
          Because each piece is custom-made, cancellations after work has begun
          may be subject to a charge covering work completed.
        </li>
        <li>
          Our liability is limited to the value of the commissioned artwork.
        </li>
      </ul>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of Brazil. Questions? Email{" "}
        <a href="mailto:hello@homesbyfattori.com">hello@homesbyfattori.com</a>.
      </p>
    </LegalShell>
  );
}
