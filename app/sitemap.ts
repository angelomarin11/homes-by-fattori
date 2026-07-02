import type { MetadataRoute } from "next";

// Single-page site: fragment URLs (#portfolio etc.) are ignored by crawlers,
// so the sitemap lists only the canonical root.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://homesbyfattori.com",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
