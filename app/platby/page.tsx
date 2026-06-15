import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/platby";

export const metadata: Metadata = {
  title: "Platby | Taskovo",
  description:
    "Platební model Taskovo: výběr nabídky, bezpečné zpracování platby přes platebního partnera, potvrzení dokončení, spory a výplata taskerovi.",
  alternates: { canonical: "/platby" },
  openGraph: {
    title: "Platby | Taskovo",
    description: "Bezpečný platební model pro marketplace lokálních služeb.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platby | Taskovo",
    description: "Bezpečný platební model pro marketplace lokálních služeb.",
  },
};

const paymentSteps = [
  ["01", "Klient vybere nabídku", "Po porovnání taskerů klient potvrdí konkrétní nabídku, cenu a domluvený rozsah úkolu."],
  ["02", "Platba se zpracuje", "Platby jsou zpracovány přes platebního partnera a navázány na konkrétní objednávku."],
  ["03", "Tasker dokončí práci", "Tasker označí úkol jako hotový a klient dostane možnost výsledek potvrdit nebo otevřít spor."],
  ["04", "Proběhne výplata", "Po potvrzení dokončení se výplata uvolní taskerovi podle pravidel platformy."],
];

const principles = [
  "Cena musí být jasná před potvrzením nabídky.",
  "Taskovo nemá skrývat poplatky ani nutit klienta k nejasné platbě.",
  "U sporu musí být vidět úkol, nabídka, komunikace a důvod problému.",
  "Přesné podmínky platby se zobrazí před potvrzením objednávky.",
];

export default function PaymentsPage() {
  const paymentJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Platby Taskovo",
    url: pageUrl,
    description: metadata.description,
    about: {
      "@type": "Service",
      name: "Taskovo marketplace payments",
      provider: { "@type": "Organization", name: "Taskovo", url: "https://taskovo.cz" },
      serviceType: "Marketplace payment workflow",
      areaServed: "CZ",
    },
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(paymentJsonLd) }} />
        <section className="page-hero">
          <div>
            <p className="kicker">Platby</p>
            <h1 className="page-title">Bezpečný platební model pro marketplace</h1>
            <p className="hero-lead">Platební tok je navržen tak, aby klient viděl cenu před potvrzením, tasker měl jasný stav výplaty a případný spor měl dohledatelný kontext objednávky.</p>
          </div>
          <div className="page-hero-card">
            <strong>Platební partner</strong>
            <p>Platby jsou zpracovány přes platebního partnera. Výplata se uvolní po potvrzení dokončení nebo podle výsledku řešení sporu.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Platební flow</p><h2>Jak má platba fungovat</h2></div></div>
          <div className="workflow-grid">
            {paymentSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Principy</p>
            <h2>Co musí být jasné před potvrzením platby</h2>
            <p>U služeb mezi lidmi je platební systém zároveň důvěra, pravidla a ochrana proti nedorozumění.</p>
          </div>
          <div className="feature-list">
            {principles.map((item) => <div key={item}><strong>{item}</strong><span>Pravidlo chrání klienta, taskera i platformu při průběhu objednávky.</span></div>)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
