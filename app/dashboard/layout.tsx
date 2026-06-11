import type { Metadata } from "next";
import "@/components/DashboardUx.module.css";

export const metadata: Metadata = {
  title: "Klientský dashboard | Taskovo",
  description: "Soukromý klientský dashboard Taskovo pro správu úkolů, nabídek, zpráv a plateb.",
  alternates: { canonical: "/dashboard" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
