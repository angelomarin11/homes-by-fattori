import Reveal from "./Reveal";
import Parallax from "./Parallax";

const benefits = [
  {
    title: "Memorable",
    body: "The most personal closing gift possible.",
  },
  {
    title: "Premium",
    body: "Positions you as a luxury-tier agent.",
  },
  {
    title: "Lasting",
    body: "Displayed for years, not forgotten in a drawer.",
  },
];

export default function ForRealtors() {
  return (
    <section id="realtors" className="bg-cream py-24 md:py-32">
      <div className="container-luxe grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Left — text */}
        <Reveal>
          <p className="eyebrow mb-5">For Realtors</p>
          <h2 className="section-title mb-8">The Perfect Closing Gift</h2>

          <div className="space-y-5 font-inter text-[15px] leading-relaxed text-graytext">
            <p className="font-cormorant text-2xl italic text-navy">
              Give your clients something they&rsquo;ll treasure for decades.
            </p>
            <p>
              A Homes by Fattori portrait transforms a transaction into a
              memory — and keeps your name on their walls, long after closing.
            </p>
            <p>
              Designed to be the closing gift your luxury clients actually keep
              — displayed on their walls for years, not forgotten in a drawer.
            </p>
          </div>

          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <li key={b.title}>
                <div className="mb-3 h-px w-8 bg-gold" />
                <p className="font-playfair text-lg text-navy">{b.title}</p>
                <p className="mt-1 font-inter text-sm text-graytext">
                  {b.body}
                </p>
              </li>
            ))}
          </ul>

          <a href="#order" className="link-arrow mt-10 text-xl">
            Request a Realtor Package <span aria-hidden>&rarr;</span>
          </a>
        </Reveal>

        {/* Right — package card / closing-gift mockup */}
        <Reveal delay={0.1}>
          <Parallax offset={24} className="relative mx-auto max-w-md">
            <div className="absolute -right-4 -top-4 -z-10 h-full w-full border border-gold/40" />
            <div className="bg-navy p-10 text-center text-cream">
              <p className="font-inter text-xs uppercase tracking-[0.22em] text-gold">
                Realtor Package
              </p>
              <p className="mt-6 font-playfair text-3xl">10 Portraits</p>
              <p className="mt-2 font-inter text-sm text-cream/70">
                A3 Format · Unframed
              </p>

              <div className="my-8 h-px w-16 mx-auto bg-gold/50" />

              <p className="font-playfair text-4xl text-gold">USD 4,675</p>
              <p className="mt-2 font-inter text-xs uppercase tracking-[0.16em] text-cream/70">
                15% off regular price
              </p>
              <p className="mt-6 font-cormorant text-lg italic text-cream/80">
                Delivered on demand throughout the year.
              </p>

              <a
                href="#order"
                className="btn-gold mt-8 w-full"
              >
                Request This Package
              </a>
            </div>
          </Parallax>
        </Reveal>
      </div>
    </section>
  );
}
