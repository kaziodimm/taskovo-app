import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Taskovo",
  description: "Soukromé administrační centrum Taskovo pro správu objednávek, taskerů, klientů, nabídek a moderace.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
