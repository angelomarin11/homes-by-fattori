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
        className="object-cover"
      />
      {/* darkening + vignette so the type reads and it feels cinematic */}
      <div className="absolute inset-0 bg-navy/75" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(8,16,32,0.75)_100%)]" />

      <div className="container-luxe relative z-10 text-center">
        <p className="mx-auto max-w-3xl font-cormorant text-3xl italic leading-snug text-cream md:text-5xl">
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
