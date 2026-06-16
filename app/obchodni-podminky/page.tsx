import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/obchodni-podminky";
const supportEmail = "info@taskovo.cz";

export const metadata: Metadata = {
  title: "Obchodní podmínky | Taskovo",
  description: "Pravidla platformy Taskovo: role zprostředkovatele, výběr taskera, odpovědnost za službu, platby, bezpečnost, zrušení úkolu a řešení sporů.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Obchodní podmínky | Taskovo",
    description: "Pravidla používání českého marketplace pro lokální služby.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "article",
  },
};

const sections = [
  {
    title: "1. Role platformy",
    text: "Taskovo je zprostředkovatelská platforma. Pomáhá klientům zveřejnit poptávku, porovnat nabídky, komunikovat s taskery a spravovat průběh úkolu. Taskovo samo přímo neposkytuje lokální službu, není dodavatelem konkrétní práce a není zaměstnavatelem taskerů.",
  },
  {
    title: "2. Klient a výběr taskera",
    text: "Klient samostatně rozhoduje, kterého taskera si vybere. Při výběru může zohlednit cenu, dostupnost, popis nabídky, ověření profilu, zkušenosti, komunikaci a recenze. Taskovo může zvýraznit ověřené nebo kvalitní profily, ale konečný výběr provádí klient.",
  },
  {
    title: "3. Tasker jako nezávislá osoba",
    text: "Tasker vystupuje jako nezávislá osoba, OSVČ nebo firma. Odpovídá za pravdivost profilu, oprávnění k poskytování služby, kvalitu provedení, bezpečnost práce, daňové a jiné zákonné povinnosti. Taskovo taskerovi neurčuje pracovní dobu ani způsob provedení mimo pravidla platformy.",
  },
  {
    title: "4. Zadání úkolu a nabídky",
    text: "Klient zadává popis, místo, očekávaný termín, rozpočet a případné fotografie. Tasker posílá nabídku s cenou a zprávou. Úkol ani nabídka nesmí obsahovat nelegální, nebezpečný, diskriminační nebo jinak nevhodný obsah.",
  },
  {
    title: "5. Platby a výplaty",
    text: "Platby jsou zpracovány přes platebního partnera. Přesné platební podmínky, poplatky a okamžik uvolnění výplaty se zobrazí před potvrzením objednávky nebo nabídky. Výplata taskerovi se uvolní po potvrzení dokončení, případně podle výsledku řešení sporu.",
  },
  {
    title: "6. Zrušení a změny úkolu",
    text: "Klient může upravit nebo zrušit vlastní úkol podle jeho aktuálního stavu. Pokud už byla přijata nabídka nebo probíhá práce, může být zrušení omezené pravidly platformy, platebního partnera nebo dohodou mezi klientem a taskerem.",
  },
  {
    title: "7. Spory a bezpečnost",
    text: "Taskovo může pomoci s evidencí komunikace, stavu úkolu, důvodu zrušení a podkladů ke sporu. Platforma může omezit účet, skrýt obsah, odmítnout profil nebo odstranit úkol, pokud porušuje pravidla nebo ohrožuje uživatele.",
  },
  {
    title: "8. Recenze a obsah uživatelů",
    text: "Recenze, fotografie, zprávy a profily musí být pravdivé, věcné a nesmí porušovat práva jiných osob. Taskovo může moderovat veřejně zobrazovaný obsah, zejména profilové fotografie, nevhodné texty a bezpečnostní hlášení.",
  },
  {
    title: "9. Kontakt",
    text: `Dotazy k pravidlům, účtu, bezpečnosti nebo sporu posílejte na ${supportEmail}. Uživatel by měl přiložit odkaz na úkol, stručný popis situace a relevantní podklady.`,
  },
];

const legalJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Obchodní podmínky Taskovo",
  url: pageUrl,
  description: metadata.description,
  about: {
    "@type": "Service",
    name: "Taskovo",
    serviceType: "Online marketplace for local services",
    areaServed: "CZ",
  },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(legalJsonLd) }} />
        <section className="section-title">
          <p className="kicker">Legal</p>
          <h1 className="page-title">Obchodní podmínky</h1>
          <p>Tyto podmínky popisují základní pravidla používání Taskovo jako zprostředkovatelské platformy pro lokální služby v České republice.</p>
        </section>
        <div className="legal-grid">
          {sections.map((section) => (
            <article className="legal-card" key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
