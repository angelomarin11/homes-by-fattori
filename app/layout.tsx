import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Homes by Fattori — Hand-Drawn Luxury Home Portraits",
  description:
    "Bespoke architectural portraits of luxury homes, drawn by hand by a trained architect. Ships worldwide. Commission yours today.",
  keywords: [
    "architectural portrait",
    "hand-drawn house portrait",
    "luxury home illustration",
    "custom home drawing",
    "realtor closing gift",
    "pen and ink house portrait",
  ],
  authors: [{ name: "Telma Fattori" }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Homes by Fattori — Hand-Drawn Luxury Home Portraits",
    description:
      "Bespoke architectural portraits of luxury homes, drawn by hand by a trained architect. Ships worldwide. Commission yours today.",
    siteName: "Homes by Fattori",
    images: [
      {
        url: "https://placehold.co/1200x630/1A2E4A/FAF8F3?text=Homes+by+Fattori",
        width: 1200,
        height: 630,
        alt: "Homes by Fattori — Hand-Drawn Luxury Home Portraits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homes by Fattori — Hand-Drawn Luxury Home Portraits",
    description:
      "Bespoke architectural portraits of luxury homes, drawn by hand by a trained architect. Ships worldwide.",
    images: ["https://placehold.co/1200x630/1A2E4A/FAF8F3?text=Homes+by+Fattori"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        {children}
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
      </body>
    </html>
  );
}
