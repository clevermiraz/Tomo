import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pomofocus — Pomodoro Timer",
    short_name: "Pomofocus",
    description:
      "A simple, modern Pomodoro timer to help you focus, beat procrastination, and get more done.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f0a1e",
    theme_color: "#0f0a1e",
    categories: ["productivity", "utilities", "lifestyle"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
