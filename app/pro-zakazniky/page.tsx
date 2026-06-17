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
  ["Rychlejší než hledání ve skupinách", "Zadáte úkol jednou a nemusíte psát do několika chatů, čekat na náhodné odpovědi ani obvolávat známé."],
  ["Vyberete si sami", "Porovnáte cenu, zprávu, profil taskera a domluvu. Taskovo vám konkrétního člověka nenutí."],
  ["Vše na jednom místě", "Zadání, nabídky, zprávy, fotky, platby a historie objednávky zůstávají u konkrétního úkolu."],
  ["Větší důvěra", "Profily, ověření, recenze a jasná pravidla pomáhají rozhodnout se bezpečněji než v anonymních skupinách."],
];

const useCases = ["Úklid bytu před návštěvou", "Odvoz věcí nebo menší stěhování", "Vyzvednutí balíku nebo nákupu", "Montáž nábytku a polic", "Pomoc seniorům s praktickým úkolem", "Zahrada, terasa nebo sezónní práce"];

const journey = [
  ["01", "Popíšete, co potřebujete", "Město, čas, rozpočet, fotky a krátký popis pomůžou taskerům poslat přesnější nabídku."],
  ["02", "Dostanete nabídky", "Tasker pošle cenu, zprávu a dostupnost. Vy si nabídky porovnáte v klidu."],
  ["03", "Vyberete taskera", "Rozhodnutí je na vás. Taskovo slouží jako marketplace, ne jako agentura s přiděleným pracovníkem."],
  ["04", "Potvrdíte dokončení", "Po dokončení potvrdíte výsledek, případně přidáte recenzi nebo otevřete spor přes podporu."],
];

const customerFaqs = [
  ["Musím si taskera vybrat hned?", "Ne. Nabídky můžete porovnat podle ceny, zprávy, profilu a komunikace. Výběr je vždy na klientovi."],
  ["Je Taskovo poskytovatel služby?", "Ne. Taskovo je zprostředkovatelská platforma. Službu poskytuje vybraný tasker samostatně jako OSVČ, firma nebo nezávislá osoba podle pravidel služby."],
  ["Můžu přidat fotky k úkolu?", "Ano. Fotky pomáhají upřesnit rozsah práce, ale ve veřejném seznamu úkolů zbytečně nezabírají místo."],
  ["Co když se něco pokazí?", "Komunikace a historie objednávky zůstává u úkolu. U plateb a sporů se používá proces Taskovo a pravidla platebního partnera."],
];

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

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: customerFaqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(customerJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <section className="page-hero">
          <div>
            <p className="kicker">Pro zákazníky</p>
            <h1 className="page-title">Najděte pomoc rychleji a bezpečněji než ve skupinách</h1>
            <p className="hero-lead">Taskovo pomáhá zadat praktický úkol, získat nabídky od lidí v okolí a vybrat si taskera samostatně. Hodí se pro úklid, doručení, montáž, stěhování i drobnou pomoc, kterou nechcete řešit sami.</p>
            <div className="hero-actions"><a className="button primary" href="/zadat-ukol">Zadat nový úkol</a><a className="button secondary" href="/poskytovatele">Prohlédnout taskery</a></div>
          </div>
          <div className="page-hero-card">
            <strong>Vy rozhodujete</strong>
            <p>Klient porovnává nabídky a vybírá taskera samostatně. Taskovo je zprostředkovatelská platforma, ne zaměstnavatel ani přímý poskytovatel služby.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Výhody</p><h2>Proč zadat úkol přes Taskovo</h2></div></div>
          <div className="trust-grid">
            {benefits.map(([title, text]) => <article key={title}><span className="trust-icon">OK</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section dark-band">
          <div className="section-title">
            <p className="kicker">Proces</p>
            <h2>Od úkolu k hotové práci bez zbytečného chaosu</h2>
          </div>
          <div className="workflow-grid">
            {journey.map(([step, title, text]) => <article key={step}><span>{step}</span><h3>{title}</h3><p>{text}</p></article>)}
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

        <section className="section faq-section">
          <div className="section-heading-row"><div className="section-title"><p className="kicker">FAQ</p><h2>Otázky před prvním úkolem</h2></div><a className="button secondary" href="/faq">Všechny otázky</a></div>
          <div className="faq-list">
            {customerFaqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
