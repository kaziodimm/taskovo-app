import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/pro-taskery";

export const metadata: Metadata = {
  title: "Začněte získávat zákazníky | Taskovo pro taskery",
  description:
    "Taskovo pomáhá šikovným lidem, OSVČ a malým firmám získat zákazníky, posílat vlastní nabídky a budovat reputaci v lokálních službách.",
  alternates: { canonical: "/pro-taskery" },
  openGraph: {
    title: "Taskovo pro taskery",
    description: "Získejte zákazníky, posílejte vlastní nabídky a budujte reputaci jako nezávislý tasker, OSVČ nebo malá firma.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taskovo pro taskery",
    description: "Získejte zákazníky, posílejte vlastní nabídky a budujte reputaci jako nezávislý tasker.",
  },
};

const pains = [
  ["Nemáte vlastní web?", "Profil na Taskovo může být první místo, kde klient uvidí, co umíte, kde pracujete a jak se s vámi domluvit."],
  ["Nechcete platit drahou reklamu?", "Místo složité propagace reagujete na konkrétní poptávky od lidí, kteří už pomoc hledají."],
  ["Nevíte, kde najít první klienty?", "Dostupné úkoly vám ukážou, kde je reálná poptávka ve vašem okolí."],
  ["Nechcete ztrácet čas ve skupinách?", "Taskovo drží úkol, nabídku, zprávy, cenu a historii práce na jednom místě."],
];

const benefits = [
  ["Veřejný profil", "Klienti vidí vaše služby, město, ověření, fotku a později také recenze."],
  ["Lokální poptávky", "Vybíráte úkoly, které zvládnete, v lokalitě, kde opravdu pracujete."],
  ["Vlastní nabídky", "Sami navrhujete cenu, rozsah a termín. Pracujete sami za sebe."],
  ["Recenze po dokončení", "Každý dobře dokončený úkol může posílit vaši reputaci."],
  ["Přehled práce a výdělků", "Dashboard ukazuje nabídky, aktivní práci, dokončení profilu a odhad výdělku."],
  ["Dlouhodobá reputace", "Kvalitní profil a dobrá hodnocení vám mohou pomoct získat další zákazníky."],
];

const journey = [
  ["01", "Vytvoříte profil", "Ukážete město, služby, zkušenosti a kontakt, aby klient rychle pochopil, s čím mu můžete pomoct."],
  ["02", "Vyberete úkoly, které zvládnete", "Reagujete jen na zakázky, které dávají smysl vašim dovednostem, času a lokalitě."],
  ["03", "Pošlete vlastní nabídku", "Navrhnete cenu, termín a jasnou zprávu. Klient vidí, proč si může vybrat právě vás."],
  ["04", "Klient si vás vybere", "Taskovo pouze zprostředkuje spojení. Rozhodnutí zůstává na klientovi a domluvě mezi vámi."],
  ["05", "Po dokončení získáte hodnocení", "Dobře odvedená práce a profesionální komunikace se promění v důvěru pro další klienty."],
  ["06", "Reputace pomůže získat další zákazníky", "Každá dokončená zakázka posiluje profil a může vám otevřít cestu k opakované práci."],
];

const faqs = [
  ["Musím mít IČO?", "U placených služeb obvykle potřebujete podnikat jako OSVČ nebo firma podle českých pravidel. Taskovo není zaměstnavatel a nenahrazuje právní nebo daňové poradenství."],
  ["Kolik stojí registrace?", "Registrace tasker profilu může být zdarma. Přesné podmínky poplatků nebo provize se zobrazí před odesláním nabídky a před spuštěním platebního toku."],
  ["Jaká je provize?", "Provize bude nastavena transparentně podle typu objednávky a platebního partnera. Tasker uvidí podmínky před potvrzením nabídky."],
  ["Můžu si nastavit vlastní cenu?", "Ano. Tasker posílá vlastní nabídku, cenu a zprávu. Klient si potom vybírá samostatně podle profilu, ceny a domluvy."],
  ["Jsem zaměstnanec Taskovo?", "Ne. Taskovo je zprostředkovatelská platforma. Tasker není zaměstnancem Taskovo a služby poskytuje samostatně jako OSVČ nebo firma."],
  ["Jak získám první zakázku?", "Doplňte profil, nahrajte vhodnou fotku, vyberte úkol, který opravdu zvládnete, a pošlete jasnou nabídku s cenou, termínem a krátkým vysvětlením."],
];

export default function TaskersPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  const taskerJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Taskovo pro taskery",
    url: pageUrl,
    description: metadata.description,
    about: {
      "@type": "Service",
      name: "Taskovo marketplace pro taskery",
      provider: { "@type": "Organization", name: "Taskovo", url: "https://taskovo.cz" },
      audience: { "@type": "Audience", audienceType: "Nezávislí taskeři, OSVČ a malé firmy" },
      areaServed: "CZ",
    },
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(taskerJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <section className="page-hero">
          <div>
            <p className="kicker">Pro šikovné lidi a OSVČ</p>
            <h1 className="page-title">Začněte podnikat bez strachu z prázdného kalendáře</h1>
            <p className="hero-lead">Umíte uklízet, montovat, stěhovat, opravovat nebo pomáhat lidem? Taskovo vám pomůže dostat se k zákazníkům, posílat nabídky a budovat vlastní reputaci.</p>
            <div className="hero-actions"><a className="button primary" href="/registrace-poskytovatel">Vytvořit tasker profil</a><a className="button secondary" href="/tasks">Prohlédnout dostupné úkoly</a></div>
          </div>
          <div className="page-hero-card">
            <strong>Pracujete sami za sebe</strong>
            <p>Taskovo je zprostředkovatelská platforma. Tasker není zaměstnancem Taskovo a služby poskytuje samostatně jako OSVČ nebo firma.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-title"><p className="kicker">Realita začátku</p><h2>Nejtěžší není umět pracovat. Nejtěžší je najít zákazníky.</h2></div>
          <div className="trust-grid">
            {pains.map(([title, text]) => <article key={title}><span className="trust-icon">?</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section dark-band">
          <div className="section-title"><p className="kicker">Řešení</p><h2>Taskovo vám dá místo, kde můžete začít</h2><p>Nemusíte hned stavět vlastní web, platit reklamu nebo nahánět zakázky ve skupinách. Začnete profilem, nabídkou a férovou prací.</p></div>
          <div className="trust-grid">
            {benefits.map(([title, text]) => <article key={title}><span className="trust-icon">OK</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section">
          <div className="section-title"><p className="kicker">Cesta taskera</p><h2>Od prvního profilu k opakovaným zákazníkům</h2></div>
          <div className="workflow-grid">
            {journey.map(([step, title, text]) => <article key={step}><span>{step}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Důvěra</p>
            <h2>Reputace je vaše dlouhodobá výhoda</h2>
            <p>Kvalitní profil, jasná nabídka, dobrá komunikace a dokončené úkoly jsou cesta, jak na Taskovo získávat zákazníky opakovaně.</p>
          </div>
          <div className="feature-list">
            <div><strong>Vlastní ceny</strong><span>Navrhujete cenu podle rozsahu práce, času a vlastních zkušeností.</span></div>
            <div><strong>Vlastní rozhodnutí</strong><span>Reagujete jen na úkoly, které chcete a zvládnete dodat.</span></div>
            <div><strong>Vlastní reputace</strong><span>Dobré hodnocení může pomoct při dalších zakázkách.</span></div>
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-heading-row"><div className="section-title"><p className="kicker">FAQ pro taskery</p><h2>Otázky před prvním úkolem</h2></div><a className="button secondary" href="/podminky-pro-poskytovatele">Podmínky pro taskery</a></div>
          <div className="faq-list">
            {faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
