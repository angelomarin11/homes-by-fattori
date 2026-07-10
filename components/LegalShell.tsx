import Link from "next/link";
import type { ReactNode } from "react";
import Footer from "./Footer";

/**
 * Minimal chrome for standalone legal pages (privacy / terms / shipping).
 * Keeps the brand header but not the one-page anchor nav.
 */
export default function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <header className="border-b border-gold/20 bg-cream">
        <div className="container-luxe flex h-[72px] items-center">
          <Link
            href="/"
            className="font-playfair text-lg tracking-[0.18em] text-navy transition-colors hover:text-gold"
          >
            HOMES BY FATTORI
          </Link>
        </div>
      </header>

      <main className="bg-cream py-20 md:py-24">
        <article className="container-luxe max-w-3xl">
          <p className="eyebrow mb-4">Legal</p>
          <h1 className="section-title mb-3">{title}</h1>
          <p className="mb-12 font-inter text-xs uppercase tracking-[0.16em] text-navy/45">
            Last updated {updated}
          </p>
          <div className="legal-prose font-inter text-[15px] leading-relaxed text-graytext">
            {children}
          </div>
          <Link href="/" className="link-arrow mt-14 text-lg">
            <span aria-hidden>&larr;</span> Back to home
          </Link>
        </article>
      </main>

      <Footer />
    </>
  );
}
