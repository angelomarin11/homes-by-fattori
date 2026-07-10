import Image from "next/image";

/**
 * "From Photograph to Portrait" — demonstrates the service by transforming a
 * house photograph into a pen-and-ink line drawing entirely in the browser
 * (SVG edge-detection → navy ink on cream), looping so the home appears to
 * become a drawing. The photo is stock and the sketch is a DIGITAL SIMULATION
 * of the treatment — clearly labelled as an illustrative example, never passed
 * off as one of Telma's actual hand-drawn originals.
 */
export default function HomeReveal() {
  return (
    <section id="transform" className="bg-cream py-24 md:py-32">
      <div className="container-luxe">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">The Transformation</p>
          <h2 className="section-title mb-4">From Photograph to Portrait</h2>
          <p className="font-cormorant text-xl italic text-graytext">
            Send us a photograph of your home — and watch it become a
            hand-drawn original.
          </p>
        </div>

        <figure className="relative mx-auto mt-14 max-w-md">
          {/* Hidden filter: grayscale → edge-detect → invert/contrast → duotone
              (navy ink on cream paper). */}
          <svg
            className="pointer-events-none absolute h-0 w-0"
            aria-hidden
            focusable="false"
          >
            <filter
              id="ink-sketch"
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feColorMatrix
                type="matrix"
                values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0"
                result="g"
              />
              <feGaussianBlur in="g" stdDeviation="0.7" result="gb" />
              <feConvolveMatrix
                in="gb"
                order="3"
                preserveAlpha="true"
                kernelMatrix="0 -1 0 -1 4 -1 0 -1 0"
                result="e"
              />
              <feComponentTransfer in="e" result="inv">
                <feFuncR type="table" tableValues="1 0" />
                <feFuncG type="table" tableValues="1 0" />
                <feFuncB type="table" tableValues="1 0" />
              </feComponentTransfer>
              <feComponentTransfer in="inv" result="con">
                <feFuncR type="gamma" amplitude="1" exponent="2.4" offset="0" />
                <feFuncG type="gamma" amplitude="1" exponent="2.4" offset="0" />
                <feFuncB type="gamma" amplitude="1" exponent="2.4" offset="0" />
              </feComponentTransfer>
              <feComponentTransfer in="con">
                <feFuncR type="table" tableValues="0.102 0.98" />
                <feFuncG type="table" tableValues="0.18 0.973" />
                <feFuncB type="table" tableValues="0.29 0.953" />
              </feComponentTransfer>
            </filter>
          </svg>

          <div className="relative aspect-[4/5] w-full overflow-hidden border border-gold/40 bg-cream shadow-[0_20px_50px_-24px_rgba(26,46,74,0.5)]">
            {/* Photograph (base layer) */}
            <Image
              src="/images/facade-a.jpg"
              alt="A photograph of a luxury home"
              fill
              sizes="(max-width: 768px) 90vw, 448px"
              className="object-cover object-top"
            />

            {/* Ink drawing (fades in over the photo) */}
            <div className="reveal-sketch absolute inset-0 bg-cream">
              <Image
                src="/images/facade-a.jpg"
                alt="The same home rendered as a pen-and-ink drawing"
                fill
                sizes="(max-width: 768px) 90vw, 448px"
                className="object-cover object-top"
                style={{ filter: "url(#ink-sketch)" }}
              />
            </div>

            {/* Stage labels */}
            <span className="absolute left-4 top-4 bg-navy/80 px-3 py-1 font-inter text-[10px] uppercase tracking-[0.2em] text-cream backdrop-blur-sm">
              Photograph
            </span>
            <span className="reveal-badge absolute left-4 top-4 bg-gold px-3 py-1 font-inter text-[10px] uppercase tracking-[0.2em] text-navy">
              Hand-Drawn
            </span>
          </div>

          <figcaption className="mt-4 text-center font-inter text-[10px] uppercase tracking-[0.22em] text-navy/45">
            Illustrative example · digital simulation — final portraits are
            drawn by hand
          </figcaption>
        </figure>

        <div className="mt-12 text-center">
          <a href="#order" className="btn-gold">
            Commission Your Portrait
          </a>
        </div>
      </div>
    </section>
  );
}
