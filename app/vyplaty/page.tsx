import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const payoutBlocks = [
  ["Ověření účtu", "Tasker bude muset doplnit identitu, typ podnikání a později bankovní údaje přes Stripe Connect."],
  ["Historie výplat", "Každá výplata má být propojená s konkrétním úkolem, cenou, provizí, datem a stavem."],
  ["Provize platformy", "Taskovo bude transparentně ukazovat, kolik z částky tvoří provize a kolik jde taskerovi."],
  ["Zadržené platby", "U sporu nebo bezpečnostní kontroly může být výplata pozastavená do rozhodnutí administrátora."],
  ["Daňové podklady", "Tasker zůstává nezávislý a řeší své daňové povinnosti. Platforma mu může připravit exporty."],
  ["Stav profilu", "Ověření, recenze a porušení pravidel mohou ovlivnit dostupnost výplat i viditelnost profilu."],
];

export default function PayoutsPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Výplaty</p>
            <h1 className="page-title">Výplaty pro taskery a malé firmy</h1>
            <p className="hero-lead">Tato stránka popisuje cílový model výplat po napojení Stripe Connect. Do té doby držíme platební část oddělenou od základního marketplace workflow.</p>
          </div>
          <div className="page-hero-card">
            <strong>Nezávislí poskytovatelé</strong>
            <p>Tasker není zaměstnanec Taskovo. Výplaty budou řešené jako platby nezávislým osobám, OSVČ nebo firmám.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Model</p><h2>Co bude stránka výplat obsahovat</h2></div></div>
          <div className="dashboard-grid">
            {payoutBlocks.map(([title, text]) => <article className="dashboard-panel" key={title}><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Před spuštěním</p>
            <h2>Co musí být připravené</h2>
            <p>Výplaty navazují na dokončení úkolu, potvrzení klienta, řešení sporů, provizi a ověřený profil taskera. Proto je budeme přidávat po dokončení jádra aplikace.</p>
          </div>
          <div className="request-card">
            <h3>Další krok pro platby</h3>
            <p className="fine-print">Až bude web funkčně stabilní, nastavíme Stripe účet, testovací režim, Connect onboarding, webhooky a notifikace.</p>
            <div className="section-action"><a className="button secondary" href="/platby">Zobrazit platební model</a></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
