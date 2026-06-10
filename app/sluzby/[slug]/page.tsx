import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { marketplaceCategories } from "@/lib/marketplace-data";

const baseUrl = "https://taskovo-app.vercel.app";

const landingPages = [
  {
    slug: "uklid-praha",
    city: "Praha",
    categorySlug: "uklid",
    title: "Uklid Praha",
    headline: "Uklid v Praze bez hledani po skupinach",
    intro:
      "Zadejte jednorazovy nebo pravidelny uklid v Praze, porovnejte nabidky a vyberte si taskera podle ceny, recenzi a dostupnosti.",
    examples: ["Uklid bytu 2+kk", "Uklid po stehovani", "Mytí oken", "Pravidelny uklid kancelare"],
  },
  {
    slug: "stehovani-praha",
    city: "Praha",
    categorySlug: "stehovani",
    title: "Stehovani Praha",
    headline: "Stehovani a odnos veci v Praze",
    intro:
      "Najdete pomoc s krabicemi, nabytkem, odnosom veci do sklepa nebo mensim prevozem po Praze bez nutnosti objednavat velkou firmu.",
    examples: ["Odnos pracky", "Prevoz krabic", "Vyklizeni sklepa", "Pomoc s nakladkou"],
  },
  {
    slug: "montaz-nabytku-praha",
    city: "Praha",
    categorySlug: "montaz-nabytku",
    title: "Montaz nabytku Praha",
    headline: "Montaz nabytku v Praze s jasnou cenou",
    intro:
      "Popiste, co je potreba smontovat, pridejte fotky nebo odkaz na produkt a nechte si poslat nabidky od taskeru v Praze.",
    examples: ["Skrin IKEA", "Postel a komoda", "Police na zed", "Kancelarsky stul"],
  },
  {
    slug: "doruceni-zasilek-praha",
    city: "Praha",
    categorySlug: "doruceni",
    title: "Doruceni zasilek Praha",
    headline: "Kuryrni pomoc a vyzvednuti zasilek v Praze",
    intro:
      "Kdyz se vam nechce nebo nemuzete jet pres mesto, zadejte trasu, cas a rozpocet. Tasker muze vyzvednout balik, dokumenty nebo nakup.",
    examples: ["Vyzvednout balik", "Dovest nakup", "Predat dokumenty", "Vyzvednout leky"],
  },
  {
    slug: "pomoc-na-zahrade-praha",
    city: "Praha",
    categorySlug: "zahrada",
    title: "Pomoc na zahrade Praha",
    headline: "Pomoc na zahrade a kolem domu v Praze",
    intro:
      "Najdete lokalni pomoc pro sekani travy, uklid terasy, hrabani listi, odnos vetvi nebo sezonni prace kolem domu.",
    examples: ["Sekani travy", "Hrabani listi", "Odvoz vetvi", "Uklid terasy"],
  },
];

const faqItems = [
  {
    question: "Je Taskovo firma, ktera sluzbu provadi?",
    answer:
      "Ne. Taskovo je zprostredkovatelska platforma. Sluzbu provadi nezavisly tasker, OSVC nebo firma, kterou si klient sam vybere.",
  },
  {
    question: "Muzu si vybrat podle ceny a hodnoceni?",
    answer:
      "Ano. Cilem marketplace je porovnat cenu, profil, dostupnost, hodnoceni a zpusob provedeni jeste pred potvrzenim ukolu.",
  },
  {
    question: "Funguje to jen v Praze?",
    answer:
      "Praha je dulezita pro start a SEO, ale Taskovo je stavene i pro Brno, Ostravu, Plzen, Olomouc a mensi mesta, kde organizovana pomoc casto chybi.",
  },
];

function getLanding(slug: string) {
  return landingPages.find((page) => page.slug === slug);
}

export function generateStaticParams() {
  return landingPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getLanding(slug);
  if (!page) return {};

  const title = `${page.title} | Taskovo`;
  const description = `${page.intro} Taskovo propojuje klienty s nezavislymi taskery v okoli.`;
  const path = `/sluzby/${page.slug}`;

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

export default async function ServiceLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLanding(slug);
  if (!page) notFound();

  const category = marketplaceCategories.find((item) => item.slug === page.categorySlug);
  if (!category) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    description: page.intro,
    areaServed: page.city,
    serviceType: category.title,
    provider: {
      "@type": "Organization",
      name: "Taskovo",
      description: "Taskovo je pouze zprostredkovatelska platforma, ne zamestnavatel taskeru.",
    },
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />

        <section className="page-hero">
          <div>
            <p className="kicker">{page.city}</p>
            <h1 className="page-title">{page.headline}</h1>
            <p className="hero-lead">{page.intro}</p>
            <div className="hero-actions">
              <a className="button primary" href={`/zadat-ukol?kategorie=${category.slug}`}>Zadat ukol v Praze</a>
              <a className="button secondary" href={`/kategorie/${category.slug}`}>Detail kategorie</a>
            </div>
          </div>
          <div className="page-hero-card">
            <strong>{category.averagePrice}</strong>
            <p>{category.responseTime}</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 34 }}>
          <div className="section-title">
            <p className="kicker">Co lze zadat</p>
            <h2>Typicke poptavky pro {page.city}</h2>
          </div>
          <div className="category-grid">
            {page.examples.map((example) => (
              <article className="legal-card" key={example}>
                <h3>{example}</h3>
                <p>Popiste misto, termin, rozsah, fotky a rozpocet. Taskeri poslou nabidky podle realne dostupnosti.</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section split">
          <div>
            <p className="kicker">Marketplace UX</p>
            <h2>Klient vybira, Taskovo propojuje</h2>
            <p className="hero-lead">
              Taskovo nema vystupovat jako zamestnavatel ani firma, ktera sluzbu primo provadi. Platforma pomaha s poptavkou, profily, komunikaci, recenzemi a pozdeji i bezpecnou platbou.
            </p>
          </div>
          <div className="feature-list">
            <div><strong>Nezavisli taskeri</strong><span>Taskeri mohou byt OSVC, firmy nebo nezavisle osoby podle typu sluzby.</span></div>
            <div><strong>Transparentni vyber</strong><span>Klient porovna cenu, dostupnost, profil a recenze pred potvrzenim.</span></div>
            <div><strong>Pripraveno pro platby</strong><span>Stripe a vyplaty pridame po dokonceni funkcni verze a domene.</span></div>
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-title">
            <p className="kicker">FAQ</p>
            <h2>Otazky pred zadanim ukolu</h2>
          </div>
          <div className="faq-list">
            {faqItems.map((item) => (
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
