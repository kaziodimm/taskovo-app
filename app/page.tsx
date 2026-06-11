import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { faqs, marketplaceCategories, trustBadges } from "@/lib/marketplace-data";

const workflow = [
  ["01", "Zadáte úkol", "Popíšete, co potřebujete, kde, kdy a jaký máte rozpočet."],
  ["02", "Dostanete nabídky", "Taskeři pošlou cenu, zprávu a dostupnost. Vy si je v klidu porovnáte."],
  ["03", "Vyberete člověka", "Klient si nezávisle vybere taskera podle profilu, ceny a domluvy."],
  ["04", "Potvrdíte hotovo", "Po dokončení uzavřete objednávku a přidáte hodnocení."],
];

const quickCategories = marketplaceCategories.slice(0, 5);
const popularCategories = marketplaceCategories.slice(0, 6);
const previewFaqs = faqs.slice(0, 3);

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero marketplace-hero">
          <div className="hero-image" aria-hidden="true">
            <img src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1800" alt="" />
          </div>
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-inner hero-market-grid">
            <div className="hero-copy">
              <p className="kicker">Český marketplace služeb</p>
              <h1>Pomoc v okolí, když ji opravdu potřebujete</h1>
              <p className="hero-lead">
                Úklid, stěhování, montáž nábytku, doručení i drobné práce. Zadáte úkol, porovnáte nabídky a sami vyberete nezávislého taskera.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="/zadat-ukol">Zadat úkol</a>
                <a className="button secondary" href="/poskytovatele">Najít taskera</a>
              </div>
              <div className="trust-row" aria-label="Důvody důvěry">
                {trustBadges.slice(0, 3).map((badge) => <span key={badge}>{badge}</span>)}
              </div>
            </div>

            <form className="search-panel hero-search-panel" action="/kategorie">
              <p className="kicker">Rychlé hledání</p>
              <label>Co potřebujete?<input name="q" placeholder="Úklid, kurýr, montáž..." /></label>
              <label>Kde?<input name="city" placeholder="Praha, Brno, Olomouc..." /></label>
              <button className="button primary" type="submit">Najít pomoc</button>
              <div className="chip-row" aria-label="Rychlé kategorie">
                {quickCategories.map((category) => (
                  <a key={category.slug} href={`/kategorie/${category.slug}`}><span>{category.shortTitle}</span></a>
                ))}
              </div>
            </form>
          </div>
        </section>

        <section className="signal-bar" aria-label="Důvěryhodnost Taskovo">
          <div><strong>0 Kč</strong><span>za zadání úkolu</span></div>
          <div><strong>4 kroky</strong><span>od poptávky po hotovo</span></div>
          <div><strong>OSVČ</strong><span>a firmy jako nezávislí taskeři</span></div>
          <div><strong>Recenze</strong><span>po každém dokončeném úkolu</span></div>
        </section>

        <section className="section" id="kategorie">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Populární kategorie</p>
              <h2>Začněte službou, kterou potřebujete vyřešit</h2>
              <p>Taskovo se soustředí na lokální úkoly, které lidé běžně řeší přes známé, chaty nebo náhodné skupiny.</p>
            </div>
            <a className="button secondary" href="/kategorie">Všechny kategorie</a>
          </div>
          <div className="category-grid">
            {popularCategories.map((category) => <CategoryCard key={category.slug} category={category} />)}
          </div>
        </section>

        <section className="section dark-band" id="jak-to-funguje">
          <div className="section-title">
            <p className="kicker">Jak to funguje</p>
            <h2>Jednoduchý postup bez dlouhého hledání</h2>
          </div>
          <div className="workflow-grid">
            {workflow.map(([step, title, text]) => (
              <article key={step}>
                <span>{step}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section trust-preview" id="bezpecnost">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Důvěra a bezpečnost</p>
              <h2>Marketplace musí být přehledný, ověřitelný a férový</h2>
              <p>Taskovo je zprostředkovatelská platforma. Taskeři nejsou zaměstnanci Taskovo a klient si taskera vybírá samostatně.</p>
            </div>
            <a className="button secondary" href="/bezpecnost">Více o bezpečnosti</a>
          </div>
          <div className="trust-grid">
            <article><span className="trust-icon">ID</span><h3>Ověřená totožnost</h3><p>Profily, kontakty a v další fázi doklady nebo IČO podle typu služby.</p></article>
            <article><span className="trust-icon">Kč</span><h3>Bezpečná platba</h3><p>Platby a výplaty budou napojené až po dokončení pilotní logiky.</p></article>
            <article><span className="trust-icon">OK</span><h3>Recenze po úkolu</h3><p>Hodnocení pomůže rozlišit spolehlivé taskery od nových profilů.</p></article>
          </div>
        </section>

        <section className="section split" id="pro-zakazniky">
          <article className="request-card">
            <p className="kicker">Pro zákazníky</p>
            <h2>Zadejte práci a vyberte si nabídku</h2>
            <p>Vhodné pro lidi, kteří nemají čas, auto, nářadí nebo jednoduše nechtějí řešit drobné úkoly sami.</p>
            <div className="section-action"><a className="button primary" href="/zadat-ukol">Zadat nový úkol</a></div>
          </article>
          <article className="request-card" id="pro-taskery">
            <p className="kicker">Pro taskery</p>
            <h2>Získejte lokální zakázky bez chaosu ve skupinách</h2>
            <p>Taskovo má postupně nabídnout profil, poptávky, nabídky, historii práce, hodnocení a později i výplaty.</p>
            <div className="section-action"><a className="button secondary" href="/registrace-poskytovatel">Registrovat se jako tasker</a></div>
          </article>
        </section>

        <section className="section faq-section" id="faq">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">FAQ</p>
              <h2>Krátké odpovědi před prvním úkolem</h2>
            </div>
            <a className="button secondary" href="/faq">Všechny otázky</a>
          </div>
          <div className="faq-list">
            {previewFaqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
