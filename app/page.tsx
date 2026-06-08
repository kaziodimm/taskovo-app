import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import { TaskCard } from "@/components/TaskCard";
import { TaskerForm } from "@/components/TaskerForm";
import { faqs, featuredProviders, marketplaceCategories, trustBadges } from "@/lib/marketplace-data";
import { getOffers, getTaskers, getTasks } from "@/lib/data";

const workflow = [
  ["01", "Popište úkol", "Napište, co potřebujete, kde, kdy a jaký máte rozpočet."],
  ["02", "Porovnejte nabídky", "Uvidíte cenu, profil, hodnocení a rychlost odpovědi."],
  ["03", "Vyberte poskytovatele", "Klient si sám zvolí nezávislého poskytovatele, OSVČ nebo firmu."],
  ["04", "Potvrďte dokončení", "Po dokončení služby přidáte recenzi a uzavře se platba."],
];

export default async function Home() {
  const [tasks, offers, taskers] = await Promise.all([getTasks(), getOffers(), getTaskers()]);
  const visibleTasks = tasks.slice(0, 3);

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
              <h1>Najděte ověřenou pomoc během několika minut</h1>
              <p className="hero-lead">
                Úklid, stěhování, montáž nábytku, doručení zásilek a další služby od ověřených poskytovatelů ve vašem okolí.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="/zadat-ukol">Zadám úkol</a>
                <a className="button secondary" href="/registrace-poskytovatel">Chci nabízet služby</a>
              </div>
              <div className="trust-row" aria-label="Důvody důvěry">
                {trustBadges.map((badge) => <span key={badge}>{badge}</span>)}
              </div>
            </div>
            <form className="search-panel" action="/kategorie">
              <p className="kicker">Najít pomoc</p>
              <label>Co potřebujete?<input name="q" placeholder="Úklid, kurýr, montáž..." /></label>
              <label>Kde?<input name="city" placeholder="Praha, Brno, Olomouc..." /></label>
              <label>
                Kdy?
                <select name="time" defaultValue="dnes">
                  <option value="dnes">Dnes</option>
                  <option value="zitra">Zítra</option>
                  <option value="tyden">Tento týden</option>
                  <option value="dohoda">Domluvou</option>
                </select>
              </label>
              <button className="button primary" type="submit">Najít pomoc</button>
            </form>
          </div>
        </section>

        <section className="signal-bar" aria-label="Stav služby">
          <div><strong>{tasks.length}</strong><span>aktivních úkolů</span></div>
          <div><strong>{offers.length}</strong><span>nabídek v systému</span></div>
          <div><strong>{taskers.length || featuredProviders.length}</strong><span>pomocníků v pilotu</span></div>
          <div><strong>0 Kč</strong><span>poplatek za zadání úkolu</span></div>
        </section>

        <section className="section" id="kategorie">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Populární kategorie</p>
              <h2>Služby, které lidé řeší nejčastěji</h2>
              <p>Taskovo stavíme kolem opakované poptávky: rychlé úkoly, jasné ceny, lokální dostupnost a jednoduché porovnání nabídek.</p>
            </div>
            <a className="button secondary" href="/kategorie">Všechny kategorie</a>
          </div>
          <div className="category-grid">
            {marketplaceCategories.map((category) => <CategoryCard key={category.slug} category={category} />)}
          </div>
        </section>

        <section className="section dark-band" id="jak-to-funguje">
          <div className="section-title">
            <p className="kicker">Jak to funguje</p>
            <h2>Jednoduchý tok pro klienta i poskytovatele</h2>
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

        <section className="section" id="poskytovatele">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Ověřené profily</p>
              <h2>Profil, který buduje důvěru</h2>
              <p>Profil nemá být jen kontakt. Musí ukázat identitu, ověření, recenze, dokončené úkoly, cenu a typ služeb.</p>
            </div>
            <a className="button secondary" href="/poskytovatele">Hledat poskytovatele</a>
          </div>
          <div className="provider-grid">
            {featuredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}
          </div>
        </section>

        <section className="section split" id="request">
          <div className="section-title">
            <p className="kicker">Pro poskytovatele</p>
            <h2>Vytvořte první síť ověřených lidí ještě před marketingem</h2>
            <p>Konkurence potvrzuje poptávku. Výhoda Taskovo bude v jedné strukturované platformě, jasných pravidlech, profilech a lokálním zaměření pro celé Česko.</p>
            <div className="feature-list">
              <div><strong>Nezávislí poskytovatelé</strong><span>Taskovo zprostředkuje poptávku, komunikaci a platbu. Nevytváří pracovní vztah.</span></div>
              <div><strong>Ověření a recenze</strong><span>Telefon, identita, historie úkolů a možnost nahlášení problému.</span></div>
              <div><strong>Transparentní cena</strong><span>Klient vidí nabídku před výběrem, poskytovatel vidí rozpočet předem.</span></div>
            </div>
          </div>
          <TaskerForm />
        </section>

        {visibleTasks.length > 0 ? (
          <section className="section" id="market">
            <div className="section-title">
              <p className="kicker">Živé poptávky</p>
              <h2>Aktuální úkoly z databáze</h2>
            </div>
            <div className="task-grid">
              {visibleTasks.map((task) => <TaskCard key={task.id} task={task} offers={offers.filter((offer) => offer.task_id === task.id)} />)}
            </div>
          </section>
        ) : null}

        <section className="section" id="safety">
          <div className="section-title">
            <p className="kicker">Bezpečnost a právní model</p>
            <h2>Taskovo je zprostředkovatel, ne zaměstnavatel</h2>
            <p>Platforma propojuje klienta a poskytovatele. Poskytovatel odpovídá za provedení služby, daně, oprávnění a soulad své činnosti se zákonem.</p>
          </div>
          <div className="trust-grid">
            <article><span className="trust-icon">ID</span><h3>Ověření identity</h3><p>Kontrola kontaktu, profilu a v další fázi dokladů nebo IČO podle typu poskytovatele.</p></article>
            <article><span className="trust-icon">IČO</span><h3>Kontrola oprávnění</h3><p>U firem a OSVČ se bude ověřovat podnikatelský profil a vhodnost pro vybrané kategorie.</p></article>
            <article><span className="trust-icon">R</span><h3>Recenze po úkolu</h3><p>Každý dokončený úkol vytváří historii, hodnocení a signál kvality pro další klienty.</p></article>
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-title">
            <p className="kicker">FAQ</p>
            <h2>Otázky před spuštěním</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
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
