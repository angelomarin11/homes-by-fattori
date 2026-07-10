import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-navy"
    >
      {/* Full-bleed cinematic photograph (aspirational mood — a luxury home at
          twilight, not presented as one of the artist's drawings). */}
      <Image
        src="/images/hero-twilight.jpg"
        alt="A luxury waterfront estate glowing at twilight"
        fill
        priority
        sizes="100vw"
        className="ken-burns object-cover object-center"
      />

      {/* Readability + mood layers */}
      {/* left-to-right scrim so the headline reads while the estate stays visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/70 to-navy/25" />
      {/* top scrim for navbar contrast over the bright dusk sky */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-navy/85 to-transparent" />
      {/* warm bottom vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,transparent_45%,rgba(8,16,32,0.55)_100%)]" />
      {/* thin gold frame */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 border border-gold/25 md:inset-6"
      />

      <div className="container-luxe relative z-10 w-full pt-28 pb-24">
        <div className="fade-up max-w-2xl">
          <p className="mb-6 font-inter text-xs uppercase tracking-[0.3em] text-gold">
            Bespoke Architectural Portraits
          </p>

          <h1 className="font-playfair text-[44px] leading-[1.03] text-cream sm:text-6xl lg:text-[80px]">
            Your Home,
            <br />
            <span className="text-gold">Drawn by Hand.</span>
          </h1>

          <div className="my-7 h-px w-20 bg-gold" />

          <p className="max-w-md font-cormorant text-xl italic text-cream/85 md:text-2xl">
            Bespoke architectural portraits of luxury homes, crafted by a
            trained architect with pen and ink.
          </p>

          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <a href="#order" className="btn-gold">
              Commission Your Portrait
            </a>
            <a
              href="#portfolio"
              className="group inline-flex items-center gap-2 font-cormorant text-xl italic text-cream/90 transition-colors duration-300 hover:text-gold"
            >
              View Portfolio
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#about"
        aria-label="Scroll to explore"
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="font-inter text-[10px] uppercase tracking-[0.3em] text-cream/60">
          Scroll
        </span>
        <span className="scroll-cue text-gold" aria-hidden>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </a>
    </section>
  );
}
