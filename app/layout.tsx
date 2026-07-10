import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import MotionProvider from "@/components/MotionProvider";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const siteUrl = "https://homesbyfattori.com";
const siteTitle = "Homes by Fattori — Hand-Drawn Luxury Home Portraits";
const siteDescription =
  "Bespoke architectural portraits of luxury homes, drawn by hand by a trained architect. Ships worldwide. Commission yours today.";

export const viewport: Viewport = {
  themeColor: "#1A2E4A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s · Homes by Fattori",
  },
  description: siteDescription,
  keywords: [
    "architectural portrait",
    "hand-drawn house portrait",
    "luxury home illustration",
    "custom home drawing",
    "realtor closing gift",
    "pen and ink house portrait",
  ],
  authors: [{ name: "Telma Fattori" }],
  creator: "Telma Fattori",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName: "Homes by Fattori",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description:
      "Bespoke architectural portraits of luxury homes, drawn by hand by a trained architect. Ships worldwide.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Homes by Fattori",
      url: siteUrl,
      email: "hello@homesbyfattori.com",
      founder: {
        "@type": "Person",
        name: "Telma Fattori",
        jobTitle: "Architect & Illustrator",
      },
      sameAs: ["https://instagram.com/homesbyfattori"],
      areaServed: "Worldwide",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Homes by Fattori",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Product",
      "@id": `${siteUrl}/#product`,
      name: "Hand-Drawn Architectural Home Portrait",
      description:
        "Bespoke pen-and-ink portrait of your home, drawn by hand by a trained architect on archival paper. Signed, certified original.",
      brand: { "@id": `${siteUrl}/#organization` },
      offers: [
        {
          "@type": "Offer",
          name: "A4 Portrait",
          price: "350",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/#pricing`,
        },
        {
          "@type": "Offer",
          name: "A3 Portrait",
          price: "550",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/#pricing`,
        },
        {
          "@type": "Offer",
          name: "A2 Portrait",
          price: "850",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${siteUrl}/#pricing`,
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${cormorant.variable}`}
    >
      <body className="font-inter antialiased">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll />
        <MotionProvider>{children}</MotionProvider>
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
