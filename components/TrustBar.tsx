const items = [
  {
    label: "100% Hand-Drawn",
    icon: (
      <path d="M3 21l3-1 11-11a2.1 2.1 0 0 0-3-3L3 17l-1 3 1 1zM14 6l3 3" />
    ),
  },
  {
    label: "Architect-Trained Artist",
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V10l7-5 7 5v11" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
  },
  {
    label: "Ships Worldwide",
    icon: (
      <>
        <path d="M2 12h20" />
        <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" />
        <circle cx="12" cy="12" r="10" />
      </>
    ),
  },
];

export default function TrustBar() {
  return (
    <section className="bg-navy">
      <div className="container-luxe grid grid-cols-1 gap-6 py-7 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-center gap-3 text-cream"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B89650"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 shrink-0"
              aria-hidden
            >
              {item.icon}
            </svg>
            <span className="font-inter text-[11px] uppercase tracking-[0.22em]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
