import Reveal from "./Reveal";

const faqs = [
  {
    q: "How long does a portrait take?",
    a: "Most portraits are completed within 15–20 business days from sketch approval. Rush delivery (about 50% faster) is available for +30%.",
  },
  {
    q: "What do you need from me to get started?",
    a: "Just 3–5 high-resolution photos of your property. Telma prepares a digital sketch for your approval before any ink touches the paper.",
  },
  {
    q: "Is every portrait really drawn by hand?",
    a: "Yes — every portrait is drawn entirely by hand in pen and ink on 300gsm archival paper. Each is a signed, certified, one-of-a-kind original. No prints, no digital reproduction.",
  },
  {
    q: "Do you ship internationally?",
    a: "We ship worldwide. Unframed portraits travel in a premium protective tube; framed portraits ship in a reinforced box. Tracking is provided for every order.",
  },
  {
    q: "Can you include people, pets, or cars in the drawing?",
    a: "Absolutely. Additional figures such as family members, pets, or a beloved car can be added for +$75–150 each, depending on detail.",
  },
  {
    q: "What if I'm not happy with the sketch?",
    a: "The digital sketch stage exists precisely for this — we revise it until you love it. The final artwork only begins once you've approved the sketch.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function Faq() {
  return (
    <section id="faq" className="bg-cream py-24 md:py-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">FAQ</p>
          <h2 className="section-title mb-4">Common Questions</h2>
          <p className="font-cormorant text-xl italic text-graytext">
            Everything you need to know before commissioning your portrait.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 max-w-3xl">
          {faqs.map((faq, i) => (
            <Reveal key={faq.q} delay={i * 0.05}>
              <details className="group border-b border-navy/10 py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-playfair text-lg text-navy transition-colors hover:text-gold [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span
                    aria-hidden
                    className="shrink-0 font-cormorant text-3xl leading-none text-gold transition-transform duration-300 ease-luxe group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-6 pr-10 font-inter text-[15px] leading-relaxed text-graytext">
                  {faq.a}
                </p>
              </details>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <p className="font-inter text-sm text-graytext">
            Still have questions?{" "}
            <a
              href="mailto:hello@homesbyfattori.com"
              className="text-navy underline decoration-gold/60 underline-offset-4 transition-colors hover:text-gold"
            >
              Email us
            </a>{" "}
            — we reply within 24 hours.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
