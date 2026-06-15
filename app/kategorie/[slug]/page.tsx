import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import { featuredProviders, marketplaceCategories, trustBadges } from "@/lib/marketplace-data";

const baseUrl = "https://taskovo.cz";

const cityLinks = [
  { city: "Praha", href: "/uklid-praha", categorySlug: "uklid" },
  { city: "Praha", href: "/stehovani-praha", categorySlug: "stehovani" },
  { city: "Praha", href: "/montaz-nabytku-praha", categorySlug: "montaz-nabytku" },
  { city: "Praha", href: "/doruceni-zasilek-praha", categorySlug: "doruceni" },
  { city: "Praha", href: "/pomoc-na-zahrade-praha", categorySlug: "zahrada" },
];

const categoryFaqs = [
  {
    question: "Je Taskovo poskytovatel služby?",
    answer:
      "Ne. Taskovo je zprostředkovatelská platforma. Klient si vybírá taskera samostatně a tasker vystupuje jako nezávislá osoba, OSVČ nebo firma.",
  },
  {
    question: "Jak rychle můžu dostat nabídky?",
    answer:
      "U běžných úkolů ve větších městech může klient dostat první reakce v řádu minut. U menších měst záleží na dostupnosti taskerů v okolí.",
  },
  {
    question: "Můžu před výběrem porovnat cenu a recenze?",
    answer:
      "Ano. Cílem Taskovo je ukázat nabídky, profil taskera, hodnocení, cenu, dostupnost a způsob provedení ještě před potvrzením úkolu.",
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
  const description = `${category.summary} Najděte pomoc v okolí, porovnejte nabídky a vyberte si taskera samostatně.`;
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const matchedCityLinks = cityLinks.filter((item) => item.categorySlug === category.slug);
  const pageUrl = `${baseUrl}/kategorie/${category.slug}`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${category.title} přes Taskovo`,
    description: category.description,
    provider: {
      "@type": "Organization",
      name: "Taskovo",
      url: baseUrl,
      description: "Taskovo je zprostředkovatelská platforma. Taskeři jsou nezávislé osoby, OSVČ nebo firmy.",
    },
    areaServed: "Česká republika",
    serviceType: category.title,
    url: pageUrl,
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
              <a className="button primary" href={`/zadat-ukol?kategorie=${category.slug}`}>Zadat úkol</a>
              <a className="button secondary" href={`/poskytovatele?kategorie=${category.slug}`}>Najít taskery</a>
            </div>
          </div>
          <div className="page-hero-card">
            <strong>{category.averagePrice}</strong>
            <p>{category.responseTime}. Klient vždy porovnává konkrétní nabídky a vybírá taskera samostatně.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 34 }}>
          <div className="section-title">
            <p className="kicker">Typické úkoly</p>
            <h2>Co lidé nejčastěji poptávají</h2>
          </div>
          <div className="workflow-grid">
            {category.examples.map((example, index) => (
              <article key={example}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{example}</h3>
                <p>Klient popíše rozsah, místo, termín a rozpočet. Taskeři pošlou vlastní nabídku.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section split">
          <div>
            <p className="kicker">Jak vybrat</p>
            <h2>Porovnání místo hledání po skupinách</h2>
            <p className="hero-lead">
              Taskovo má sjednotit poptávku, profily, cenu, recenze a komunikaci na jednom místě. Klient si sám vybere, komu úkol svěří.
            </p>
          </div>
          <div className="feature-list">
            <div><strong>Jasný rozsah</strong><span>Popis úkolu, fotky, místo a termín pomůžou taskerům dát přesnější nabídku.</span></div>
            <div><strong>Nezávislí taskeři</strong><span>Taskovo není zaměstnavatel a přímo neposkytuje službu.</span></div>
            <div><strong>Kontrola důvěry</strong><span>U vybraných profilů lze postupně přidávat ověření totožnosti, IČO a recenze.</span></div>
          </div>
        </section>

        {matchedCityLinks.length ? (
          <section className="section">
            <div className="section-title"><p className="kicker">Lokální stránka</p><h2>{category.shortTitle} v Praze</h2><p>Pro vybrané služby postupně vytváříme samostatné stránky podle měst a reálné poptávky.</p></div>
            <div className="legal-grid">
              {matchedCityLinks.map((item) => <a className="legal-card" href={item.href} key={item.href}><h3>{category.shortTitle} {item.city}</h3><p>Detailní SEO stránka pro konkrétní službu a město.</p></a>)}
            </div>
          </section>
        ) : null}

        <section className="section">
          <div className="section-title">
            <p className="kicker">Doporučené profily</p>
            <h2>Taskeři vhodní pro tuto kategorii</h2>
          </div>
          <div className="provider-grid">
            {providers.slice(0, 3).map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <p className="kicker">Důvody důvěry</p>
            <h2>Základ, který bude důležitý pro pilot</h2>
          </div>
          <div className="trust-grid">
            {trustBadges.map((badge) => (
              <article key={badge}>
                <span className="trust-icon">OK</span>
                <h3>{badge}</h3>
                <p>Prvek důvěry, který pomáhá klientovi vybrat taskera podle kvality, transparentnosti a odpovědnosti.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-title">
            <p className="kicker">FAQ</p>
            <h2>Často kladené otázky ke kategorii</h2>
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
