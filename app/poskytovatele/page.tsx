import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import { getTaskers } from "@/lib/data";
import { cities, featuredProviders, marketplaceCategories, type FeaturedProvider } from "@/lib/marketplace-data";
import type { TaskerProfile } from "@/lib/types";
import styles from "../tasks/page.module.css";

export const metadata: Metadata = {
  title: "Taskeři v okolí | Taskovo",
  description: "Katalog nezávislých taskerů na Taskovo pro úklid, stěhování, montáž, doručení a lokální pomoc v Česku.",
  alternates: { canonical: "/poskytovatele" },
  openGraph: {
    title: "Taskeři v okolí | Taskovo",
    description: "Najděte ověřené i nové taskery podle města, kategorie, ceny a profilu.",
    url: "/poskytovatele",
    siteName: "Taskovo",
    type: "website",
    images: [{ url: "/taskovo-logo.svg", width: 512, height: 512, alt: "Taskovo logo" }],
  },
  robots: { index: true, follow: true },
};

type ProviderSearchParams = {
  city?: string;
  category?: string;
  verified?: string;
  minRating?: string;
  maxPrice?: string;
  sort?: string;
};

function priceNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function profileToProvider(profile: TaskerProfile): FeaturedProvider {
  return {
    id: profile.id,
    name: profile.name,
    city: profile.city,
    rating: profile.verified ? 4.7 : 4.3,
    reviews: 0,
    completedTasks: 0,
    priceFrom: "dohodou",
    categories: profile.categories.split(",").map((category) => category.trim()).filter(Boolean).slice(0, 4),
    verified: profile.verified,
    responseTime: "odpověď podle dostupnosti",
    bio: profile.bio || "Tasker připravený přijímat lokální úkoly přes Taskovo.",
    avatarUrl: profile.avatar_url || null,
  };
}

function includesText(value: string | undefined, query: string | undefined) {
  if (!query) return true;
  return (value || "").toLowerCase().includes(query.toLowerCase());
}

function filterProviders(providers: FeaturedProvider[], params: ProviderSearchParams) {
  const minRating = params.minRating ? Number(params.minRating) : null;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : null;

  const filtered = providers.filter((provider) => {
    if (params.city && provider.city !== params.city) return false;
    if (params.category && !provider.categories.some((category) => includesText(category, params.category))) return false;
    if (params.verified === "true" && !provider.verified) return false;
    if (minRating !== null && provider.rating < minRating) return false;
    if (maxPrice !== null && priceNumber(provider.priceFrom) > maxPrice) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (params.sort === "price_asc") return priceNumber(a.priceFrom) - priceNumber(b.priceFrom);
    if (params.sort === "price_desc") return priceNumber(b.priceFrom) - priceNumber(a.priceFrom);
    if (params.sort === "tasks") return b.completedTasks - a.completedTasks;
    return b.rating - a.rating;
  });
}

function buildProvidersSchema(providers: FeaturedProvider[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Taskeři na Taskovo",
    description: "Katalog nezávislých taskerů pro lokální služby v Česku.",
    itemListElement: providers.slice(0, 20).map((provider, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://taskovo.cz/poskytovatel/${provider.id}`,
      item: {
        "@type": "LocalBusiness",
        name: provider.name,
        address: { "@type": "PostalAddress", addressLocality: provider.city, addressCountry: "CZ" },
        areaServed: provider.city,
        description: provider.bio,
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: provider.rating,
          reviewCount: Math.max(provider.reviews, 1),
        },
      },
    })),
  };
}

export default async function ProvidersPage({ searchParams }: { searchParams: Promise<ProviderSearchParams> }) {
  const params = await searchParams;
  const taskerProfiles = await getTaskers();
  const liveProviders = taskerProfiles.map(profileToProvider);
  const seen = new Set(liveProviders.map((provider) => provider.id));
  const providers = [...liveProviders, ...featuredProviders.filter((provider) => !seen.has(provider.id))];
  const filteredProviders = filterProviders(providers, params);
  const providerCities = Array.from(new Set([...cities, ...providers.map((provider) => provider.city)])).sort((a, b) => a.localeCompare(b, "cs-CZ"));
  const verifiedCount = providers.filter((provider) => provider.verified).length;
  const completedTotal = providers.reduce((sum, provider) => sum + provider.completedTasks, 0);

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProvidersSchema(filteredProviders)) }} />
        <section className="section-title">
          <p className="kicker">Taskeři</p>
          <h1 className="page-title">Najděte šikovné lidi ve svém okolí</h1>
          <p>Filtrovaný katalog taskerů pro klienty. Vyberte město, kategorii, ověření, cenu a kvalitu profilu.</p>
        </section>

        <section className={styles.marketIntro} aria-label="Souhrn taskerů">
          <article><strong>{providers.length} profilů</strong><p>Katalog kombinuje živé profily a ukázkové ověřené karty pro pilot.</p></article>
          <article><strong>{verifiedCount} ověřených</strong><p>Ověřený tasker je vizuálně zvýrazněn teplým badge.</p></article>
          <article><strong>{completedTotal} úkolů</strong><p>Historie dokončených prací bude růst po spuštění platformy.</p></article>
        </section>

        <section className={styles.marketLayout}>
          <form className={styles.filterPanel} action="/poskytovatele">
            <h2>Filtry</h2>
            <p className={styles.filterHint}>Najděte člověka podle lokality, typu služby, ověření a síly profilu.</p>
            <details className={styles.filterGroup} open>
              <summary>Lokalita</summary>
              <div className={styles.filterFields}>
                <label>Město
                  <select name="city" defaultValue={params.city || ""}>
                    <option value="">Všechna města</option>
                    {providerCities.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </label>
              </div>
            </details>

            <details className={styles.filterGroup} open>
              <summary>Kategorie</summary>
              <div className={styles.filterFields}>
                <label>Typ služby
                  <select name="category" defaultValue={params.category || ""}>
                    <option value="">Všechny služby</option>
                    {marketplaceCategories.map((category) => <option key={category.slug} value={category.shortTitle}>{category.title}</option>)}
                  </select>
                </label>
              </div>
            </details>

            <details className={styles.filterGroup} open>
              <summary>Důvěra</summary>
              <div className={styles.filterFields}>
                <label>Ověření
                  <select name="verified" defaultValue={params.verified || ""}>
                    <option value="">Všichni</option>
                    <option value="true">Jen ověření</option>
                  </select>
                </label>
                <label>Min. hodnocení
                  <select name="minRating" defaultValue={params.minRating || ""}>
                    <option value="">Bez limitu</option>
                    <option value="4.5">4.5+</option>
                    <option value="4.8">4.8+</option>
                  </select>
                </label>
              </div>
            </details>

            <details className={styles.filterGroup}>
              <summary>Cena a řazení</summary>
              <div className={styles.filterFields}>
                <label>Max. cena od<input name="maxPrice" type="number" min="0" step="50" defaultValue={params.maxPrice || ""} placeholder="500" /></label>
                <label>Seřadit
                  <select name="sort" defaultValue={params.sort || "rating"}>
                    <option value="rating">Nejlepší hodnocení</option>
                    <option value="tasks">Nejvíce úkolů</option>
                    <option value="price_asc">Cena vzestupně</option>
                    <option value="price_desc">Cena sestupně</option>
                  </select>
                </label>
              </div>
            </details>

            <button className="button primary" type="submit">Použít filtry</button>
            <a className="button secondary" href="/poskytovatele">Vymazat</a>
          </form>

          <div>
            <div className={styles.resultsHeader}>
              <h2>{filteredProviders.length} taskerů</h2>
              <div className={styles.resultsMeta}><span className="pill">{providers.length} celkem</span><span className="pill status-completed">Ověření profilu</span></div>
            </div>
            <div className={styles.trustStrip} aria-label="Pravidla výběru taskera">
              <span>Klient vybírá taskera samostatně</span>
              <span>Tasker je nezávislý OSVČ nebo firma</span>
              <span>Taskovo službu zprostředkovává</span>
            </div>
            {filteredProviders.length ? (
              <div className="provider-grid">{filteredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div>
            ) : (
              <div className={styles.emptyResults}>
                <h3>Žádní taskeři podle filtrů</h3>
                <p>Zkuste jiné město, kategorii nebo vypněte filtr ověření.</p>
                <a className="button secondary" href="/poskytovatele">Zobrazit všechny taskery</a>
              </div>
            )}
            <div className={styles.marketNote}><strong>Nezávislí poskytovatelé</strong>Taskeři nejsou zaměstnanci Taskovo. Klient si vybírá samostatně podle profilu, ceny, zprávy a domluvy.</div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
