import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/ochrana-osobnich-udaju";

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

const points = [
  { title: "Účet a kontakt", text: "Zpracováváme údaje potřebné pro účet, komunikaci, město, roli uživatele a bezpečné přihlášení." },
  { title: "Úkoly a nabídky", text: "Ukládáme popisy úkolů, fotky, nabídky, ceny, stav poptávky a historii komunikace." },
  { title: "Platby", text: "Platební data budou zpracována přes poskytovatele plateb, například Stripe, podle jeho bezpečnostních pravidel." },
  { title: "Práva uživatele", text: "Uživatel může požádat o přístup, opravu, výmaz, omezení zpracování nebo vznést námitku." },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title">
          <p className="kicker">Soukromí</p>
          <h1 className="page-title">Ochrana osobních údajů</h1>
          <p>Stránka shrnuje hlavní oblasti zpracování osobních údajů na Taskovo. Finální právní text bude doplněn před ostrým spuštěním.</p>
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
