"use client";

import { useEffect, useState } from "react";

const links = [
  { label: "Home", href: "#home" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "How It Works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Realtors", href: "#realtors" },
  { label: "Contact", href: "#order" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Highlight the nav link for the section currently in view.
  useEffect(() => {
    const sections = links
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Lock body scroll while the mobile menu is open; close on Escape.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Over the dark hero the bar is transparent, so text must be light;
  // once it turns solid (cream) on scroll or when the menu opens, text is navy.
  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-luxe ${
        solid
          ? "bg-cream/95 shadow-[0_1px_0_0_rgba(184,150,80,0.18)] backdrop-blur-sm"
          : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main navigation"
        className="container-luxe flex h-[72px] items-center justify-between"
      >
        <a
          href="#home"
          className={`shrink-0 whitespace-nowrap font-playfair text-lg md:text-xl tracking-[0.16em] transition-colors duration-300 ${
            solid ? "text-navy" : "text-cream"
          }`}
        >
          HOMES BY FATTORI
        </a>

        {/* Desktop links — only shown at xl+, where there is genuinely room */}
        <ul className="hidden items-center gap-6 xl:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                aria-current={active === link.href ? "true" : undefined}
                className={`whitespace-nowrap font-inter text-[13px] uppercase tracking-[0.1em] transition-colors duration-300 hover:text-gold ${
                  active === link.href
                    ? "text-gold"
                    : solid
                      ? "text-navy/80"
                      : "text-cream/80"
                }`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#order"
          className="btn-gold hidden shrink-0 whitespace-nowrap !px-5 !py-2.5 !text-[12px] xl:inline-flex"
        >
          Commission
        </a>

        {/* Hamburger — everything below xl uses the full-screen menu */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] xl:hidden"
        >
          <span
            className={`h-px w-6 ${solid ? "bg-navy" : "bg-cream"} transition-all duration-300 ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 ${solid ? "bg-navy" : "bg-cream"} transition-all duration-300 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-px w-6 ${solid ? "bg-navy" : "bg-cream"} transition-all duration-300 ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={`fixed inset-0 z-40 flex flex-col bg-cream px-6 pt-28 transition-all duration-500 ease-luxe lg:hidden ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex flex-col gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? undefined : -1}
                className="font-playfair text-3xl text-navy transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#order"
          onClick={() => setOpen(false)}
          tabIndex={open ? undefined : -1}
          className="btn-gold mt-10 w-full"
        >
          Commission Your Portrait
        </a>
      </div>
    </header>
  );
}
