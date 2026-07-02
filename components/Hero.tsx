"use client";

import { motion } from "framer-motion";
import AnimatedHouse from "./AnimatedHouse";
import Parallax from "./Parallax";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-cream pt-28 pb-16"
    >
      <div className="container-luxe grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* Left — text */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="order-2 lg:order-1"
        >
          <p className="eyebrow mb-6">Bespoke Architectural Portraits</p>

          <h1 className="font-playfair text-[42px] leading-[1.05] text-navy md:text-6xl lg:text-[72px]">
            Your Home,
            <br />
            Drawn by Hand.
          </h1>

          <div className="my-7 gold-rule" />

          <p className="max-w-md font-cormorant text-xl italic text-graytext md:text-2xl">
            Bespoke architectural portraits of luxury homes, crafted by a
            trained architect with pen and ink.
          </p>

          <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <a href="#order" className="btn-gold">
              Commission Your Portrait
            </a>
            <a href="#portfolio" className="link-arrow">
              View Portfolio <span aria-hidden>&rarr;</span>
            </a>
          </div>
        </motion.div>

        {/* Right — illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="order-1 flex justify-center lg:order-2"
        >
          <Parallax offset={24} className="relative w-full max-w-lg">
            <div className="absolute -inset-4 -z-10 rounded-sm border border-gold/30" />
            <AnimatedHouse className="h-auto w-full" />
          </Parallax>
        </motion.div>
      </div>
    </section>
  );
}
