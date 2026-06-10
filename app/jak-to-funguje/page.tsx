import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const clientSteps = [
  ["01", "Zadáte úkol", "Popíšete, co potřebujete, kde, kdy a jaký máte rozpočet. Čím přesnější zadání, tím lepší nabídky dostanete."],
  ["02", "Porovnáte nabídky", "Tasker pošle cenu, termín a krátkou zprávu. Vy vidíte profil, ověření, zkušenosti a historii komunikace."],
  ["03", "Vyberete taskera", "Rozhodnutí je vždy na klientovi. Taskovo pouze zprostředkuje kontakt a nástroje pro bezpečnější průběh."],
  ["04", "Potvrdíte výsledek", "Po dokončení úkolu přidáte recenzi. V další fázi zde bude také bezpečná platba a řešení sporů."],
];

const taskerSteps = [
  ["01", "Vytvoříte profil", "Vyplníte město, služby, zkušenosti, dostupnost a kontaktní údaje. Profil může projít ruční kontrolou."],
  ["02", "Najdete úkoly", "Tasker vidí otevřené úkoly podle lokality, kategorie, rozpočtu a času. Nabídky posílá jen tam, kde má reálnou kapacitu."],
  ["03", "Pošlete nabídku", "Cena, termín a rozsah práce musí být jasné. Klient si taskera vybírá samostatně."],
  ["04", "Budujete reputaci", "Dokončené úkoly, recenze a ověření zvyšují důvěru i šanci získat další práci."],
];

const platformRules = [
  "Taskovo je zprostředkovatelská platforma, ne zaměstnavatel taskerů.",
  "Taskeři vystupují jako nezávislé osoby, OSVČ nebo firmy.",
  "Klient si taskera vybírá samostatně podle nabídky, profilu a hodnocení.",
  "Taskovo samo službu přímo neposkytuje a neurčuje způsob provedení práce.",
];

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Jak to funguje</p>
            <h1 className="page-title">Jednoduchý postup pro klienty i taskery</h1>
            <p className="hero-lead">Taskovo propojuje lidi, kteří potřebují pomoc, s lidmi v okolí, kteří ji umí nabídnout. Bez chaotického hledání ve skupinách a bez nutnosti ptát se známých.</p>
          </div>
          <div className="page-hero-card">
            <strong>Marketplace, ne agentura</strong>
            <p>Platforma pomáhá s poptávkou, nabídkami, komunikací, důvěrou a později platbami. Samotnou službu poskytuje vybraný tasker.</p>
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row">
            <div>
              <p className="kicker">Pro zákazníky</p>
              <h2>Od nápadu k hotovému úkolu</h2>
            </div>
            <a className="button secondary" href="/zadat-ukol">Zadat úkol</a>
          </div>
          <div className="workflow-grid">
            {clientSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section">
          <div className="section-heading-row">
            <div>
              <p className="kicker">Pro taskery</p>
              <h2>Jak získávat práci přes Taskovo</h2>
            </div>
            <a className="button secondary" href="/registrace-poskytovatel">Vytvořit profil</a>
          </div>
          <div className="workflow-grid">
            {taskerSteps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Role platformy</p>
            <h2>Jasná pravidla od začátku</h2>
            <p>U marketplace služeb je důležité oddělit platformu, klienta a nezávislého poskytovatele. Tato pravidla budou později propsaná i do plateb, podmínek a komunikace.</p>
          </div>
          <div className="feature-list">
            {platformRules.map((rule) => <div key={rule}><strong>{rule}</strong><span>Transparentní formulace pro důvěru, podporu a právní čistotu pilotu.</span></div>)}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
