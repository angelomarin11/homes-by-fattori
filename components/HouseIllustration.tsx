/**
 * Inline, hand-drawn-style house illustration used as an elegant placeholder
 * in the hero until a real portrait scan is supplied. Pure SVG — no asset
 * dependency, crisp at any size, and themed with the brand palette.
 */
export default function HouseIllustration({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 520 420"
      role="img"
      aria-label="Pen-and-ink illustration of a luxury home"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        stroke="#1A2E4A"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* ground line */}
        <line x1="40" y1="360" x2="480" y2="360" stroke="#B89650" strokeWidth="1" />

        {/* main facade */}
        <rect x="120" y="190" width="280" height="170" />

        {/* roof */}
        <path d="M104 190 L260 96 L416 190 Z" />
        <path d="M104 190 L260 96 L416 190" stroke="#B89650" />

        {/* chimney */}
        <path d="M340 150 L340 110 L364 110 L364 165" />

        {/* door */}
        <rect x="238" y="276" width="44" height="84" />
        <line x1="260" y1="276" x2="260" y2="360" />
        <circle cx="250" cy="320" r="2" fill="#B89650" stroke="none" />

        {/* lower windows */}
        <rect x="150" y="232" width="46" height="58" />
        <line x1="173" y1="232" x2="173" y2="290" />
        <line x1="150" y1="261" x2="196" y2="261" />

        <rect x="324" y="232" width="46" height="58" />
        <line x1="347" y1="232" x2="347" y2="290" />
        <line x1="324" y1="261" x2="370" y2="261" />

        {/* gable window */}
        <rect x="244" y="150" width="32" height="32" />
        <line x1="260" y1="150" x2="260" y2="182" />
        <line x1="244" y1="166" x2="276" y2="166" />

        {/* steps */}
        <line x1="226" y1="360" x2="294" y2="360" />
        <line x1="232" y1="372" x2="288" y2="372" />
        <rect x="226" y="360" width="68" height="12" />

        {/* hedges / trees */}
        <path d="M84 360 C84 330 116 330 116 360" />
        <path d="M404 360 C404 326 440 326 440 360" />
        <path d="M440 360 L440 300" stroke="#B89650" />
        <circle cx="440" cy="288" r="22" stroke="#B89650" />
      </g>
    </svg>
  );
}
