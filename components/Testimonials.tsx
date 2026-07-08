import Reveal from "./Reveal";

/**
 * Honest replacement for a testimonials block. Until real, verifiable client
 * quotes exist, we don't fabricate reviews — instead this section states the
 * genuine promises behind every commission. When real testimonials arrive,
 * they can be added below (a spot is reserved with an honest note).
 */
const promises = [
  {
    title: "A Signed Original",
    body: "One of a kind, drawn by hand in pen and ink. Never printed, never reproduced.",
    icon: (
      <>
        <path d="M3 20l3-1 11-11a2.1 2.1 0 0 0-3-3L3 16z" />
        <path d="M14 6l3 3" />
      </>
    ),
  },
  {
    title: "Certificate of Authenticity",
    body: "Every portrait is signed and certified as an original work of art.",
    icon: (
      <>
        <circle cx="12" cy="9" r="5" />
        <path d="M9 13.5L8 21l4-2 4 2-1-7.5" />
      </>
    ),
  },
  {
    title: "Archival Quality",
    body: "Drawn on 300gsm archival paper, made to be treasured for generations.",
    icon: (
      <>
        <path d="M4 5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
        <path d="M8 9h6M8 13h8M8 17h5" />
      </>
    ),
  },
  {
    title: "You Approve First",
    body: "Review a digital sketch and approve it before the final drawing begins.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8 12l3 3 5-6" />
      </>
    ),
  },
  {
    title: "An Architect's Eye",
    body: "Proportions and detail captured by a trained architect — observed, not traced.",
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V10l7-5 7 5v11" />
        <path d="M9 21v-6h6v6" />
      </>
    ),
  },
  {
    title: "Shipped Worldwide",
    body: "Delivered safely in a premium protective tube or framed box, anywhere.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
      </>
    ),
  },
];

export default function Testimonials() {
  return (
    <section id="promise" className="bg-navy py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-5 font-inter text-xs uppercase tracking-[0.25em] text-gold">
            The Promise
          </p>
          <h2 className="font-playfair text-4xl text-cream md:text-5xl">
            What Every Commission Carries
          </h2>
          <p className="mt-5 font-cormorant text-xl italic text-cream/70">
            Not a print of your house — a hand-drawn original of it.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {promises.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.1}>
              <div className="flex flex-col items-start">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#B89650"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8"
                  aria-hidden
                >
                  {item.icon}
                </svg>
                <h3 className="mt-5 font-playfair text-xl text-cream">
                  {item.title}
                </h3>
                <p className="mt-3 font-inter text-sm leading-relaxed text-cream/70">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <p className="font-cormorant text-lg italic text-cream/55">
            Client reflections will appear here as commissions are completed.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
