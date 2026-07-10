import BeforeAfter from "./BeforeAfter";

/**
 * "From Photograph to Portrait" — an interactive before/after slider the
 * visitor drags to transform a photograph of a home into a hand-painted
 * rendering. The photo is stock and the artwork is a DIGITAL SIMULATION of the
 * treatment (labelled), never presented as one of Telma's real originals.
 */
export default function HomeReveal() {
  return (
    <section id="transform" className="bg-cream py-24 md:py-32">
      <div className="container-luxe">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">The Transformation</p>
          <h2 className="section-title mb-4">From Photograph to Portrait</h2>
          <p className="font-cormorant text-xl italic text-graytext">
            Drag the handle — turn a photograph of a home into a hand-painted
            original.
          </p>
        </div>

        <figure className="relative mx-auto mt-14 max-w-lg">
          <BeforeAfter
            photo="/images/facade-a.jpg"
            art="/images/facade-a-painted.png"
            alt="A luxury home"
            className="aspect-[4/5] w-full border border-gold/40 bg-cream shadow-[0_24px_60px_-28px_rgba(26,46,74,0.55)]"
          />
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
