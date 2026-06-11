import type { Metadata } from "next";
import "@/components/DashboardUx.module.css";

export const metadata: Metadata = {
  title: "Dashboard taskera | Taskovo",
  description: "Soukromý dashboard taskera pro dostupné úkoly, aktivní práce, nabídky, výdělky a ověření profilu.",
  alternates: { canonical: "/poskytovatel/dashboard" },
  robots: { index: false, follow: false },
};

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
