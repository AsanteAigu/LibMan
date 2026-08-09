import type { Metadata, Viewport } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "LibMan - Library Management System",
  description: "Catalogue, borrow, and manage a university library from one place.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "LibMan",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#041632",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable} h-full`}>
      <head>
        {/* Material Symbols is an icon font, not covered by next/font/google; App Router
            supports rendering <link> directly (see React 19 stylesheet support). */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-background text-on-background font-body-md text-body-md antialiased">
        <ServiceWorkerRegistration />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
