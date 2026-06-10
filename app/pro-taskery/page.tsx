import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const benefits = [
  ["Úkoly podle lokality", "Tasker může hledat práci ve městě nebo okolí, kde se skutečně pohybuje."],
  ["Vlastní nabídka", "Cena, termín a rozsah práce jsou na taskerovi. Klient si nabídku může porovnat s ostatními."],
  ["Reputace v profilu", "Recenze, ověření, dokončené úkoly a kvalitní profil pomáhají získat další zakázky."],
  ["Postupné ověřování", "Ruční schválení profilu, fotografie, později IČO, identita a bankovní účet pro výplaty."],
];

const checklist = [
  "Vyplnit reálné jméno, město a kontaktní údaje.",
  "Popsat služby, které opravdu umíte dodat.",
  "Nahrát profesionální profilovou fotku ke schválení.",
  "Uvést dostupnost, orientační ceny a pracovní omezení.",
  "Reagovat jen na úkoly, které zvládnete v daném čase.",
];

const rules = [
  "Tasker není zaměstnancem Taskovo.",
  "Tasker odpovídá za kvalitu, oprávnění, daně a pojištění své činnosti.",
  "Taskovo může moderovat profily, nevhodný obsah, rizikové úkoly a porušení pravidel.",
  "Klient si taskera vybírá samostatně podle nabídky, profilu a hodnocení.",
];

export default function TaskersPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Pro taskery</p>
            <h1 className="page-title">Získejte lokální zakázky bez chaotického hledání</h1>
            <p className="hero-lead">Taskovo je pro šikovné lidi, OSVČ a malé firmy, které chtějí přijímat praktické úkoly v okolí. Vy rozhodujete, na co pošlete nabídku.</p>
            <div className="hero-actions"><a className="button primary" href="/registrace-poskytovatel">Vytvořit profil</a><a className="button secondary" href="/tasks">Prohlédnout úkoly</a></div>
          </div>
          <div className="page-hero-card">
            <strong>Nezávislá práce</strong>
            <p>Taskovo nezakládá pracovní poměr. Platforma propojuje poptávku a nabídku, ale službu poskytuje vybraný tasker.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Výhody</p><h2>Co má tasker v platformě získat</h2></div></div>
          <div className="trust-grid">
            {benefits.map(([title, text]) => <article key={title}><span className="trust-icon">TV</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Profil</p>
            <h2>Co potřebuje kvalitní tasker profil</h2>
            <p>Silný profil snižuje nedůvěru klienta. U pilotu bude část věcí kontrolovaná ručně administrátorem, včetně fotografie.</p>
          </div>
          <div className="feature-list">
            {checklist.map((item) => <div key={item}><strong>{item}</strong><span>Pomáhá to klientovi rychle rozhodnout, jestli je tasker vhodný pro daný úkol.</span></div>)}
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row"><div><p className="kicker">Pravidla</p><h2>Transparentní vztah k platformě</h2></div><a className="button secondary" href="/podminky-pro-poskytovatele">Podmínky pro taskery</a></div>
          <div className="legal-grid">
            {rules.map((rule) => <article className="legal-card" key={rule}><h3>{rule}</h3><p>Tyto formulace chrání klienta, taskera i platformu při pilotním provozu a pozdějším napojení plateb.</p></article>)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
