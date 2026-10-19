import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Horizon Odyssey — Dinas Travel | PT Andrea",
    template: "%s | Horizon Odyssey",
  },
  description:
    "Manajemen perjalanan dinas: antrean booking, pemesanan, dan monitoring keberangkatan.",
};

export const viewport: Viewport = {
  themeColor: "#0059bb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      {/*
        Material Symbols carries the icon set the DESIGN.md component inventory
        uses. It is a variable font, which next/font cannot express, so it is
        declared by hand in globals.css and served from /public.

        Preloaded because the icons sit in the first paint on every screen:
        without it the browser discovers the file only after parsing the CSS,
        and the ligature names show through as plain text. crossorigin is
        required for a preloaded font even though the response is same-origin;
        the fetch mode must match or the preload is discarded and refetched.
      */}
      <link
        rel="preload"
        href="/fonts/material-symbols-outlined.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <body className="min-h-full bg-background font-sans text-body-md text-on-background">
        {children}
      </body>
    </html>
  );
}
