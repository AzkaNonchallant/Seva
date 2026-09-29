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
        uses. It is a variable font served as a stylesheet — the only form that
        exposes the FILL/wght axes to CSS, so it cannot go through next/font.
        Placed directly under <html> rather than inside an explicit <head> so
        Next hoists and preloads it on every route.

        display=swap lets text paint in the fallback face immediately, so the
        swap causes no layout shift.

        The lint rule below targets the Pages Router, where a link in
        _app/_document only attaches to one page. This is the App Router, where
        the root layout wraps every route, so the warning does not apply.
      */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        precedence="high"
      />
      <body className="min-h-full bg-background font-sans text-body-md text-on-background">
        {children}
      </body>
    </html>
  );
}
