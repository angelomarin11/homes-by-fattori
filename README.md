# Homes by Fattori

A premium, single-page marketing site for **Homes by Fattori** — bespoke,
hand-drawn architectural portraits of luxury homes by architect Telma Fattori.

Built with **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**,
**Framer Motion**, **React Hook Form**, and **Resend** for the contact form.
Deploy-ready for Vercel.

Highlights:

- **Zero external requests** — all placeholder artwork is local inline SVG.
- **SEO** — JSON-LD structured data (Organization, Product offers, FAQ),
  build-time generated Open Graph image, sitemap, robots, canonical URL.
- **Accessibility** — skip link, visible focus rings, `prefers-reduced-motion`
  honored everywhere, keyboard-accessible portfolio overlays, ARIA-annotated
  form errors, Escape closes the mobile menu.
- **Security** — hardened HTTP headers (HSTS, X-Frame-Options, nosniff…),
  contact API with honeypot, field length limits, and per-IP rate limiting.

---

## 1. Run locally

```bash
# install dependencies
npm install

# copy the env template and fill in your values (see section 3)
cp .env.local.example .env.local   # on Windows PowerShell: Copy-Item .env.local.example .env.local

# start the dev server
npm run dev
```

Open **http://localhost:3000**.

> The contact form works without any keys — if `RESEND_API_KEY` is unset, the
> API logs the submission and still returns success, so you can demo the full
> flow before configuring email.

Production build:

```bash
npm run build
npm run start
```

---

## 2. Deploy to Vercel

1. Push this folder to a GitHub/GitLab/Bitbucket repository.
2. Go to **https://vercel.com/new** and import the repository.
3. Framework preset is detected automatically (**Next.js**) — no config needed.
4. Under **Settings → Environment Variables**, add:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL` (e.g. `hello@homesbyfattori.com`)
   - `CONTACT_FROM_EMAIL` (e.g. `Homes by Fattori <hello@homesbyfattori.com>`)
   - `NEXT_PUBLIC_GA_ID` (optional, e.g. `G-XXXXXXXXXX`)
5. Click **Deploy**. Add your custom domain (`homesbyfattori.com`) under
   **Settings → Domains**.

Alternatively, from the CLI:

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

---

## 3. Configure Resend (contact form email)

The form sends two emails: a notification to the studio and a confirmation to
the client.

1. Create a free account at **https://resend.com** (free tier: 3,000 emails/mo).
2. Go to **API Keys → Create API Key**, copy it, and set it as
   `RESEND_API_KEY` in `.env.local` (and in Vercel for production).
3. **Sender address:**
   - For quick testing, leave `CONTACT_FROM_EMAIL` as
     `Homes by Fattori <onboarding@resend.dev>` (Resend's sandbox sender).
   - For production, go to **Domains → Add Domain**, add `homesbyfattori.com`,
     and create the DNS records Resend shows you. Once verified, set
     `CONTACT_FROM_EMAIL` to `Homes by Fattori <hello@homesbyfattori.com>`.
4. Set `CONTACT_TO_EMAIL` to the inbox that should receive enquiries.

The route handler lives at [`app/api/contact/route.ts`](app/api/contact/route.ts).

---

## 4. Replacing placeholders with real images

All placeholder artwork is local inline SVG (no external requests), so the
site looks finished out of the box. To use real artwork:

1. Add your files to [`public/images/`](public/images) (e.g. `artist.jpg`,
   `portfolio-01.jpg` … `portfolio-08.jpg`).
2. **Artist photo** — in [`components/About.tsx`](components/About.tsx),
   replace `<ArtistPlaceholder />` with a `next/image` pointing at
   `/images/artist.jpg`.
3. **Portfolio** — in [`components/Portfolio.tsx`](components/Portfolio.tsx),
   add an `image` field to each entry in the `works` array (e.g.
   `image: "/images/portfolio-01.jpg"`) — real scans automatically replace
   the SVG sketches.
4. **Hero** — the hero uses an inline SVG
   ([`components/HouseIllustration.tsx`](components/HouseIllustration.tsx)). To
   use a real portrait instead, replace `<HouseIllustration />` in
   [`components/Hero.tsx`](components/Hero.tsx) with a `next/image`.
5. **Social share (OG)** — the OG image is generated at build time from
   [`app/opengraph-image.tsx`](app/opengraph-image.tsx); edit it there, or
   delete that file and point `openGraph.images` in
   [`app/layout.tsx`](app/layout.tsx) at `/images/og.jpg`.

> Local files under `public/` need no extra config.

---

## 5. Analytics (optional)

Google Analytics 4 is wired via `@next/third-parties`. Set `NEXT_PUBLIC_GA_ID`
to your `G-XXXXXXXXXX` measurement ID and analytics loads automatically; leave
it blank to disable.

---

## Project structure

```
homes-by-fattori/
├── app/
│   ├── layout.tsx            # fonts, metadata, JSON-LD, GA, skip link
│   ├── page.tsx              # assembles all sections
│   ├── globals.css           # Tailwind + brand component classes
│   ├── opengraph-image.tsx   # build-time generated OG/social image
│   ├── icon.svg              # favicon
│   ├── manifest.ts           # /manifest.webmanifest
│   ├── not-found.tsx         # branded 404
│   ├── sitemap.ts            # /sitemap.xml
│   ├── robots.ts             # /robots.txt
│   └── api/contact/route.ts  # Resend form handler (honeypot + rate limit)
├── components/
│   ├── Navbar.tsx            HouseIllustration.tsx  Reveal.tsx
│   ├── Hero.tsx              TrustBar.tsx           About.tsx
│   ├── Portfolio.tsx         PortraitSketch.tsx     HowItWorks.tsx
│   ├── Pricing.tsx           Testimonials.tsx       ForRealtors.tsx
│   ├── Faq.tsx               OrderForm.tsx          Footer.tsx
│   └── MotionProvider.tsx
├── public/images/
├── tailwind.config.ts  next.config.mjs  postcss.config.mjs
├── .env.local.example
└── package.json
```

---

© 2026 Homes by Fattori · Made with ✦ in Brazil · Ships Worldwide
