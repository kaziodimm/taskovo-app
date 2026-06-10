import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Kontakt | Taskovo",
  description:
    "Kontakt na podporu Taskovo pro klienty, taskery, overeni profilu, bezpecnost, pilotni spolupraci a zpetnou vazbu.",
  alternates: { canonical: "/kontakt" },
  openGraph: {
    title: "Kontakt | Taskovo",
    description: "Podpora pro pilot ceskeho marketplace Taskovo.",
    url: "https://taskovo-app.vercel.app/kontakt",
    siteName: "Taskovo",
    type: "website",
  },
};

const contactReasons = [
  ["Podpora klienta", "Pomoc se zadáním úkolu, úpravou, zrušením nebo problémem po dokončení."],
  ["Ověření taskera", "Dotazy k profilu, fotografii, IČO, službám, viditelnosti a schvalování."],
  ["Bezpečnost", "Nahlášení nevhodného úkolu, profilu, zprávy nebo podezřelého chování."],
  ["Spolupráce", "Pilotní města, lokální partneři, marketing, komunity a první skupiny taskerů."],
];

export default function ContactPage() {
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakt Taskovo",
    url: "https://taskovo-app.vercel.app/kontakt",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "hello@taskovo.cz",
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
            <h1 className="page-title">Podpora pro pilot Taskovo</h1>
            <p className="hero-lead">V první fázi bude kontakt sloužit pro ruční schvalování taskerů, podporu klientů, bezpečnostní hlášení a sběr zpětné vazby.</p>
          </div>
          <div className="page-hero-card">
            <strong>hello@taskovo.cz</strong>
            <p>Po koupi domény připojíme ostrý email a později i Resend pro systémové zprávy.</p>
          </div>
        </section>

        <section className="split">
          <div className="feature-list">
            {contactReasons.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
          </div>
          <form className="search-panel">
            <div className="card-heading"><h2>Napište nám</h2><p className="fine-print">Formulář je zatím prezentační. Po napojení emailů bude odesílat zprávy do podpory.</p></div>
            <label>Jméno<input placeholder="Jan Novák" /></label>
            <label>Email<input placeholder="jan@email.cz" /></label>
            <label>Důvod<select defaultValue=""><option value="" disabled>Vyberte téma</option><option>Podpora klienta</option><option>Ověření taskera</option><option>Bezpečnost</option><option>Spolupráce</option></select></label>
            <label>Zpráva<textarea rows={5} placeholder="Popište situaci..." /></label>
            <button className="button primary" type="button">Odeslat zprávu</button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
