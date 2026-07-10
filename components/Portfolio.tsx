"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Reveal from "./Reveal";

type Work = {
  title: string;
  style: string;
  format: string;
  painted: string;
  photo: string;
};

// Illustrative examples — each is a DIGITAL SIMULATION of the hand-drawn
// treatment applied to a stock photograph, NOT a real client commission and
// NOT one of Telma's actual originals (see the honest caption below).
const works: Work[] = [
  {
    title: "Gable Estate",
    style: "Classic Brick Two-Storey",
    format: "A2 Study",
    painted: "/images/facade-a-painted.png",
    photo: "/images/facade-a.jpg",
  },
  {
    title: "Modern Villa",
    style: "Flat-Roof Contemporary",
    format: "A3 Study",
    painted: "/images/facade-b-painted.png",
    photo: "/images/facade-b.jpg",
  },
  {
    title: "Colonial Manor",
    style: "Columned Portico",
    format: "A2 Study",
    painted: "/images/facade-c-painted.png",
    photo: "/images/facade-c.jpg",
  },
  {
    title: "Country Estate",
    style: "Gardens & Gables",
    format: "A3 Study",
    painted: "/images/home-painted.png",
    photo: "/images/home.jpg",
  },
];

export default function Portfolio() {
  const [selected, setSelected] = useState<Work | null>(null);

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
          <p className="eyebrow mb-5">The Style</p>
          <h2 className="section-title mb-4">Every Home, Reimagined</h2>
          <p className="font-cormorant text-xl italic text-graytext">
            Hover a piece to see the photograph it began as — your commission is
            a unique original, drawn from your own home.
          </p>
          <p className="mt-3 font-inter text-xs uppercase tracking-[0.16em] text-navy/45">
            Illustrative examples · digital simulations — final portraits are
            hand-drawn
          </p>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
          {works.map((work, i) => (
            <Reveal key={work.title} delay={(i % 2) * 0.1}>
              <figure className="group overflow-hidden border border-navy/10 bg-cream shadow-[0_12px_34px_-20px_rgba(26,46,74,0.55)] transition-shadow duration-500 hover:shadow-[0_22px_48px_-22px_rgba(26,46,74,0.6)]">
                <button
                  type="button"
                  onClick={() => setSelected(work)}
                  aria-label={`Enlarge ${work.title}`}
                  className="relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden"
                >
                  {/* Painted artwork (default) */}
                  <Image
                    src={work.painted}
                    alt={`${work.title} — ${work.style}, rendered as a painted drawing`}
                    fill
                    sizes="(max-width: 640px) 90vw, 420px"
                    className="object-cover"
                  />
                  {/* Real photograph, revealed on hover/focus */}
                  <Image
                    src={work.photo}
                    alt=""
                    aria-hidden
                    fill
                    sizes="(max-width: 640px) 90vw, 420px"
                    className="object-cover opacity-0 transition-opacity duration-700 ease-luxe group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
                  />
                  {/* Small hover hint */}
                  <span className="absolute bottom-3 right-3 bg-navy/75 px-3 py-1 font-inter text-[10px] uppercase tracking-[0.18em] text-cream opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100">
                    The photograph
                  </span>
                </button>
                <figcaption className="flex items-baseline justify-between gap-3 px-5 py-4">
                  <span className="font-playfair text-lg text-navy">
                    {work.title}
                  </span>
                  <span className="font-inter text-[10px] uppercase tracking-[0.16em] text-gold">
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

      {/* Lightbox (plain CSS, no framer) */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.title}, ${selected.style}`}
          onClick={() => setSelected(null)}
          className="fade-in fixed inset-0 z-[70] flex items-center justify-center bg-navy/90 p-6 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-cream p-4 shadow-2xl md:p-6"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={selected.painted}
                alt={`${selected.title} — painted drawing`}
                fill
                sizes="(max-width: 768px) 90vw, 640px"
                className="object-cover"
              />
            </div>
            <div className="flex items-end justify-between gap-4 px-1 pt-4">
              <div>
                <p className="font-playfair text-2xl text-navy">
                  {selected.title}
                </p>
                <p className="mt-1 font-inter text-[11px] uppercase tracking-[0.2em] text-graytext">
                  {selected.style} · {selected.format}
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
          </div>
        </div>
      )}
    </section>
  );
}
