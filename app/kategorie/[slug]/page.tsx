import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import { featuredProviders, marketplaceCategories, trustBadges } from "@/lib/marketplace-data";

const baseUrl = "https://taskovo-app.vercel.app";

const categoryFaqs = [
  {
    question: "Je Taskovo poskytovatel sluzby?",
    answer:
      "Ne. Taskovo je zprostredkovatelska platforma. Klient si vybira taskera samostatne a tasker vystupuje jako nezavisla osoba, OSVC nebo firma.",
  },
  {
    question: "Jak rychle muzu dostat nabidky?",
    answer:
      "U beznych ukolu ve vetsich mestech muze klient dostat prvni reakce v radu minut. U mensich mest zalezi na dostupnosti taskeru v okoli.",
  },
  {
    question: "Muzu pred vyberem porovnat cenu a recenze?",
    answer:
      "Ano. Cilem Taskovo je ukazat nabidky, profil taskera, hodnoceni, cenu, dostupnost a zpusob provedeni jeste pred potvrzenim ukolu.",
  },
];

function getCategory(slug: string) {
  return marketplaceCategories.find((category) => category.slug === slug);
}

export function generateStaticParams() {
  return marketplaceCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  const title = `${category.title} | Taskovo`;
  const description = `${category.summary} Najdete pomoc v okoli, porovnate nabidky a vyberete si taskera samostatne.`;
  const path = `/kategorie/${category.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path}`,
      siteName: "Taskovo",
      type: "website",
    },
  };
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const relevantProviders = featuredProviders.filter((provider) =>
    provider.categories.some((providerCategory) =>
      providerCategory.toLowerCase().includes(category.shortTitle.toLowerCase()) ||
      category.title.toLowerCase().includes(providerCategory.toLowerCase()),
    ),
  );
  const providers = relevantProviders.length > 0 ? relevantProviders : featuredProviders;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${category.title} pres Taskovo`,
    description: category.description,
    provider: {
      "@type": "Organization",
      name: "Taskovo",
      description: "Taskovo je zprostredkovatelska platforma. Taskeri jsou nezavisle osoby, OSVC nebo firmy.",
    },
    areaServed: "Ceska republika",
    serviceType: category.title,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CZK",
      description: category.averagePrice,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categoryFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="page-hero">
          <div>
            <p className="kicker">Kategorie</p>
            <h1 className="page-title">{category.title}</h1>
            <p className="hero-lead">{category.description}</p>
            <div className="hero-actions">
              <a className="button primary" href={`/zadat-ukol?kategorie=${category.slug}`}>Zadat ukol</a>
              <a className="button secondary" href={`/poskytovatele?kategorie=${category.slug}`}>Najit taskery</a>
            </div>
          </div>
          <div className="page-hero-card">
            <strong>{category.averagePrice}</strong>
            <p>{category.responseTime}</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 34 }}>
          <div className="section-title">
            <p className="kicker">Typicke ukoly</p>
            <h2>Co lide nejcasteji poptavaji</h2>
          </div>
          <div className="workflow-grid">
            {category.examples.map((example, index) => (
              <article key={example}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{example}</h3>
                <p>Klient popise rozsah, misto, termin a rozpocet. Taskeri poslou vlastni nabidku.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section split">
          <div>
            <p className="kicker">Jak vybrat</p>
            <h2>Porovnani misto hledani po skupinach</h2>
            <p className="hero-lead">
              Taskovo ma sjednotit poptavku, profily, cenu, recenze a komunikaci na jednom miste. Klient si sam vybere, komu ukol sveri.
            </p>
          </div>
          <div className="feature-list">
            <div><strong>Jasny rozsah</strong><span>Popis ukolu, fotky, misto a termin pomuzou taskerum dat presnejsi nabidku.</span></div>
            <div><strong>Nezavisli taskeri</strong><span>Taskovo neni zamestnavatel a primo neposkytuje sluzbu.</span></div>
            <div><strong>Kontrola duvery</strong><span>U vybranych profilu lze postupne pridavat overeni totoznosti, ICO a recenze.</span></div>
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <p className="kicker">Doporucene profily</p>
            <h2>Taskeri vhodni pro tuto kategorii</h2>
          </div>
          <div className="provider-grid">
            {providers.slice(0, 3).map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <p className="kicker">Duvody duvery</p>
            <h2>Zaklad, ktery bude dulezity pro pilot</h2>
          </div>
          <div className="trust-grid">
            {trustBadges.map((badge) => (
              <article key={badge}>
                <span className="trust-icon">OK</span>
                <h3>{badge}</h3>
                <p>Prvek duvery, ktery pomaha klientovi vybrat taskera podle kvality, transparentnosti a odpovednosti.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-title">
            <p className="kicker">FAQ</p>
            <h2>Casto kladene otazky ke kategorii</h2>
          </div>
          <div className="faq-list">
            {categoryFaqs.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
