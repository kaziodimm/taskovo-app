import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/ochrana-osobnich-udaju";
const privacyEmail = "info@taskovo.cz";

export const metadata: Metadata = {
  title: "Ochrana osobních údajů | Taskovo",
  description: "Přehled toho, jak Taskovo pracuje s účtem, kontaktem, úkoly, nabídkami, platbami, zprávami, recenzemi a právy uživatelů.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Ochrana osobních údajů | Taskovo",
    description: "Soukromí a GDPR přehled pro český marketplace lokálních služeb.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "article",
  },
};

const sections = [
  {
    title: "1. Jaké údaje zpracováváme",
    text: "Zpracováváme údaje potřebné pro vytvoření a správu účtu, zejména jméno, email, telefon, město, roli uživatele, profilové informace, stav ověření a technické údaje související s přihlášením a bezpečností.",
  },
  {
    title: "2. Úkoly, nabídky a komunikace",
    text: "Ukládáme popisy úkolů, kategorie, město, rozpočet, požadovaný čas, přiložené fotografie, nabídky taskerů, cenu, stav objednávky, zprávy a historii důležitých změn. Tyto údaje jsou nutné pro fungování marketplace a řešení případných sporů.",
  },
  {
    title: "3. Právní důvody zpracování",
    text: "Údaje zpracováváme zejména pro plnění služby Taskovo, oprávněný zájem na bezpečnosti platformy, prevenci zneužití, vedení evidence úkolů a komunikace, splnění právních povinností a v některých případech na základě souhlasu.",
  },
  {
    title: "4. Platby a externí služby",
    text: "Platební údaje jsou zpracovány přes platebního partnera. Taskovo může využívat také služby pro hosting, databázi, emailové zprávy, analytiku a bezpečnost. Každý partner má mít přístup jen k údajům potřebným pro daný účel.",
  },
  {
    title: "5. Sdílení mezi klientem a taskerem",
    text: "Po vytvoření nebo přijetí nabídky se mezi klientem a taskerem zobrazují údaje potřebné pro domluvu a provedení úkolu. Veřejně zobrazované profily mohou obsahovat jméno, město, kategorie, bio, hodnocení, stav ověření a schválenou fotografii.",
  },
  {
    title: "6. Doba uložení",
    text: "Údaje uchováváme po dobu používání účtu a poté po přiměřenou dobu potřebnou pro bezpečnost, účetní, právní nebo reklamační účely. Některé údaje mohou být anonymizovány místo úplného odstranění, pokud je to vhodné pro statistiku a ochranu platformy.",
  },
  {
    title: "7. Práva uživatele",
    text: "Uživatel může požádat o přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost, vznést námitku nebo odvolat souhlas tam, kde je zpracování založeno na souhlasu.",
  },
  {
    title: "8. Kontakt pro soukromí",
    text: `Dotazy k osobním údajům, žádosti uživatelů a bezpečnostní hlášení posílejte na ${privacyEmail}.`,
  },
];

const privacyJsonLd = {
  "@context": "https://schema.org",
  "@type": "PrivacyPolicy",
  name: "Ochrana osobních údajů Taskovo",
  url: pageUrl,
  publisher: { "@type": "Organization", name: "Taskovo", url: "https://taskovo.cz" },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }} />
        <section className="section-title">
          <p className="kicker">Soukromí</p>
          <h1 className="page-title">Ochrana osobních údajů</h1>
          <p>Tato stránka vysvětluje, jak Taskovo pracuje s osobními údaji klientů, taskerů a návštěvníků webu.</p>
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
