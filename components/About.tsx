import Reveal from "./Reveal";
import Parallax from "./Parallax";

/**
 * Elegant local placeholder until a real artist photograph is supplied —
 * drop `artist.jpg` into /public/images and swap this for a next/image.
 */
function ArtistPlaceholder() {
  return (
    <svg
      viewBox="0 0 600 720"
      role="img"
      aria-label="Telma Fattori, architect and illustrator"
      className="h-auto w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="600" height="720" fill="#1A2E4A" />
      <rect
        x="28"
        y="28"
        width="544"
        height="664"
        fill="none"
        stroke="#B89650"
        strokeOpacity="0.5"
      />
      <text
        x="300"
        y="330"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="120"
        fill="#B89650"
      >
        TF
      </text>
      <line x1="240" y1="380" x2="360" y2="380" stroke="#B89650" strokeOpacity="0.6" />
      <text
        x="300"
        y="430"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="30"
        fill="#FAF8F3"
      >
        Telma Fattori
      </text>
      <text
        x="300"
        y="470"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="15"
        letterSpacing="4"
        fill="#B89650"
      >
        ARCHITECT · ILLUSTRATOR
      </text>
    </svg>
  );
}

export default function About() {
  return (
    <section id="about" className="bg-cream py-24 md:py-32">
      <div className="container-luxe grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Left — portrait of the artist */}
        <Reveal className="order-2 lg:order-1">
          <Parallax offset={28} className="relative mx-auto max-w-md">
            <div className="absolute -bottom-4 -left-4 -z-10 h-full w-full border border-gold/40" />
            <ArtistPlaceholder />
          </Parallax>
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
