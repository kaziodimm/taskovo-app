import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/vyplaty";

export const metadata: Metadata = {
  title: "Výplaty pro taskery | Taskovo",
  description:
    "Model výplat pro taskery, OSVČ a firmy: ověření účtu, platební partner, historie výplat, provize a stav profilu.",
  alternates: { canonical: "/vyplaty" },
  openGraph: {
    title: "Výplaty pro taskery | Taskovo",
    description: "Jak Taskovo řeší výplaty nezávislým taskerům po potvrzení dokončení úkolu.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Výplaty pro taskery | Taskovo",
    description: "Jak Taskovo řeší výplaty nezávislým taskerům po potvrzení dokončení úkolu.",
  },
};

const payoutBlocks = [
  ["Ověření účtu", "Tasker doplní identitu, typ podnikání a výplatní údaje podle požadavků platebního partnera."],
  ["Historie výplat", "Každá výplata je propojená s konkrétním úkolem, cenou, provizí, datem a stavem."],
  ["Provize platformy", "Taskovo transparentně ukazuje, kolik z částky tvoří provize a kolik jde taskerovi."],
  ["Zadržené platby", "U sporu nebo bezpečnostní kontroly může být výplata pozastavená do rozhodnutí administrátora."],
  ["Daňové podklady", "Tasker zůstává nezávislý a řeší své daňové povinnosti. Platforma může připravit přehledy a exporty."],
  ["Stav profilu", "Ověření, recenze a porušení pravidel mohou ovlivnit dostupnost výplat i viditelnost profilu."],
];

export default function PayoutsPage() {
  const payoutsJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Výplaty pro taskery Taskovo",
    url: pageUrl,
    description: metadata.description,
    about: {
      "@type": "Service",
      name: "Taskovo tasker payouts",
      provider: { "@type": "Organization", name: "Taskovo", url: "https://taskovo.cz" },
      serviceType: "Marketplace payout workflow",
      areaServed: "CZ",
    },
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(payoutsJsonLd) }} />
        <section className="page-hero">
          <div>
            <p className="kicker">Výplaty</p>
            <h1 className="page-title">Výplaty pro taskery a malé firmy</h1>
            <p className="hero-lead">Výplata se uvolní po potvrzení dokončení úkolu nebo podle výsledku řešení sporu. Tasker zůstává nezávislý OSVČ nebo firma.</p>
          </div>
          <div className="page-hero-card">
            <strong>Nezávislí poskytovatelé</strong>
            <p>Tasker není zaměstnanec Taskovo. Výplaty jsou řešené jako platby nezávislým osobám, OSVČ nebo firmám.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Model</p><h2>Co stránka výplat obsahuje</h2></div></div>
          <div className="dashboard-grid">
            {payoutBlocks.map(([title, text]) => <article className="dashboard-panel" key={title}><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Pravidla</p>
            <h2>Co musí být jasné před odesláním nabídky</h2>
            <p>Výplaty navazují na dokončení úkolu, potvrzení klienta, řešení sporů, provizi a ověřený profil taskera.</p>
          </div>
          <div className="request-card">
            <h3>Přesné podmínky</h3>
            <p className="fine-print">Přesné podmínky se zobrazí před odesláním nabídky a před potvrzením objednávky.</p>
            <div className="section-action"><a className="button secondary" href="/platby">Zobrazit platební model</a></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
