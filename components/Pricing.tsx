import Reveal from "./Reveal";

const tiers = [
  {
    name: "A4",
    size: "8 × 12 inches",
    from: "From USD 350",
    popular: false,
    options: ["Unframed — $350", "Framed — $550"],
    bestFor: "Condos, gifts",
  },
  {
    name: "A3",
    size: "12 × 17 inches",
    from: "From USD 550",
    popular: true,
    options: ["Unframed — $550", "Framed — $800"],
    bestFor: "Most homes, housewarming",
  },
  {
    name: "A2",
    size: "16 × 24 inches",
    from: "From USD 850",
    popular: false,
    options: ["Unframed — $850", "Framed — $1,200"],
    bestFor: "Grand estates, statement piece",
  },
];

const extras = [
  "Digital high-res file: +$50",
  "Rush delivery (50% faster): +30%",
  "Additional figures (people / pets): +$75–150 each",
  "Light watercolor wash: +$100",
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-cream py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">Pricing</p>
          <h2 className="section-title mb-4">Investment</h2>
          <p className="font-cormorant text-xl italic text-graytext">
            Each portrait is an original work of art, signed and certified.
          </p>
        </Reveal>

        <div className="mt-16 grid items-stretch gap-6 md:grid-cols-3">
          {tiers.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.1} className="flex">
              <div
                className={`relative flex w-full flex-col bg-white p-8 transition-all duration-300 ease-luxe hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(26,46,74,0.35)] ${
                  tier.popular
                    ? "border-2 border-gold"
                    : "border border-navy/15"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold px-4 py-1 font-inter text-[10px] uppercase tracking-[0.2em] text-navy">
                    ★ Most Popular
                  </span>
                )}

                <h3 className="font-playfair text-4xl text-navy">{tier.name}</h3>
                <p className="mt-1 font-inter text-sm text-graytext">
                  {tier.size}
                </p>

                <p className="mt-6 font-playfair text-2xl text-gold">
                  {tier.from}
                </p>

                <ul className="mt-6 space-y-2 border-t border-navy/10 pt-6 font-inter text-sm text-graytext">
                  {tier.options.map((opt) => (
                    <li key={opt} className="flex items-start gap-2">
                      <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {opt}
                    </li>
                  ))}
                </ul>

                <p className="mt-6 font-inter text-xs uppercase tracking-[0.14em] text-navy/50">
                  Best for
                </p>
                <p className="font-inter text-sm text-graytext">
                  {tier.bestFor}
                </p>

                <a
                  href="#order"
                  className={`mt-8 ${
                    tier.popular ? "btn-gold" : "btn-outline"
                  } w-full`}
                >
                  Order Now
                </a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-14 max-w-2xl">
          <div className="border border-navy/10 bg-white/60 p-8">
            <p className="mb-4 font-inter text-xs uppercase tracking-[0.18em] text-gold">
              Optional Extras
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {extras.map((extra) => (
                <li
                  key={extra}
                  className="flex items-start gap-2 font-inter text-sm text-graytext"
                >
                  <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {extra}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-6 text-center font-inter text-xs text-navy/60">
            Prices in USD. Brazilian Real pricing available — contact us.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
