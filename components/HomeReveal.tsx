import Image from "next/image";

/**
 * "From Photograph to Portrait" — a photograph of a home transforms, in three
 * stages, into a pencil sketch and then a painted drawing, on a loop. All three
 * stages are baked static images (zero runtime cost). The photo is stock and
 * the artwork is a DIGITAL SIMULATION of the treatment — labelled as an
 * illustrative example, never passed off as one of Telma's real originals.
 */
export default function HomeReveal() {
  const imgCls = "object-cover object-top";
  const sizes = "(max-width: 768px) 90vw, 448px";

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
          <div className="relative aspect-[4/5] w-full overflow-hidden border border-gold/40 bg-cream shadow-[0_20px_50px_-24px_rgba(26,46,74,0.5)]">
            {/* Stage 1 — photograph (base) */}
            <Image
              src="/images/facade-a.jpg"
              alt="A photograph of a luxury home"
              fill
              sizes={sizes}
              className={imgCls}
            />
            {/* Stage 2 — pencil sketch */}
            <Image
              src="/images/facade-a-sketch.png"
              alt="The same home drawn as a pencil sketch"
              fill
              sizes={sizes}
              className={`reveal-b ${imgCls}`}
            />
            {/* Stage 3 — painted drawing */}
            <Image
              src="/images/facade-a-painted.png"
              alt="The same home as a painted drawing"
              fill
              sizes={sizes}
              className={`reveal-c ${imgCls}`}
            />

            {/* Stage labels (stacked; the visible layer's badge shows) */}
            <span className="absolute left-4 top-4 bg-navy/80 px-3 py-1 font-inter text-[10px] uppercase tracking-[0.2em] text-cream backdrop-blur-sm">
              Photograph
            </span>
            <span className="reveal-b absolute left-4 top-4 bg-navy px-3 py-1 font-inter text-[10px] uppercase tracking-[0.2em] text-cream">
              Pencil Sketch
            </span>
            <span className="reveal-c absolute left-4 top-4 bg-gold px-3 py-1 font-inter text-[10px] uppercase tracking-[0.2em] text-navy">
              Hand-Painted
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
