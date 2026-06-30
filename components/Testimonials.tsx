import Reveal from "./Reveal";

const testimonials = [
  {
    quote:
      "We commissioned a portrait of our Hamptons home as an anniversary gift. The detail Telma captured — right down to the rose trellis by the gate — was extraordinary.",
    name: "Margaret & James T.",
    meta: "Southampton, NY",
    detail: "A2 Format · Framed",
  },
  {
    quote:
      "As a luxury real estate agent, I've tried many closing gifts. Nothing comes close to a Homes by Fattori portrait. My clients display them in their living rooms for years.",
    name: "David R.",
    meta: "Sotheby's International Realty, Beverly Hills",
    detail: "Corporate Package · 12 portraits/year",
  },
  {
    quote:
      "Nossa casa no condomínio ficou retratada com uma beleza que nenhuma fotografia consegue capturar. Arte de verdade.",
    name: "Ana Paula M.",
    meta: "Itu, São Paulo, BR",
    detail: "A3 Format · Sem Moldura",
  },
];

function Stars() {
  return (
    <div className="flex gap-1" aria-label="Five out of five stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="#B89650"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-navy py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="text-center">
          <p className="mb-5 font-inter text-xs uppercase tracking-[0.25em] text-gold">
            Testimonials
          </p>
          <h2 className="font-playfair text-4xl text-cream md:text-5xl">
            What Our Clients Say
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <figure className="flex h-full flex-col border border-cream/15 p-8">
                <Stars />
                <blockquote className="mt-6 flex-1 font-cormorant text-xl italic leading-relaxed text-cream/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-cream/15 pt-5">
                  <p className="font-playfair text-lg text-cream">{t.name}</p>
                  <p className="mt-1 font-inter text-xs text-cream/60">
                    {t.meta}
                  </p>
                  <p className="mt-1 font-inter text-xs uppercase tracking-[0.16em] text-gold">
                    {t.detail}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
