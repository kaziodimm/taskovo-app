import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { faqs } from "@/lib/marketplace-data";

const extraFaqs = [
  {
    question: "Kdo odpovídá za kvalitu služby?",
    answer: "Za provedení služby odpovídá vybraný tasker. Taskovo pomáhá s profily, recenzemi, komunikací, moderací a později s platbou, ale samotnou službu přímo neposkytuje.",
  },
  {
    question: "Může klient upravit nebo zrušit úkol?",
    answer: "Ano, dokud ještě není vybraný tasker. Po výběru taskera je potřeba řešit změnu přes komunikaci nebo podporu, aby byla chráněná obě strany.",
  },
  {
    question: "Jak bude fungovat bezpečná platba?",
    answer: "V pilotní fázi připravujeme Stripe. Cílem je rezervace platby, potvrzení dokončení, možnost sporu a výplata taskerovi po odečtení provize platformy.",
  },
  {
    question: "Musí být tasker OSVČ?",
    answer: "U pravidelného poskytování služeb bude vhodné, aby tasker vystupoval jako OSVČ nebo firma a řešil své daňové a profesní povinnosti. Taskovo ho nezaměstnává.",
  },
  {
    question: "Jak se bude ověřovat profil?",
    answer: "Nejdříve ruční kontrolou profilu, fotky a základních údajů. Později je možné přidat kontrolu identity, IČO, bankovního účtu a specializovaných oprávnění pro vybrané služby.",
  },
  {
    question: "Proč nepoužít jen sociální sítě nebo Telegram skupiny?",
    answer: "Skupiny fungují pro rychlé hledání, ale chybí jim struktura, filtry, profily, recenze, historie, moderace a bezpečné platby. Taskovo má tyto věci spojit do jednoho místa.",
  },
];

export default function FaqPage() {
  const allFaqs = [...faqs, ...extraFaqs];

  return (
    <>
      <Header />
      <main className="page-shell faq-section">
        <section className="section-title">
          <p className="kicker">FAQ</p>
          <h1 className="page-title">Časté otázky k Taskovo</h1>
          <p>Krátké odpovědi pro klienty, taskery i pilotní provoz. Právní a platební detaily budeme zpřesňovat při napojení Stripe, ověřování a produkčních podmínek.</p>
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
            <p className="fine-print">Kontaktujte Taskovo kvůli bezpečnosti, ověření, sporům, profilu nebo pilotní spolupráci.</p>
            <div className="section-action"><a className="button primary" href="/kontakt">Kontaktovat podporu</a></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
