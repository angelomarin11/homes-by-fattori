import type { Metadata } from "next";
import LegalShell from "@/components/LegalShell";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description:
    "How Homes by Fattori packages, ships, and protects your hand-drawn portrait worldwide.",
};

export default function ShippingPage() {
  return (
    <LegalShell title="Shipping Policy" updated="July 2026">
      <p>
        We ship completed portraits worldwide, packaged to arrive in perfect
        condition.
      </p>

      <h2>Timelines</h2>
      <p>
        Most portraits are completed within 15–20 business days after sketch
        approval. Shipping time is additional and depends on your destination.
        Rush delivery is available for an added fee — ask us when you enquire.
      </p>

      <h2>Packaging</h2>
      <ul>
        <li>Unframed pieces ship rolled in a rigid protective tube.</li>
        <li>Framed pieces ship in a reinforced, cushioned box.</li>
        <li>Every shipment is tracked.</li>
      </ul>

      <h2>Duties &amp; customs</h2>
      <p>
        International orders may be subject to import duties or taxes set by the
        destination country. These are the recipient&rsquo;s responsibility and
        are not included in our prices.
      </p>

      <h2>Damage in transit</h2>
      <p>
        In the rare event a portrait arrives damaged, contact us within 7 days
        at{" "}
        <a href="mailto:hello@homesbyfattori.com">hello@homesbyfattori.com</a>{" "}
        with photographs and we&rsquo;ll make it right.
      </p>
    </LegalShell>
  );
}
