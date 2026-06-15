import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/cookies";

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

const points = [
  { title: "Technické", text: "Nutné cookies pomáhají s přihlášením, formuláři, ochranou účtu a základním fungováním webu." },
  { title: "Analytické", text: "Po souhlasu mohou pomoci pochopit poptávku, konverze a místa, kde uživatelé narážejí na problém." },
  { title: "Marketingové", text: "Marketingové cookies budou použité až po souhlasu a po spuštění placených kampaní." },
  { title: "Správa souhlasu", text: "Uživatel musí mít možnost souhlas upravit nebo odvolat. Cookie banner doplníme před ostrým marketingovým spuštěním." },
];

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title">
          <p className="kicker">Cookies</p>
          <h1 className="page-title">Nastavení cookies</h1>
          <p>Základní přehled kategorií cookies pro Taskovo. Technické cookies jsou nutné pro účet a bezpečnost, ostatní budou řízené souhlasem.</p>
        </section>
        <div className="legal-grid">
          {points.map((point) => (
            <article className="legal-card" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
