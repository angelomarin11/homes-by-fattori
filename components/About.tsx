import Image from "next/image";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section id="about" className="bg-cream py-24 md:py-32">
      <div className="container-luxe grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Left — portrait of the artist */}
        <Reveal className="order-2 lg:order-1">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full border border-gold/40" />
            <Image
              src="https://placehold.co/600x720/1A2E4A/FAF8F3?text=Telma+Fattori"
              alt="Telma Fattori, architect and illustrator"
              width={600}
              height={720}
              className="h-auto w-full object-cover grayscale"
            />
          </div>
        </Reveal>

        {/* Right — text */}
        <Reveal delay={0.1} className="order-1 lg:order-2">
          <p className="eyebrow mb-5">The Artist</p>
          <h2 className="section-title mb-8">Meet Telma Fattori</h2>

          <div className="space-y-5 font-inter text-[15px] leading-relaxed text-graytext">
            <p className="font-cormorant text-2xl italic text-navy">
              Every home has a story worth preserving.
            </p>
            <p>
              Telma Fattori is an architect-turned-illustrator whose trained eye
              captures not just the structure of a home, but its character — the
              proportions, the details, the soul that makes it irreplaceable.
            </p>
            <p>
              Working exclusively in pen and ink on premium archival paper, each
              portrait is a one-of-a-kind original, signed and certified. No
              prints. No shortcuts.
            </p>
            <p className="text-navy">Based in Brazil. Drawing homes worldwide.</p>
          </div>

          <blockquote className="mt-10 border-l-2 border-gold pl-6">
            <p className="font-cormorant text-2xl italic leading-snug text-navy">
              &ldquo;I don&rsquo;t just draw houses. I draw the places people
              call home.&rdquo;
            </p>
            <cite className="mt-3 block font-inter text-xs uppercase tracking-[0.18em] not-italic text-gold">
              — Telma Fattori
            </cite>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
