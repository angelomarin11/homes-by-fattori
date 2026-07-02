import type { ReactElement } from "react";

const NAVY = "#1A2E4A";
const GOLD = "#B89650";

// Muted watercolor palette for the digital reference illustrations.
const SKY = "#A9C4D4";
const FOLIAGE = "#9FBA97";
const WALL = "#EAD9B4";
const ROOF = "#C08A6B";

/**
 * Watercolor-style digital reference illustrations used as elegant local
 * placeholders for portfolio artwork until real scans are supplied.
 * Pure SVG — soft colour washes under pen-and-ink line work, no network
 * requests, crisp at any size. Each card is labelled as a reference piece.
 *
 * Each variant is drawn in a 440 × 300 box and centered inside the frame.
 */
type Variant = {
  ink: ReactElement;
  washes: ReactElement;
};

const variants: Variant[] = [
  // 0 — classic gable estate
  {
    washes: (
      <g key="w-gable">
        <path d="M64 120 L220 40 L376 120 Z" fill={ROOF} opacity="0.4" />
        <rect x="80" y="120" width="280" height="150" fill={WALL} opacity="0.45" />
        <ellipse cx="54" cy="262" rx="34" ry="22" fill={FOLIAGE} opacity="0.5" />
        <ellipse cx="388" cy="258" rx="38" ry="26" fill={FOLIAGE} opacity="0.5" />
        <ellipse cx="220" cy="282" rx="210" ry="14" fill={FOLIAGE} opacity="0.3" />
      </g>
    ),
    ink: (
      <g key="gable">
        <rect x="80" y="120" width="280" height="150" />
        <path d="M64 120 L220 40 L376 120 Z" />
        <path d="M300 88 L300 56 L324 56 L324 100" />
        <rect x="196" y="196" width="48" height="74" />
        <line x1="220" y1="196" x2="220" y2="270" />
        <rect x="108" y="156" width="46" height="52" />
        <line x1="131" y1="156" x2="131" y2="208" />
        <line x1="108" y1="182" x2="154" y2="182" />
        <rect x="286" y="156" width="46" height="52" />
        <line x1="309" y1="156" x2="309" y2="208" />
        <line x1="286" y1="182" x2="332" y2="182" />
        <line x1="20" y1="270" x2="420" y2="270" stroke={GOLD} />
        <path d="M40 270 C40 244 68 244 68 270" />
        <path d="M372 270 C372 240 404 240 404 270" />
      </g>
    ),
  },
  // 1 — modern flat-roof villa
  {
    washes: (
      <g key="w-modern">
        <rect x="60" y="90" width="200" height="180" fill={WALL} opacity="0.42" />
        <rect x="260" y="150" width="130" height="120" fill={NAVY} opacity="0.18" />
        <rect x="84" y="120" width="70" height="90" fill={SKY} opacity="0.4" />
        <ellipse cx="408" cy="230" rx="26" ry="30" fill={FOLIAGE} opacity="0.5" />
        <ellipse cx="220" cy="282" rx="210" ry="13" fill={FOLIAGE} opacity="0.28" />
      </g>
    ),
    ink: (
      <g key="modern">
        <rect x="60" y="90" width="200" height="180" />
        <rect x="260" y="150" width="130" height="120" />
        <line x1="48" y1="90" x2="272" y2="90" stroke={GOLD} />
        <line x1="252" y1="150" x2="398" y2="150" stroke={GOLD} />
        <rect x="84" y="120" width="70" height="90" />
        <line x1="119" y1="120" x2="119" y2="210" />
        <rect x="180" y="120" width="56" height="90" />
        <rect x="284" y="178" width="80" height="92" />
        <line x1="324" y1="178" x2="324" y2="270" />
        <rect x="96" y="230" width="44" height="40" />
        <line x1="20" y1="270" x2="420" y2="270" stroke={GOLD} />
        <path d="M410 270 L410 226" stroke={GOLD} />
        <circle cx="410" cy="216" r="14" stroke={GOLD} />
      </g>
    ),
  },
  // 2 — colonial with columned portico
  {
    washes: (
      <g key="w-colonial">
        <path d="M56 110 L220 46 L384 110 Z" fill={NAVY} opacity="0.22" />
        <rect x="70" y="110" width="300" height="160" fill={WALL} opacity="0.48" />
        <rect x="184" y="150" width="72" height="120" fill="#FFFFFF" opacity="0.4" />
        <ellipse cx="220" cy="282" rx="215" ry="14" fill={FOLIAGE} opacity="0.32" />
      </g>
    ),
    ink: (
      <g key="colonial">
        <rect x="70" y="110" width="300" height="160" />
        <path d="M56 110 L220 46 L384 110 Z" />
        <rect x="184" y="150" width="72" height="120" />
        <path d="M176 150 L220 122 L264 150 Z" />
        <line x1="196" y1="160" x2="196" y2="270" />
        <line x1="244" y1="160" x2="244" y2="270" />
        <rect x="208" y="190" width="24" height="80" />
        <rect x="96" y="146" width="40" height="48" />
        <line x1="116" y1="146" x2="116" y2="194" />
        <rect x="96" y="212" width="40" height="48" />
        <rect x="304" y="146" width="40" height="48" />
        <line x1="324" y1="146" x2="324" y2="194" />
        <rect x="304" y="212" width="40" height="48" />
        <line x1="20" y1="270" x2="420" y2="270" stroke={GOLD} />
      </g>
    ),
  },
  // 3 — cottage with twin gables and chimney
  {
    washes: (
      <g key="w-cottage">
        <path d="M76 140 L156 76 L236 140 Z" fill={ROOF} opacity="0.42" />
        <path d="M204 140 L284 76 L364 140 Z" fill={ROOF} opacity="0.42" />
        <rect x="90" y="140" width="260" height="130" fill={WALL} opacity="0.45" />
        <ellipse cx="60" cy="260" rx="32" ry="24" fill={FOLIAGE} opacity="0.5" />
        <ellipse cx="378" cy="262" rx="30" ry="20" fill={FOLIAGE} opacity="0.5" />
        <ellipse cx="220" cy="282" rx="205" ry="13" fill={FOLIAGE} opacity="0.3" />
      </g>
    ),
    ink: (
      <g key="cottage">
        <rect x="90" y="140" width="260" height="130" />
        <path d="M76 140 L156 76 L236 140" />
        <path d="M204 140 L284 76 L364 140" />
        <path d="M130 108 L130 72 L152 72 L152 92" />
        <rect x="136" y="170" width="42" height="52" />
        <line x1="157" y1="170" x2="157" y2="222" />
        <rect x="262" y="170" width="42" height="52" />
        <line x1="283" y1="170" x2="283" y2="222" />
        <rect x="198" y="196" width="44" height="74" />
        <circle cx="210" cy="234" r="2" fill={GOLD} stroke="none" />
        <line x1="20" y1="270" x2="420" y2="270" stroke={GOLD} />
        <path d="M44 270 C44 240 78 240 78 270" />
        <path d="M362 270 C362 246 392 246 392 270" />
      </g>
    ),
  },
];

export default function PortraitSketch({
  title,
  variant,
  height = 600,
  className = "",
}: {
  title: string;
  variant: number;
  height?: number;
  className?: string;
}) {
  const art = variants[variant % variants.length];
  const filterId = `wash-${variant % variants.length}`;
  const x = (600 - 440) / 2;
  const y = (height - 300) / 2 - 24;

  return (
    <svg
      viewBox={`0 0 600 ${height}`}
      role="img"
      aria-hidden
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft edges so colour fields read as watercolour washes */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>
      <rect width="600" height={height} fill="#F6F1E4" />
      <rect
        x="20"
        y="20"
        width="560"
        height={height - 40}
        fill="none"
        stroke={GOLD}
        strokeOpacity="0.45"
        strokeWidth="1"
      />
      {/* colour washes under the line work */}
      <g transform={`translate(${x}, ${y})`} filter={`url(#${filterId})`}>
        {art.washes}
      </g>
      {/* pen-and-ink line work */}
      <g
        transform={`translate(${x}, ${y})`}
        fill="none"
        stroke={NAVY}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {art.ink}
      </g>
      <text
        x="300"
        y={height - 76}
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        fontSize="24"
        fill={NAVY}
      >
        {title}
      </text>
      <text
        x="300"
        y={height - 46}
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        letterSpacing="2"
        fill={GOLD}
      >
        REFERENCE DIGITAL ILLUSTRATION
      </text>
    </svg>
  );
}
