import type { Metadata } from "next";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { marketplaceCategories } from "@/lib/marketplace-data";

const pageUrl = "https://taskovo.cz/kategorie";

export const metadata: Metadata = {
  title: "Kategorie služeb | Taskovo",
  description:
    "Přehled kategorií na Taskovo: úklid, stěhování, montáž nábytku, doručení, zahrada, opravy a lokální pomoc v Česku.",
  alternates: { canonical: "/kategorie" },
  openGraph: {
    title: "Kategorie služeb | Taskovo",
    description: "Vyberte typ pomoci, zadejte úkol a porovnejte nabídky nezávislých taskerů v okolí.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kategorie služeb | Taskovo",
    description: "Vyberte typ pomoci, zadejte úkol a porovnejte nabídky nezávislých taskerů v okolí.",
  },
};

const seoLandingLinks = [
  { title: "Úklid Praha", href: "/uklid-praha", text: "Jednorázový i pravidelný úklid bytu, domu nebo kanceláře." },
  { title: "Stěhování Praha", href: "/stehovani-praha", text: "Menší stěhování, odnos věcí, krabice a převoz po městě." },
  { title: "Montáž nábytku Praha", href: "/montaz-nabytku-praha", text: "Skříně, postele, police, stoly a drobné domácí instalace." },
  { title: "Doručení zásilek Praha", href: "/doruceni-zasilek-praha", text: "Vyzvednutí balíků, nákupů, dokumentů nebo léků." },
  { title: "Pomoc na zahradě Praha", href: "/pomoc-na-zahrade-praha", text: "Sekání trávy, úklid terasy, hrabání listí a sezónní práce." },
];

export default function CategoriesPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Kategorie služeb Taskovo",
    url: pageUrl,
    description: metadata.description,
    hasPart: marketplaceCategories.map((category) => ({
      "@type": "WebPage",
      name: category.title,
      url: `https://taskovo.cz/kategorie/${category.slug}`,
      description: category.summary,
    })),
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
        <section className="page-hero">
          <div>
            <p className="kicker">Kategorie</p>
            <h1 className="page-title">Vyberte typ pomoci</h1>
            <p className="hero-lead">Taskovo nabízí kategorie s jasnou poptávkou, rychlým porovnáním nabídek a lokální dostupností napříč Českem.</p>
          </div>
          <div className="page-hero-card">
            <strong>{marketplaceCategories.length} hlavních kategorií</strong>
            <p>Úklid, stěhování, montáž, doručení, zahrada, opravy a další rozšíření podle reálné poptávky.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 26 }}>
          <div className="section-title">
            <p className="kicker">Hlavní kategorie</p>
            <h2>Služby, které lidé hledají nejčastěji</h2>
          </div>
          <div className="category-grid">
            {marketplaceCategories.map((category) => <CategoryCard key={category.slug} category={category} />)}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <p className="kicker">Praha</p>
            <h2>Lokální stránky podle poptávky</h2>
            <p>Tyto stránky pomáhají vyhledávačům i klientům pochopit konkrétní služby v konkrétním městě. Stejná struktura se dá rozšířit pro Brno, Ostravu, Plzeň a menší města.</p>
          </div>
          <div className="legal-grid">
            {seoLandingLinks.map((item) => (
              <a className="legal-card" href={item.href} key={item.href}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="section split">
          <div>
            <p className="kicker">Role platformy</p>
            <h2>Taskovo propojuje, klient si vybírá</h2>
            <p className="hero-lead">Taskovo je zprostředkovatelská platforma. Taskeři jsou nezávislé osoby, OSVČ nebo firmy. Taskovo není zaměstnavatel taskerů a služby přímo neposkytuje.</p>
          </div>
          <div className="feature-list">
            <div><strong>Lepší orientace</strong><span>Každá kategorie má vlastní detail, typické úkoly, ceny a FAQ.</span></div>
            <div><strong>Škálování podle měst</strong><span>SEO struktura může růst podle reálné poptávky v Česku.</span></div>
            <div><strong>Marketplace logika</strong><span>Zákazník porovnává nabídky, tasker sám rozhoduje, na které úkoly reaguje.</span></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
