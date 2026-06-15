import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/obchodni-podminky";

export const metadata: Metadata = {
  title: "Obchodní podmínky | Taskovo",
  description: "Základní pravidla platformy Taskovo: role zprostředkovatele, výběr taskera, odpovědnost za službu, platby a řešení sporů.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Obchodní podmínky | Taskovo",
    description: "Pravidla používání českého marketplace pro lokální služby.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "article",
  },
};

const points = [
  { title: "Role platformy", text: "Taskovo zprostředkovává poptávky, nabídky, komunikaci a budoucí platební tok mezi klientem a nezávislým taskerem." },
  { title: "Výběr taskera", text: "Klient sám porovnává nabídky, profily, cenu, dostupnost a recenze. Taskovo konkrétního taskera klientovi neurčuje." },
  { title: "Odpovědnost za službu", text: "Tasker odpovídá za kvalitu práce, oprávnění, daně, bezpečnost provedení a splnění zákonných povinností." },
  { title: "Spory a reklamace", text: "Platforma může pomoci s komunikací a evidencí sporu, ale není automaticky dodavatelem konkrétní služby." },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title">
          <p className="kicker">Legal</p>
          <h1 className="page-title">Obchodní podmínky</h1>
          <p>Stránka popisuje základní pravidla fungování platformy. Před ostrým spuštěním bude finální znění ještě ověřené českým právníkem.</p>
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
