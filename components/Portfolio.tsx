import Image from "next/image";
import Reveal from "./Reveal";
import PortraitSketch from "./PortraitSketch";

type Work = {
  title: string;
  location: string;
  format: string;
  h: number;
  variant: number;
  /** Path to a real scan under /public (e.g. "/images/portfolio-01.jpg"). */
  image?: string;
};

const works: Work[] = [
  { title: "Bel Air Estate", location: "Los Angeles, CA", format: "A2 Format", h: 760, variant: 2 },
  { title: "Beachfront Villa", location: "Miami, FL", format: "A3 Format", h: 600, variant: 1 },
  { title: "Colonial Manor", location: "Greenwich, CT", format: "A2 Format", h: 680, variant: 2 },
  { title: "Mountain Retreat", location: "Aspen, CO", format: "A3 Format", h: 600, variant: 3 },
  { title: "High-Rise Penthouse", location: "São Paulo, BR", format: "A3 Format", h: 740, variant: 1 },
  { title: "Vineyard Estate", location: "Tuscany, IT", format: "A2 Format", h: 600, variant: 0 },
  { title: "Modern Villa", location: "Hamptons, NY", format: "A3 Format", h: 640, variant: 1 },
  { title: "Country House", location: "The Cotswolds, UK", format: "A2 Format", h: 720, variant: 3 },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="bg-cream py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">Portfolio</p>
          <h2 className="section-title mb-4">Selected Works</h2>
          <p className="font-cormorant text-xl italic text-graytext">
            Each portrait is a unique original, never reproduced.
          </p>
        </Reveal>

        {/* Masonry via CSS columns: 1 / 2 / 3 columns */}
        <div className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {works.map((work, i) => (
            <Reveal key={work.title} delay={(i % 3) * 0.08}>
              <figure
                tabIndex={0}
                className="group relative block break-inside-avoid overflow-hidden"
              >
                {work.image ? (
                  <Image
                    src={work.image}
                    alt={`${work.title}, ${work.location} — hand-drawn architectural portrait`}
                    width={600}
                    height={work.h}
                    className="h-auto w-full object-cover transition-transform duration-700 ease-luxe group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                ) : (
                  <PortraitSketch
                    title={work.title}
                    variant={work.variant}
                    height={work.h}
                    className="h-auto w-full transition-transform duration-700 ease-luxe group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                )}
                {/* Overlay revealed on hover or keyboard focus */}
                <figcaption className="absolute inset-0 flex flex-col items-center justify-center bg-navy/0 px-4 text-center opacity-0 transition-all duration-500 ease-luxe group-hover:bg-navy/70 group-hover:opacity-100 group-focus-within:bg-navy/70 group-focus-within:opacity-100 group-focus:bg-navy/70 group-focus:opacity-100 motion-reduce:transition-none">
                  <span className="font-playfair text-2xl text-cream">
                    {work.title}
                  </span>
                  <span className="mt-2 h-px w-10 bg-gold" />
                  <span className="mt-3 font-inter text-[11px] uppercase tracking-[0.2em] text-cream/85">
                    {work.location}
                  </span>
                  <span className="mt-1 font-inter text-[11px] uppercase tracking-[0.2em] text-gold">
                    {work.format}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <a href="#order" className="link-arrow text-2xl">
            Interested in commissioning your home?{" "}
            <span aria-hidden>&rarr;</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
