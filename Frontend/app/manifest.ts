import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LibMan - Library Management System",
    short_name: "LibMan",
    description: "Catalogue, borrow, and manage a university library from one place.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcf9f8",
    theme_color: "#041632",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
