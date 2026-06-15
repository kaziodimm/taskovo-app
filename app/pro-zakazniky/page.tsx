import type { Metadata } from "next";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { marketplaceCategories } from "@/lib/marketplace-data";

const pageUrl = "https://taskovo.cz/pro-zakazniky";

export const metadata: Metadata = {
  title: "Pro zákazníky | Taskovo",
  description:
    "Zadejte úklid, stěhování, doručení, montáž nebo jinou lokální pomoc. Porovnejte nabídky taskerů a vyberte si sami.",
  alternates: { canonical: "/pro-zakazniky" },
  openGraph: {
    title: "Taskovo pro zákazníky",
    description: "Jedno místo pro zadání úkolu, porovnání nabídek a výběr lokálního taskera.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taskovo pro zákazníky",
    description: "Jedno místo pro zadání úkolu, porovnání nabídek a výběr lokálního taskera.",
  },
};

const benefits = [
  ["Rychlé zadání", "Popíšete úkol jedním formulářem a nemusíte obvolávat známé, firmy ani skupiny."],
  ["Porovnání nabídek", "Vidíte cenu, termín, profil taskera a později také ověření, recenze a historii."],
  ["Lokální dostupnost", "Taskovo je stavěné i pro menší města, kde často chybí organizovaná nabídka služeb."],
  ["Kontrola nad výběrem", "Klient si taskera vybírá sám. Platforma nenutí konkrétního poskytovatele."],
];

const useCases = ["Úklid bytu před návštěvou", "Odvoz věcí nebo menší stěhování", "Vyzvednutí balíku nebo nákupu", "Montáž nábytku a polic", "Pomoc seniorům s praktickým úkolem", "Zahrada, terasa nebo sezónní práce"];

export default function CustomersPage() {
  const customerJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Taskovo pro zákazníky",
    url: pageUrl,
    description: metadata.description,
    about: {
      "@type": "Service",
      name: "Taskovo marketplace pro zákazníky",
      provider: { "@type": "Organization", name: "Taskovo", url: "https://taskovo.cz" },
      audience: { "@type": "Audience", audienceType: "Klienti hledající lokální služby" },
      areaServed: "CZ",
    },
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(customerJsonLd) }} />
        <section className="page-hero">
          <div>
            <p className="kicker">Pro zákazníky</p>
            <h1 className="page-title">Zadejte úkol a vyberte si pomoc v okolí</h1>
            <p className="hero-lead">Taskovo pomáhá najít lidi na praktické úkoly, které nechcete nebo nemůžete řešit sami. Od doručení přes úklid až po montáž a stěhování.</p>
            <div className="hero-actions"><a className="button primary" href="/zadat-ukol">Zadat nový úkol</a><a className="button secondary" href="/poskytovatele">Prohlédnout taskery</a></div>
          </div>
          <div className="page-hero-card">
            <strong>Vy rozhodujete</strong>
            <p>Klient porovnává nabídky a vybírá taskera samostatně. Taskovo slouží jako přehledné místo pro zadání, komunikaci a důvěru.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Výhody</p><h2>Proč zadat úkol přes Taskovo</h2></div></div>
          <div className="trust-grid">
            {benefits.map(([title, text]) => <article key={title}><span className="trust-icon">OK</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Typické situace</p>
            <h2>Když je jednodušší zaplatit za pomoc</h2>
            <p>Taskovo cílí na běžné úkoly, které lidem berou čas, energii nebo vyžadují auto, nářadí či druhý pár rukou.</p>
          </div>
          <div className="feature-list">
            {useCases.map((useCase) => <div key={useCase}><strong>{useCase}</strong><span>Zadání může obsahovat město, čas, rozpočet a fotografie pro přesnější nabídky.</span></div>)}
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Kategorie</p><h2>Nejčastější služby</h2></div><a className="button secondary" href="/kategorie">Všechny kategorie</a></div>
          <div className="category-grid">{marketplaceCategories.slice(0, 3).map((category) => <CategoryCard key={category.slug} category={category} />)}</div>
        </section>
      </main>
      <Footer />
    </>
  );
}
