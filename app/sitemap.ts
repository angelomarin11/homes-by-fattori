import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://homesbyfattori.com";
  const sections = [
    "",
    "#portfolio",
    "#process",
    "#pricing",
    "#realtors",
    "#order",
  ];

  return sections.map((section) => ({
    url: `${base}/${section}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: section === "" ? 1 : 0.7,
  }));
}
