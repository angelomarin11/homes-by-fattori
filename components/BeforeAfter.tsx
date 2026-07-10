"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

/**
 * Draggable before/after slider: left of the handle shows the photograph,
 * right shows the hand-painted rendering. The visitor drags to transform their
 * home into art themselves. Pointer events cover mouse + touch.
 */
export default function BeforeAfter({
  photo,
  art,
  alt,
  className = "",
}: {
  photo: string;
  art: string;
  alt: string;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(50);

  const move = useCallback((clientX: number) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(2, Math.min(98, p)));
  }, []);

  const onDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    move(e.clientX);
  };
  const onMove = (e: React.PointerEvent) => {
    if (dragging.current) move(e.clientX);
  };
  const onUp = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={wrap}
      role="slider"
      aria-label="Drag to reveal the hand-painted portrait"
      aria-valuenow={Math.round(pos)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setPos((p) => Math.max(2, p - 4));
        if (e.key === "ArrowRight") setPos((p) => Math.min(98, p + 4));
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      className={`relative cursor-ew-resize touch-none select-none overflow-hidden ${className}`}
    >
      {/* base — the hand-painted rendering (right side) */}
      <Image
        src={art}
        alt={`${alt}, hand-painted`}
        fill
        sizes="(max-width: 768px) 90vw, 620px"
        className="pointer-events-none object-cover object-top"
      />
      {/* top — the photograph, clipped to the left of the handle */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      >
        <Image
          src={photo}
          alt={`${alt}, photograph`}
          fill
          sizes="(max-width: 768px) 90vw, 620px"
          className="pointer-events-none object-cover object-top"
        />
      </div>

      {/* labels */}
      <span className="pointer-events-none absolute left-3 top-3 bg-navy/80 px-2.5 py-1 font-inter text-[10px] uppercase tracking-[0.18em] text-cream backdrop-blur-sm">
        Photo
      </span>
      <span className="pointer-events-none absolute right-3 top-3 bg-gold px-2.5 py-1 font-inter text-[10px] uppercase tracking-[0.18em] text-navy">
        Hand-Painted
      </span>

      {/* divider + handle */}
      <div
        className="pointer-events-none absolute inset-y-0"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute inset-y-0 -translate-x-1/2 w-[2px] bg-cream/90 shadow-[0_0_10px_rgba(0,0,0,0.4)]" />
        <div className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-navy shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
          </svg>
        </div>
      </div>

      {/* hint */}
      <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 bg-navy/70 px-3 py-1 font-inter text-[9px] uppercase tracking-[0.22em] text-cream/90 backdrop-blur-sm">
        ← Drag →
      </span>
    </div>
  );
}
