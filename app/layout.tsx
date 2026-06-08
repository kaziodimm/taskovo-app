import type { Metadata } from "next";
import "./globals.css";
import "./taskovo-extra.css";

export const metadata: Metadata = {
  title: "Taskovo | Lidé na úkoly v okolí",
  description:
    "Taskovo je česká platforma pro lokální úkoly: doručení, vyzvednutí, montáž nábytku, domácí pomoc a malé zakázky v okolí.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
