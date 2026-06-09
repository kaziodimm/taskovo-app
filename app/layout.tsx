import type { Metadata } from "next";
import "./globals.css";
import "./taskovo-extra.css";

export const metadata: Metadata = {
  title: "Taskovo | Lidé na úkoly v okolí",
  description:
    "Taskovo je česká platforma pro lokální úkoly: doručení, vyzvednutí, montáž nábytku, domácí pomoc a malé zakázky v okolí.",
  icons: {
    icon: "/taskovo-logo.svg",
    shortcut: "/taskovo-logo.svg",
    apple: "/taskovo-logo.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Taskovo | Pomoc. Rychle. Spolehlivě.",
    description: "Český marketplace pro lokální služby, úkoly, doručení a pomoc v okolí.",
    images: [{ url: "/taskovo-logo.svg", width: 512, height: 512, alt: "Taskovo logo" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
