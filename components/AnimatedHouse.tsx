"use client";

import { useEffect, useRef } from "react";

/**
 * The hero house illustration. Renders fully visible by default (so it ALWAYS
 * shows, even without JS), then on mount measures each path's real length and
 * animates stroke-dashoffset to draw it "on". We measure with getTotalLength()
 * because normalized `pathLength` dash scaling is unreliable across browsers —
 * an earlier attempt left every stroke as invisible 1px dashes.
 */

type Stroke = {
  d: string;
  gold?: boolean;
};

const strokes: Stroke[] = [
  // ground line
  { d: "M40 360 H480", gold: true },
  // main facade
  { d: "M120 190 H400 V360 H120 Z" },
  // roof
  { d: "M104 190 L260 96 L416 190 Z" },
  { d: "M104 190 L260 96 L416 190", gold: true },
  // chimney
  { d: "M340 150 V110 H364 V165" },
  // door
  { d: "M238 276 H282 V360 H238 Z" },
  { d: "M260 276 V360" },
  // lower windows
  { d: "M150 232 H196 V290 H150 Z" },
  { d: "M173 232 V290" },
  { d: "M150 261 H196" },
  { d: "M324 232 H370 V290 H324 Z" },
  { d: "M347 232 V290" },
  { d: "M324 261 H370" },
  // gable window
  { d: "M244 150 H276 V182 H244 Z" },
  { d: "M260 150 V182" },
  { d: "M244 166 H276" },
  // steps
  { d: "M226 360 H294 V372 H232" },
  // hedges / tree
  { d: "M84 360 C84 330 116 330 116 360" },
  { d: "M404 360 C404 326 440 326 440 360" },
  { d: "M440 360 V300", gold: true },
  { d: "M440 310 a22 22 0 1 1 0.01 0", gold: true },
];

export default function AnimatedHouse({
  className = "",
  stroke = "#1A2E4A",
  gold = "#B89650",
  strokeScale = 1,
}: {
  className?: string;
  stroke?: string;
  gold?: string;
  /** Multiplier for stroke weight — bump it when drawn large on a dark hero. */
  strokeScale?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      // Force layout so the starting offset is committed before we transition.
      void p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset 0.9s ease-in-out ${
        0.2 + i * 0.13
      }s`;
      p.style.strokeDashoffset = "0";
    });
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 520 420"
      role="img"
      aria-label="Pen-and-ink illustration of a luxury home, drawing itself"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {strokes.map((s) => (
        <path
          key={s.d}
          d={s.d}
          fill="none"
          stroke={s.gold ? gold : stroke}
          strokeWidth={(s.gold ? 1.4 : 2) * strokeScale}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {/* door knob */}
      <circle cx="250" cy="320" r="2.4" fill={gold} />
    </svg>
  );
}
