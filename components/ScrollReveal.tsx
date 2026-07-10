"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * Cinematic scroll-scrubbed reveal: as the visitor scrolls through this tall
 * section, a wipe sweeps across a luxury home, transforming the photograph into
 * a hand-painted rendering. The image is sticky-pinned while the wipe scrubs.
 * The home photo is aspirational mood; the painting is a digital simulation of
 * the treatment (labelled), never presented as one of Telma's actual works.
 */
export default function ScrollReveal() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setP(1);
      return;
    }
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const range = r.height - window.innerHeight;
        const prog = range > 0 ? -r.top / range : 0;
        setP(Math.max(0, Math.min(1, prog)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const wipe = p * 100;

  return (
    <section
      ref={ref}
      aria-label="Watch your home become art"
      className="relative h-[220vh] bg-navy"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* base — photograph */}
        <Image
          src="/images/home.jpg"
          alt="A luxury home"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* painted rendering, revealed left→right as you scroll */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)` }}
        >
          <Image
            src="/images/home-painted.png"
            alt="The same home, hand-painted"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* moving pen edge at the wipe boundary */}
        <div
          className="absolute inset-y-0 w-[2px] bg-gold/90 shadow-[0_0_16px_rgba(184,150,80,0.8)]"
          style={{ left: `${wipe}%`, opacity: p > 0.01 && p < 0.99 ? 1 : 0 }}
        />

        {/* readability + copy */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-navy/40" />
        <div className="relative z-10 px-6 text-center">
          <p className="mb-4 font-inter text-xs uppercase tracking-[0.3em] text-gold">
            The Transformation
          </p>
          <h2 className="mx-auto max-w-3xl font-playfair text-4xl leading-tight text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:text-6xl">
            Watch your home
            <br />
            become art.
          </h2>
          <p className="mx-auto mt-6 max-w-md font-cormorant text-xl italic text-cream/85">
            Every home has a story worth preserving.
          </p>
          <a href="#order" className="btn-gold pointer-events-auto mt-8">
            Commission Your Portrait
          </a>
          <p className="mt-6 font-inter text-[10px] uppercase tracking-[0.22em] text-cream/50">
            Illustrative · digital simulation — final portraits are drawn by hand
          </p>
        </div>
      </div>
    </section>
  );
}
