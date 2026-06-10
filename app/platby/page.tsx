import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const paymentSteps = [
  ["01", "Klient vybere nabídku", "Po porovnání taskerů klient potvrdí konkrétní nabídku, cenu a domluvený rozsah úkolu."],
  ["02", "Platba se rezervuje", "V budoucí fázi Stripe platbu bezpečně zadrží do dokončení nebo vyřešení problému."],
  ["03", "Tasker dokončí práci", "Tasker označí úkol jako hotový a klient dostane možnost výsledek potvrdit nebo otevřít spor."],
  ["04", "Proběhne výplata", "Po potvrzení systém připraví výplatu taskerovi a zaúčtuje provizi platformy."],
];

const principles = [
  "Cena musí být jasná před potvrzením nabídky.",
  "Taskovo nemá skrývat poplatky ani nutit klienta k nejasné platbě.",
  "U sporu musí být vidět úkol, nabídka, komunikace a důvod problému.",
  "Stripe přidáme až po dokončení základního workflow webu.",
];

export default function PaymentsPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Platby</p>
            <h1 className="page-title">Bezpečný platební model pro marketplace</h1>
            <p className="hero-lead">Platby budeme přidávat postupně přes Stripe. Nejdříve musí být stabilní zadání úkolu, nabídky, výběr taskera, dokončení, spory a administrace.</p>
          </div>
          <div className="page-hero-card">
            <strong>Stripe později</strong>
            <p>Teď stránka popisuje cílový model. Ostré platby zapojíme až po dokončení základní pracovní verze a testování flow.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Platební flow</p><h2>Jak má platba fungovat</h2></div></div>
          <div className="workflow-grid">
            {paymentSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Principy</p>
            <h2>Co musí být jasné před spuštěním plateb</h2>
            <p>U služeb mezi lidmi je platební systém zároveň důvěra, pravidla a ochrana proti nedorozumění. Proto ho nedáváme předčasně.</p>
          </div>
          <div className="feature-list">
            {principles.map((item) => <div key={item}><strong>{item}</strong><span>Součást budoucího napojení Stripe, administrace a emailových notifikací.</span></div>)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
