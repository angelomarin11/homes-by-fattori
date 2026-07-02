"use client";

import { useEffect, useState } from "react";
import Reveal from "./Reveal";
import AnimatedHouse from "./AnimatedHouse";

/**
 * Ambient studio film. Plays /videos/studio.mp4 (muted, looped) when the
 * file exists; until then it falls back to the self-drawing house
 * animation so the section stays alive. Drop your film at
 * public/videos/studio.mp4.
 */
export default function StudioFilm() {
  // Fallback by default; swap the video in only once we know the file exists
  // (a native onError can fire before hydration and be missed).
  const [videoAvailable, setVideoAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/videos/studio.mp4", { method: "HEAD" })
      .then((res) => {
        if (!cancelled && res.ok) setVideoAvailable(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="studio" className="bg-navy py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-5 font-inter text-xs uppercase tracking-[0.25em] text-gold">
            The Studio
          </p>
          <h2 className="font-playfair text-4xl text-cream md:text-5xl">
            Behind the Ink
          </h2>
          <p className="mt-4 font-cormorant text-xl italic text-cream/80">
            Every line is drawn by hand — watch the process unfold, from the
            first pencil guide to the final golden detail.
          </p>
        </Reveal>

        <Reveal className="mx-auto mt-14 max-w-4xl">
          <div className="relative border border-gold/30 p-2 md:p-3">
            {videoAvailable ? (
              <video
                className="aspect-video w-full object-cover"
                src="/videos/studio.mp4"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Time-lapse of a home portrait being drawn by hand"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-[#16273f]">
                <AnimatedHouse
                  className="h-full max-h-full w-auto p-6 md:p-10"
                  stroke="#FAF8F3"
                  gold="#B89650"
                />
              </div>
            )}
          </div>
          <p className="mt-5 text-center font-inter text-[11px] uppercase tracking-[0.2em] text-cream/50">
            Pen &amp; ink on 300gsm archival paper · 40+ hours per portrait
          </p>
        </Reveal>
      </div>
    </section>
  );
}
