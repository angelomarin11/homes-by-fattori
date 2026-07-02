"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
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

function WorkArt({ work, className }: { work: Work; className: string }) {
  return work.image ? (
    <Image
      src={work.image}
      alt={`${work.title}, ${work.location} — hand-drawn architectural portrait`}
      width={600}
      height={work.h}
      className={className}
    />
  ) : (
    <PortraitSketch
      title={work.title}
      variant={work.variant}
      height={work.h}
      className={className}
    />
  );
}

export default function Portfolio() {
  const [selected, setSelected] = useState<Work | null>(null);

  // Lock body scroll and close on Escape while the lightbox is open.
  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <section id="portfolio" className="bg-cream py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">Portfolio</p>
          <h2 className="section-title mb-4">Selected Works</h2>
          <p className="font-cormorant text-xl italic text-graytext">
            Each portrait is a unique original, never reproduced.
          </p>
          <p className="mt-3 font-inter text-xs uppercase tracking-[0.16em] text-navy/45">
            Artwork shown: reference digital illustrations
          </p>
        </Reveal>

        {/* Masonry via CSS columns: 1 / 2 / 3 columns */}
        <div className="mt-16 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
          {works.map((work, i) => (
            <Reveal key={work.title} delay={(i % 3) * 0.08}>
              <figure className="group relative block break-inside-avoid overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSelected(work)}
                  aria-label={`View ${work.title}, ${work.location}`}
                  className="block w-full cursor-zoom-in"
                >
                  {/* Ken Burns: slow zoom + drift on hover/focus */}
                  <WorkArt
                    work={work}
                    className="h-auto w-full object-cover transition-transform duration-[2500ms] ease-luxe group-hover:scale-[1.06] group-hover:-translate-y-1 group-focus-within:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:translate-y-0"
                  />
                  {/* Overlay revealed on hover or keyboard focus */}
                  <figcaption className="absolute inset-0 flex flex-col items-center justify-center bg-navy/0 px-4 text-center opacity-0 transition-all duration-500 ease-luxe group-hover:bg-navy/70 group-hover:opacity-100 group-focus-within:bg-navy/70 group-focus-within:opacity-100 motion-reduce:transition-none">
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
                    <span className="mt-5 font-cormorant text-lg italic text-cream/80">
                      Click to enlarge
                    </span>
                  </figcaption>
                </button>
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

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${selected.title}, ${selected.location}`}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/90 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-full w-full max-w-2xl overflow-y-auto bg-cream p-4 shadow-2xl md:p-6"
            >
              <WorkArt work={selected} className="h-auto w-full" />
              <div className="flex items-end justify-between gap-4 px-1 pt-4">
                <div>
                  <p className="font-playfair text-2xl text-navy">
                    {selected.title}
                  </p>
                  <p className="mt-1 font-inter text-[11px] uppercase tracking-[0.2em] text-graytext">
                    {selected.location} · {selected.format}
                  </p>
                </div>
                <a
                  href="#order"
                  onClick={() => setSelected(null)}
                  className="link-arrow shrink-0 text-lg"
                >
                  Commission yours <span aria-hidden>&rarr;</span>
                </a>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                autoFocus
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center bg-navy text-cream transition-colors hover:bg-gold hover:text-navy"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
