import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Homes by Fattori",
    short_name: "Fattori",
    description:
      "Bespoke architectural portraits of luxury homes, drawn by hand by a trained architect.",
    start_url: "/",
    display: "browser",
    background_color: "#FAF8F3",
    theme_color: "#1A2E4A",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
