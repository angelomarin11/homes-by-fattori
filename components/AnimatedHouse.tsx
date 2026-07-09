"use client";

import { motion } from "framer-motion";

/**
 * The hero house illustration, redrawn as pure paths so each stroke can
 * animate as if a pen were drawing it live ("self-drawing" effect).
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
  trigger = "inView",
  strokeScale = 1,
}: {
  className?: string;
  stroke?: string;
  gold?: string;
  /** "mount" plays immediately (use above the fold); "inView" waits for scroll. */
  trigger?: "mount" | "inView";
  /** Multiplier for stroke weight — bump it when drawn large on a dark hero. */
  strokeScale?: number;
}) {
  // whileInView can fail to fire when the element is already on-screen at load
  // (as in the hero), leaving every path stuck at pathLength 0 — invisible.
  // trigger="mount" animates on mount instead, which always plays.
  const playProps =
    trigger === "mount"
      ? { initial: "hidden" as const, animate: "visible" as const }
      : {
          initial: "hidden" as const,
          whileInView: "visible" as const,
          viewport: { once: true, amount: 0.3 },
        };

  return (
    <motion.svg
      viewBox="0 0 520 420"
      role="img"
      aria-label="Pen-and-ink illustration of a luxury home, drawing itself"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...playProps}
    >
      {strokes.map((s, i) => (
        <motion.path
          key={s.d}
          d={s.d}
          fill="none"
          stroke={s.gold ? gold : stroke}
          strokeWidth={(s.gold ? 1.4 : 2) * strokeScale}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 1,
              transition: {
                pathLength: {
                  duration: 0.9,
                  delay: 0.25 + i * 0.13,
                  ease: "easeInOut",
                },
                opacity: { duration: 0.01, delay: 0.25 + i * 0.13 },
              },
            },
          }}
        />
      ))}
      {/* door knob appears after the door is drawn */}
      <motion.circle
        cx="250"
        cy="320"
        r="2"
        fill={gold}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { delay: 1.4 } },
        }}
      />
    </motion.svg>
  );
}
