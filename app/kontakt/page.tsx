import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const contactReasons = [
  ["Podpora klienta", "Pomoc se zadáním úkolu, úpravou, zrušením nebo problémem po dokončení."],
  ["Ověření taskera", "Dotazy k profilu, fotografii, IČO, službám, viditelnosti a schvalování."],
  ["Bezpečnost", "Nahlášení nevhodného úkolu, profilu, zprávy nebo podezřelého chování."],
  ["Spolupráce", "Pilotní města, lokální partneři, marketing, komunity a první skupiny taskerů."],
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Kontakt</p>
            <h1 className="page-title">Podpora pro pilot Taskovo</h1>
            <p className="hero-lead">V první fázi bude kontakt sloužit pro ruční schvalování taskerů, podporu klientů, bezpečnostní hlášení a sběr zpětné vazby.</p>
          </div>
          <div className="page-hero-card">
            <strong>hello@taskovo.cz</strong>
            <p>Po koupi domény připojíme ostrý email a později i Resend pro systémové zprávy.</p>
          </div>
        </section>

        <section className="split">
          <div className="feature-list">
            {contactReasons.map(([title, text]) => <div key={title}><strong>{title}</strong><span>{text}</span></div>)}
          </div>
          <form className="search-panel">
            <div className="card-heading"><h2>Napište nám</h2><p className="fine-print">Formulář je zatím prezentační. Po napojení emailů bude odesílat zprávy do podpory.</p></div>
            <label>Jméno<input placeholder="Jan Novák" /></label>
            <label>Email<input placeholder="jan@email.cz" /></label>
            <label>Důvod<select defaultValue=""><option value="" disabled>Vyberte téma</option><option>Podpora klienta</option><option>Ověření taskera</option><option>Bezpečnost</option><option>Spolupráce</option></select></label>
            <label>Zpráva<textarea rows={5} placeholder="Popište situaci..." /></label>
            <button className="button primary" type="button">Odeslat zprávu</button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
