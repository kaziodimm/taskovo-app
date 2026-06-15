import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { faqs } from "@/lib/marketplace-data";

const pageUrl = "https://taskovo.cz/faq";

export const metadata: Metadata = {
  title: "FAQ | Taskovo",
  description:
    "Odpovědi na časté otázky ke klientům, taskerům, ověření, platbám, bezpečnosti a roli platformy Taskovo.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | Taskovo",
    description: "Časté otázky k českému marketplace pro lokální úkoly a služby.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ | Taskovo",
    description: "Časté otázky k českému marketplace pro lokální úkoly a služby.",
  },
};

const extraFaqs = [
  {
    question: "Kdo odpovídá za kvalitu služby?",
    answer: "Za provedení služby odpovídá vybraný tasker. Taskovo pomáhá s profily, recenzemi, komunikací, moderací a platbou, ale samotnou službu přímo neposkytuje.",
  },
  {
    question: "Může klient upravit nebo zrušit úkol?",
    answer: "Ano, dokud ještě není vybraný tasker. Po výběru taskera je potřeba řešit změnu přes komunikaci nebo podporu, aby byla chráněná obě strany.",
  },
  {
    question: "Jak funguje bezpečná platba?",
    answer: "Platby jsou zpracovány přes platebního partnera. Cílem je rezervace platby, potvrzení dokončení, možnost sporu a výplata taskerovi po odečtení provize platformy.",
  },
  {
    question: "Musí být tasker OSVČ?",
    answer: "U pravidelného poskytování služeb je vhodné, aby tasker vystupoval jako OSVČ nebo firma a řešil své daňové a profesní povinnosti. Taskovo ho nezaměstnává.",
  },
  {
    question: "Jak se ověřuje profil?",
    answer: "Profil může projít kontrolou základních údajů, fotografie, identity, IČO, výplatních údajů a specializovaných oprávnění pro vybrané služby.",
  },
  {
    question: "Proč nepoužít jen sociální sítě nebo Telegram skupiny?",
    answer: "Skupiny fungují pro rychlé hledání, ale chybí jim struktura, filtry, profily, recenze, historie, moderace a bezpečné platby. Taskovo tyto věci spojuje do jednoho místa.",
  },
];

export default function FaqPage() {
  const allFaqs = [...faqs, ...extraFaqs];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <Header />
      <main className="page-shell faq-section">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <section className="section-title">
          <p className="kicker">FAQ</p>
          <h1 className="page-title">Časté otázky k Taskovo</h1>
          <p>Krátké odpovědi pro klienty, taskery, platby, ověřování, bezpečnost a roli zprostředkovatelské platformy.</p>
        </section>

        <div className="faq-list">
          {allFaqs.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Stále nejasné?</p>
            <h2>Napište nám konkrétní situaci</h2>
            <p>U služeb v domácnosti, stěhování, doručení nebo specializovaných prací může záležet na detailech. Podpora pomůže určit správný postup.</p>
          </div>
          <div className="request-card">
            <h3>Potřebujete pomoc?</h3>
            <p className="fine-print">Kontaktujte Taskovo kvůli bezpečnosti, ověření, sporům, profilu nebo spolupráci.</p>
            <div className="section-action"><a className="button primary" href="/kontakt">Kontaktovat podporu</a></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
