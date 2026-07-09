"use client";

import { motion } from "framer-motion";
import AnimatedHouse from "./AnimatedHouse";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-navy pt-28 pb-16"
    >
      {/* Cinematic background layers */}
      {/* soft gold glow behind the illustration */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-gold/20 blur-[120px]"
      />
      {/* darker vignette toward the edges for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]"
      />
      {/* fine paper/ink grain */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] mix-blend-screen"
      >
        <filter id="hero-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>
      {/* thin gold frame inset */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 border border-gold/25 md:inset-6"
      />

      <div className="container-luxe relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-1"
        >
          <p className="mb-6 font-inter text-xs uppercase tracking-[0.3em] text-gold">
            Bespoke Architectural Portraits
          </p>

          <h1 className="font-playfair text-[42px] leading-[1.05] text-cream md:text-6xl lg:text-[76px]">
            Your Home,
            <br />
            <span className="text-gold">Drawn by Hand.</span>
          </h1>

          <div className="my-7 h-px w-20 bg-gold" />

          <p className="max-w-md font-cormorant text-xl italic text-cream/75 md:text-2xl">
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
        </motion.div>

        {/* Right — the self-drawing illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="order-1 flex justify-center lg:order-2"
        >
          <div className="relative w-full max-w-lg">
            <AnimatedHouse
              className="h-auto w-full drop-shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
              stroke="#FAF8F3"
              gold="#D9B45B"
              trigger="mount"
              strokeScale={1.25}
            />
            <p className="mt-6 text-center font-inter text-[10px] uppercase tracking-[0.28em] text-cream/40">
              Illustrative · every commission is a unique original
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
