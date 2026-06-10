import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Bezpecnost a duvera | Taskovo",
  description:
    "Jak Taskovo pracuje s overenim identity, ICO, moderaci obsahu, recenzemi, bezpecnou platbou a pravidly platformy.",
  alternates: { canonical: "/bezpecnost" },
  openGraph: {
    title: "Bezpecnost a duvera | Taskovo",
    description: "Duvod, proc Taskovo oddeluje roli platformy, klienta a nezavisleho taskera.",
    url: "https://taskovo-app.vercel.app/bezpecnost",
    siteName: "Taskovo",
    type: "website",
  },
};

const trustBlocks = [
  ["Ověřená totožnost", "U pilotu začínáme ruční kontrolou profilu a kontaktů. Později přidáme silnější ověření identity podle rizika služby."],
  ["Kontrola IČO", "U OSVČ a firem bude možné kontrolovat podnikatelské údaje a zobrazit stav ověření v profilu taskera."],
  ["Bezpečná platba", "Stripe přidáme po dokončení základního webu. Cílem je rezervace platby, potvrzení dokončení a řešení sporů."],
  ["Recenze po každém úkolu", "Klient i tasker budou budovat historii. Recenze pomáhají odlišit spolehlivé profily od nových nebo rizikových."],
  ["Moderace obsahu", "Fotky, profily, úkoly a rizikové požadavky mohou být schvalované administrátorem před zobrazením."],
  ["Taskovo není zaměstnavatel", "Taskeři jsou nezávislé osoby, OSVČ nebo firmy. Platforma službu přímo neposkytuje."],
];

const riskRules = [
  "Zakázat nelegální, nebezpečné nebo diskriminační úkoly.",
  "U citlivých kategorií vyžadovat ruční kontrolu nebo dodatečné oprávnění.",
  "Schvalovat profilové fotografie před veřejným zobrazením.",
  "Udržet historii komunikace a rozhodnutí administrátora pro podporu.",
];

export default function SafetyPage() {
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Bezpecnost a duvera Taskovo",
    description: metadata.description,
    url: "https://taskovo-app.vercel.app/bezpecnost",
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
        <section className="page-hero">
          <div>
            <p className="kicker">Bezpečnost</p>
            <h1 className="page-title">Důvěra je základ marketplace služeb</h1>
            <p className="hero-lead">Taskovo musí chránit klienty, taskery i platformu. Proto kombinujeme ověřování, moderaci, jasná pravidla, recenze a postupné zavedení bezpečných plateb.</p>
          </div>
          <div className="page-hero-card">
            <strong>Jasné role</strong>
            <p>Taskovo je zprostředkovatel. Klient si taskera vybírá samostatně a tasker službu poskytuje jako nezávislá osoba, OSVČ nebo firma.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Důvěra</p><h2>Prvky, které budeme posilovat</h2></div></div>
          <div className="trust-grid">
            {trustBlocks.map(([title, text]) => <article key={title}><span className="trust-icon">ID</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Moderace</p>
            <h2>Co musí hlídat administrátor</h2>
            <p>V pilotní fázi je ruční kontrola výhoda. Pomůže rychle zachytit nevhodný obsah a zároveň pochopit, kde později automatizovat pravidla.</p>
          </div>
          <div className="feature-list">
            {riskRules.map((rule) => <div key={rule}><strong>{rule}</strong><span>Pravidlo pro bezpečnější provoz před plným škálováním marketplace.</span></div>)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
