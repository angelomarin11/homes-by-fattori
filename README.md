# Homes by Fattori

A premium, single-page marketing site for **Homes by Fattori** — bespoke,
hand-drawn architectural portraits of luxury homes by architect Telma Fattori.

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Framer Motion**,
**React Hook Form**, and **Resend** for the contact form. Deploy-ready for
Vercel.

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

All placeholders use [placehold.co](https://placehold.co) or inline SVG so the
site looks finished out of the box. To use real artwork:

1. Add your files to [`public/images/`](public/images) (e.g. `artist.jpg`,
   `portfolio-01.jpg` … `portfolio-08.jpg`, `og.jpg`).
2. **Artist photo** — in [`components/About.tsx`](components/About.tsx), change
   the `<Image src="https://placehold.co/...">` to `src="/images/artist.jpg"`.
3. **Portfolio** — in [`components/Portfolio.tsx`](components/Portfolio.tsx),
   add an `image` field to each entry in the `works` array (e.g.
   `image: "/images/portfolio-01.jpg"`) and use it as the `src`.
4. **Hero** — the hero uses an inline SVG
   ([`components/HouseIllustration.tsx`](components/HouseIllustration.tsx)). To
   use a real portrait instead, replace `<HouseIllustration />` in
   [`components/Hero.tsx`](components/Hero.tsx) with a `next/image`.
5. **Social share (OG)** — in [`app/layout.tsx`](app/layout.tsx), point the
   `openGraph.images` / `twitter.images` URLs at `/images/og.jpg`.

> `next/image` is already configured to allow `placehold.co` in
> [`next.config.mjs`](next.config.mjs). Local files under `public/` need no
> extra config.

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
│   ├── layout.tsx            # fonts, metadata, OG tags, GA
│   ├── page.tsx              # assembles all sections
│   ├── globals.css           # Tailwind + brand component classes
│   ├── sitemap.ts            # /sitemap.xml
│   ├── robots.ts             # /robots.txt
│   └── api/contact/route.ts  # Resend form handler
├── components/
│   ├── Navbar.tsx            HouseIllustration.tsx  Reveal.tsx
│   ├── Hero.tsx              TrustBar.tsx           About.tsx
│   ├── Portfolio.tsx         HowItWorks.tsx         Pricing.tsx
│   ├── Testimonials.tsx      ForRealtors.tsx        OrderForm.tsx
│   └── Footer.tsx
├── public/images/
├── tailwind.config.ts  next.config.mjs  postcss.config.mjs
├── .env.local.example
└── package.json
```

---

© 2026 Homes by Fattori · Made with ✦ in Brazil · Ships Worldwide
