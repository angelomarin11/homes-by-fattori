import Reveal from "./Reveal";

const steps = [
  {
    num: "01",
    title: "Send Your Photos",
    body: "Share 3–5 high-resolution photos of your property. We'll handle the rest.",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <circle cx="12" cy="13" r="3.5" />
        <path d="M8 6l1.5-2h5L16 6" />
      </>
    ),
  },
  {
    num: "02",
    title: "Approve the Sketch",
    body: "Telma creates a digital sketch for your approval before the final work begins.",
    icon: (
      <>
        <path d="M3 20l3-1 11-11a2.1 2.1 0 0 0-3-3L3 16l-1 4z" />
        <path d="M14 6l3 3" />
      </>
    ),
  },
  {
    num: "03",
    title: "Hand-Drawn Original",
    body: "The final artwork is drawn entirely by hand in pen and ink on 300gsm archival paper.",
    icon: (
      <>
        <path d="M4 19V5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
        <path d="M8 9h6M8 13h8M8 17h5" />
      </>
    ),
  },
  {
    num: "04",
    title: "Delivered to You",
    body: "Your portrait ships worldwide in a premium protective tube or framed box.",
    icon: (
      <>
        <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
        <path d="M3 7l9 4 9-4M12 11v10" />
      </>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="process" className="bg-creamdark py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-5">How It Works</p>
          <h2 className="section-title">From Your Photo to a Timeless Portrait</h2>
        </Reveal>

        <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal key={step.num} delay={i * 0.1}>
              <div className="relative flex flex-col items-start">
                <span className="font-playfair text-5xl text-gold/40">
                  {step.num}
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1A2E4A"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-4 h-8 w-8"
                  aria-hidden
                >
                  {step.icon}
                </svg>
                <h3 className="mt-5 font-playfair text-xl text-navy">
                  {step.title}
                </h3>
                <p className="mt-3 font-inter text-sm leading-relaxed text-graytext">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <p className="font-cormorant text-xl italic text-navy">
            Most portraits are completed within 15–20 business days.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
