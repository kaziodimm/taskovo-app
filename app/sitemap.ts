import type { MetadataRoute } from "next";

const baseUrl = "https://taskovo.cz";

const routes = [
  "",
  "/kategorie",
  "/kategorie/uklid",
  "/kategorie/stehovani",
  "/kategorie/montaz-nabytku",
  "/kategorie/doruceni",
  "/kategorie/zahrada",
  "/kategorie/opravy",
  "/poskytovatele",
  "/tasks",
  "/jak-to-funguje",
  "/faq",
  "/bezpecnost",
  "/pro-zakazniky",
  "/pro-taskery",
  "/platby",
  "/vyplaty",
  "/kontakt",
  "/uklid-praha",
  "/stehovani-praha",
  "/montaz-nabytku-praha",
  "/doruceni-zasilek-praha",
  "/pomoc-na-zahrade-praha",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route.includes("praha") ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("praha") ? 0.86 : route.startsWith("/kategorie") ? 0.8 : 0.72,
  }));
}
