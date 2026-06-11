import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/poskytovatel/dashboard", "/profil"],
      },
    ],
    sitemap: "https://taskovo.cz/sitemap.xml",
    host: "https://taskovo.cz",
  };
}
