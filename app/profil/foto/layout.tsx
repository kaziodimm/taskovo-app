import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Foto profilu | Taskovo",
  description: "Soukromá stránka pro přesměrování správy profilové fotky v účtu Taskovo.",
  robots: { index: false, follow: false },
};

export default function ProfilePhotoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
