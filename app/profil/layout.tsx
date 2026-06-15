import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil | Taskovo",
  description: "Soukromé profilové nastavení Taskovo včetně profilové fotografie a kontroly administrátorem.",
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
