import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/cookies";
const supportEmail = "info@taskovo.cz";

export const metadata: Metadata = {
  title: "Cookies | Taskovo",
  description: "Přehled cookies na Taskovo: technické cookies pro přihlášení a bezpečnost, analytika, marketing a správa souhlasu.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Cookies | Taskovo",
    description: "Informace o cookies a správě souhlasu na Taskovo.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "article",
  },
};

const sections = [
  {
    title: "Technické cookies",
    text: "Technické cookies jsou nutné pro fungování webu, přihlášení, ochranu účtu, bezpečnost formulářů, zapamatování relace a základní provoz marketplace. Tyto cookies nevyžadují samostatný marketingový souhlas.",
  },
  {
    title: "Preferenční cookies",
    text: "Preferenční cookies mohou pomoci zapamatovat nastavení uživatele, například jazyk, vybraný režim nebo stav rozhraní. Používají se jen v rozsahu potřebném pro lepší používání služby.",
  },
  {
    title: "Analytické cookies",
    text: "Analytické cookies pomáhají pochopit návštěvnost, výkon stránek, konverze a místa, kde uživatelé narážejí na problém. Pokud nejsou technicky nezbytné, používají se až po souhlasu uživatele.",
  },
  {
    title: "Marketingové cookies",
    text: "Marketingové cookies mohou být použité pro měření kampaní, remarketing a relevantnější reklamu. Používají se pouze na základě souhlasu a uživatel je může odmítnout bez ztráty přístupu k základním funkcím webu.",
  },
  {
    title: "Správa souhlasu",
    text: "Uživatel může souhlas upravit nebo odvolat v nastavení cookies, jakmile jsou nasazeny cookies vyžadující souhlas. Souhlas není nutný pro technické cookies potřebné k fungování služby.",
  },
  {
    title: "Kontakt",
    text: `Dotazy ke cookies a soukromí posílejte na ${supportEmail}.`,
  },
];

const cookiesJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Cookies Taskovo",
  url: pageUrl,
  description: metadata.description,
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(cookiesJsonLd) }} />
        <section className="section-title">
          <p className="kicker">Cookies</p>
          <h1 className="page-title">Cookies a nastavení souhlasu</h1>
          <p>Taskovo používá cookies a podobné technologie pro provoz webu, bezpečnost účtu, měření výkonu a případně marketing. Nezbytné cookies pomáhají službě fungovat, ostatní kategorie se řídí souhlasem.</p>
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
