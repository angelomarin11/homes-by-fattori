import Image from "next/image";

/**
 * Full-bleed aspirational band. The photograph is a luxury home used purely
 * as mood/context (the kind of home a portrait preserves) — it is NOT presented
 * as one of the artist's drawings, so it makes no false claim.
 */
export default function HomesBand() {
  return (
    <section
      aria-label="The homes we draw"
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden"
    >
      <Image
        src="/images/home.jpg"
        alt="A luxury home surrounded by manicured gardens"
        fill
        sizes="100vw"
        className="ken-burns object-cover"
      />
      {/* darkening + vignette so the type reads while the home stays visible */}
      <div className="absolute inset-0 bg-navy/45" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,16,32,0.15)_30%,rgba(8,16,32,0.7)_100%)]" />

      <div className="container-luxe relative z-10 text-center">
        <p className="mx-auto max-w-3xl font-cormorant text-3xl italic leading-snug text-cream drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] md:text-5xl">
          &ldquo;Every home has a story worth preserving.&rdquo;
        </p>
        <div className="mx-auto mt-8 h-px w-16 bg-gold" />
        <a href="#order" className="btn-gold mt-8">
          Commission Your Portrait
        </a>
      </div>
    </section>
  );
}
