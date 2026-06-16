import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/kontakt";
const supportEmail = "info@taskovo.cz";

export const metadata: Metadata = {
  title: "Kontakt | Taskovo",
  description:
    "Kontakt na podporu Taskovo pro klienty, taskery, ověření profilu, bezpečnost, spolupráci a zpětnou vazbu.",
  alternates: { canonical: "/kontakt" },
  openGraph: {
    title: "Kontakt | Taskovo",
    description: "Podpora pro český marketplace Taskovo.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontakt | Taskovo",
    description: "Podpora pro český marketplace Taskovo.",
  },
};

const contactReasons = [
  ["Podpora klienta", "Pomoc se zadáním úkolu, úpravou, zrušením nebo problémem po dokončení."],
  ["Ověření taskera", "Dotazy k profilu, fotografii, IČO, službám, viditelnosti a schvalování."],
  ["Bezpečnost", "Nahlášení nevhodného úkolu, profilu, zprávy nebo podezřelého chování."],
  ["Spolupráce", "Lokální partneři, města, komunity, marketing a skupiny prvních taskerů."],
];

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakt Taskovo",
    url: pageUrl,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: supportEmail,
      availableLanguage: ["cs", "ru", "uk"],
    },
  };

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />
        <section className="page-hero">
          <div>
            <p className="kicker">Kontakt</p>
            <h1 className="page-title">Podpora Taskovo</h1>
            <p className="hero-lead">Kontakt slouží pro podporu klientů, ruční schvalování taskerů, bezpečnostní hlášení, spolupráci a zpětnou vazbu k marketplace.</p>
          </div>
          <div className="page-hero-card">
            <strong>{supportEmail}</strong>
            <p>Pro otázky k účtu, úkolům, taskerům, bezpečnosti nebo spolupráci pište na oficiální email Taskovo.</p>
          </div>
        </section>

        <section className="split">
          <div className="feature-list">
            {contactReasons.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
          </div>
          <form className="search-panel">
            <div className="card-heading"><h2>Napište nám</h2><p className="fine-print">Formulář připraví zprávu ve vašem emailovém klientu. Do zprávy prosím nevkládejte citlivé údaje, které nejsou nutné pro vyřešení dotazu.</p></div>
            <label>Jméno<input name="name" placeholder="Jan Novák" /></label>
            <label>Email<input name="email" placeholder="jan@email.cz" /></label>
            <label>Důvod<select name="topic" defaultValue=""><option value="" disabled>Vyberte téma</option><option>Podpora klienta</option><option>Ověření taskera</option><option>Bezpečnost</option><option>Spolupráce</option></select></label>
            <label>Zpráva<textarea name="message" rows={5} placeholder="Popište situaci..." /></label>
            <a className="button primary" href={`mailto:${supportEmail}?subject=Taskovo podpora`}>Odeslat přes email</a>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
