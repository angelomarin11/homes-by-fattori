const navigation = [
  { label: "Portfolio", href: "#portfolio" },
  { label: "How It Works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "For Realtors", href: "#realtors" },
  { label: "Commission", href: "#order" },
];

const legal = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Shipping Policy", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-cream">
      <div className="container-luxe py-16">
        <div className="grid gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <p className="font-playfair text-xl tracking-[0.16em]">
              HOMES BY FATTORI
            </p>
            <p className="mt-4 max-w-xs font-inter text-sm leading-relaxed text-cream/65">
              Hand-drawn architectural portraits of luxury homes by a trained
              architect.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-4 font-inter text-xs uppercase tracking-[0.18em] text-gold">
              Navigation
            </p>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="font-inter text-sm text-cream/70 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 font-inter text-xs uppercase tracking-[0.18em] text-gold">
              Legal
            </p>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="font-inter text-sm text-cream/70 transition-colors hover:text-gold"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-cream/15 pt-8">
          <p className="font-inter text-xs text-cream/55">
            © 2026 Homes by Fattori · homesbyfattori.com ·
            hello@homesbyfattori.com
          </p>
          <p className="mt-2 font-inter text-xs tracking-[0.12em] text-cream/45">
            Made with <span className="text-gold">✦</span> in Brazil · Ships
            Worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
