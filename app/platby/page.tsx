import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/platby";

export const metadata: Metadata = {
  title: "Platby | Taskovo",
  description:
    "Cilovy platebni model Taskovo: vyber nabidky, rezervace platby pres Stripe, potvrzeni dokonceni, spory a vyplata taskerovi.",
  alternates: { canonical: "/platby" },
  openGraph: {
    title: "Platby | Taskovo",
    description: "Bezpecny platebni model pro marketplace lokalnich sluzeb po napojeni Stripe.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platby | Taskovo",
    description: "Bezpecny platebni model pro marketplace lokalnich sluzeb po napojeni Stripe.",
  },
};

const paymentSteps = [
  ["01", "Klient vybere nabidku", "Po porovnani taskeru klient potvrdi konkretni nabidku, cenu a domluveny rozsah ukolu."],
  ["02", "Platba se rezervuje", "V budouci fazi Stripe platbu bezpecne zadrzi do dokonceni nebo vyreseni problemu."],
  ["03", "Tasker dokonci praci", "Tasker oznaci ukol jako hotovy a klient dostane moznost vysledek potvrdit nebo otevrit spor."],
  ["04", "Probehne vyplata", "Po potvrzeni system pripravi vyplatu taskerovi a zauctuje provizi platformy."],
];

const principles = [
  "Cena musi byt jasna pred potvrzenim nabidky.",
  "Taskovo nema skryvat poplatky ani nutit klienta k nejasne platbe.",
  "U sporu musi byt videt ukol, nabidka, komunikace a duvod problemu.",
  "Stripe pridame az po dokonceni zakladniho workflow webu.",
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
            <h1 className="page-title">Bezpecny platebni model pro marketplace</h1>
            <p className="hero-lead">Platby budeme pridavat postupne pres Stripe. Nejdrive musi byt stabilni zadani ukolu, nabidky, vyber taskera, dokonceni, spory a administrace.</p>
          </div>
          <div className="page-hero-card">
            <strong>Stripe pozdeji</strong>
            <p>Ted stranka popisuje cilovy model. Ostre platby zapojime az po dokonceni zakladni pracovni verze a testovani flow.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Platebni flow</p><h2>Jak ma platba fungovat</h2></div></div>
          <div className="workflow-grid">
            {paymentSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Principy</p>
            <h2>Co musi byt jasne pred spustenim plateb</h2>
            <p>U sluzeb mezi lidmi je platebni system zaroven duvera, pravidla a ochrana proti nedorozumeni. Proto ho nedavame predcasne.</p>
          </div>
          <div className="feature-list">
            {principles.map((item) => <div key={item}><strong>{item}</strong><span>Soucast budouciho napojeni Stripe, administrace a emailovych notifikaci.</span></div>)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
