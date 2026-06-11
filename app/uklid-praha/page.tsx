import type { Metadata } from "next";
import { SeoLandingPage } from "@/components/SeoLandingPage";
import { seoLandingPages } from "@/lib/seo-landing-pages";

const page = seoLandingPages.uklidPraha;
const canonical = `https://taskovo.cz/${page.slug}`;

export const metadata: Metadata = {
  title: page.metaTitle,
  description: page.metaDescription,
  alternates: { canonical },
  openGraph: { title: page.metaTitle, description: page.metaDescription, url: canonical, siteName: "Taskovo", type: "website", images: [{ url: "/taskovo-logo.svg", width: 512, height: 512, alt: "Taskovo logo" }] },
  twitter: { card: "summary_large_image", title: page.metaTitle, description: page.metaDescription, images: ["/taskovo-logo.svg"] },
};

export default function Page() {
  return <SeoLandingPage page={page} />;
}
