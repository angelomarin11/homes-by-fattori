# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-page marketing site for Homes by Fattori — hand-drawn architectural portraits of luxury homes. Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion, deployed on Vercel. There is no test suite or CI configured.

## Commands

```bash
npm install        # install dependencies
npm run dev        # dev server at http://localhost:3000
npm run build      # production build (also serves as the type-check)
npm run start      # serve the production build
npm run lint       # next lint (eslint-config-next)
```

Environment variables live in `.env.local` (template: `.env.local.example`): `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `NEXT_PUBLIC_GA_ID`. All are optional for local development — the contact API deliberately returns success without sending email when `RESEND_API_KEY` is unset, so the full form flow is demoable with no keys.

## Architecture

The entire site is one page. `app/page.tsx` assembles the section components in display order: Navbar → Hero → TrustBar → About → Portfolio → HowItWorks → Pricing → Testimonials → ForRealtors → OrderForm → Footer. Each section lives in `components/` and renders a `<section id="...">` that the Navbar links to via anchor hashes (`#portfolio`, `#pricing`, `#order`, etc.) — smooth scrolling and the fixed-navbar offset are handled globally in `app/globals.css` (`scroll-padding-top`).

The only backend is `app/api/contact/route.ts` (Node runtime). It validates the payload server-side (mirroring the form's required fields), then sends two emails via Resend: an internal notification to the studio and a best-effort confirmation to the client (a confirmation failure does not fail the request; an internal-notification failure returns 502). `components/OrderForm.tsx` is the client side, built with React Hook Form, posting JSON to `/api/contact`.

Components are server components by default; only those needing interactivity or Framer Motion carry `"use client"` (Navbar, OrderForm, Reveal, and any component using motion). `components/Reveal.tsx` is the shared scroll-into-view animation wrapper — wrap new section content in it rather than writing new motion variants.

SEO surface: metadata/OG tags in `app/layout.tsx`, plus `app/sitemap.ts` and `app/robots.ts`. Google Analytics loads in the layout only when `NEXT_PUBLIC_GA_ID` is set.

## Conventions

- **Design system lives in Tailwind config + globals.css, not in components.** Brand colors (`navy`, `gold`, `cream`, `creamdark`, `graytext`), fonts (`font-playfair` for headings, `font-inter` for UI/body, `font-cormorant` for italic accents), and the `ease-luxe` timing function are defined in `tailwind.config.ts`. Reusable classes (`container-luxe`, `eyebrow`, `section-title`, `btn-gold`, `btn-outline`, `link-arrow`, `gold-rule`) are in `app/globals.css` under `@layer components`. Use these instead of ad-hoc values so sections stay visually consistent.
- Content (pricing tiers, portfolio works, testimonials, nav links) is defined as plain data arrays at the top of each section component — edit those arrays to change copy.
- Imports use the `@/*` path alias (maps to the repo root).
- Images are placeholders from `placehold.co` (allowed in `next.config.mjs` remotePatterns) or inline SVG (`components/HouseIllustration.tsx`); real artwork goes in `public/images/` — the README documents the swap procedure.
