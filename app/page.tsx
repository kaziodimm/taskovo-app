import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import { TaskCard } from "@/components/TaskCard";
import { TaskerForm } from "@/components/TaskerForm";
import { faqs, featuredProviders, marketplaceCategories, trustBadges } from "@/lib/marketplace-data";
import { getOffers, getTaskers, getTasks } from "@/lib/data";

const workflow = [
  ["01", "Popiste ukol", "Napiste co potrebujete, kde, kdy a jaky mate rozpocet."],
  ["02", "Porovnejte nabidky", "Uvidite cenu, profil, hodnoceni a rychlost odpovedi."],
  ["03", "Vyberte poskytovatele", "Klient si sam zvoli nezavisleho OSVC nebo firmu."],
  ["04", "Potvrdte dokonceni", "Po dokonceni sluzby se prida recenze a uzavre se platba."],
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
              <p className="kicker">Cesky marketplace sluzeb</p>
              <h1>Najdete overenou pomoc behem nekolika minut</h1>
              <p className="hero-lead">
                Uklid, stehovani, montaz nabytku, doruceni zasilek a dalsi sluzby od overenych poskytovatelu ve vasem okoli.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="/zadat-ukol">Zadam ukol</a>
                <a className="button secondary" href="/registrace-poskytovatel">Chci nabizet sluzby</a>
              </div>
              <div className="trust-row" aria-label="Duvody duvery">
                {trustBadges.map((badge) => <span key={badge}>{badge}</span>)}
              </div>
            </div>
            <form className="search-panel" action="/kategorie">
              <p className="kicker">Najit pomoc</p>
              <label>
                Co potrebujete?
                <input name="q" placeholder="Uklid, kuryr, montaz..." />
              </label>
              <label>
                Kde?
                <input name="city" placeholder="Praha, Brno, Olomouc..." />
              </label>
              <label>
                Kdy?
                <select name="time" defaultValue="dnes">
                  <option value="dnes">Dnes</option>
                  <option value="zitra">Zitra</option>
                  <option value="tyden">Tento tyden</option>
                  <option value="dohoda">Domluvou</option>
                </select>
              </label>
              <button className="button primary" type="submit">Najit pomoc</button>
            </form>
          </div>
        </section>

        <section className="signal-bar" aria-label="Stav sluzby">
          <div><strong>{tasks.length}</strong><span>aktivnich ukolu</span></div>
          <div><strong>{offers.length}</strong><span>nabidek v systemu</span></div>
          <div><strong>{taskers.length || featuredProviders.length}</strong><span>pomocniku v pilotu</span></div>
          <div><strong>12%</strong><span>cilova provize platformy</span></div>
        </section>

        <section className="section" id="kategorie">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Popularni kategorie</p>
              <h2>Sluzby, ktere lide resi nejcasteji</h2>
              <p>Taskovo musi rust kolem opakovane poptavky: rychle ukoly, jasne ceny, lokalni dostupnost a jednoduche porovnani nabidek.</p>
            </div>
            <a className="button secondary" href="/kategorie">Vsechny kategorie</a>
          </div>
          <div className="category-grid">
            {marketplaceCategories.map((category) => <CategoryCard key={category.slug} category={category} />)}
          </div>
        </section>

        <section className="section dark-band" id="jak-to-funguje">
          <div className="section-title">
            <p className="kicker">Jak to funguje</p>
            <h2>Jednoduchy tok pro klienta i poskytovatele</h2>
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
              <p className="kicker">Featured providers</p>
              <h2>Ukazka profilu, ktery buduje duveru</h2>
              <p>Profil neni jen kontakt. Musi ukazat identitu, IČO/overeni, recenze, hotove ukoly, cenu a typ sluzeb.</p>
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
            <h2>Vytvorte prvni sit overenych lidi drive nez spustite marketing</h2>
            <p>Konkurence potvrzuje poptavku. Vyhoda Taskovo bude v jedne strukturovane platforme, jasnych pravidlech, profilech a lokalnim zamereni pro cele Cesko.</p>
            <div className="feature-list">
              <div><strong>Nezavisli OSVC a firmy</strong><span>Taskovo zprostredkuje kontakt a platbu, neridi pracovni vztah.</span></div>
              <div><strong>Overeni a recenze</strong><span>Telefon, identita, historie ukolu a reportovani problemu.</span></div>
              <div><strong>Transparentni cena</strong><span>Klient vidi nabidku pred vyberem, poskytovatel vidi rozpocet predem.</span></div>
            </div>
          </div>
          <TaskerForm />
        </section>

        {visibleTasks.length > 0 ? (
          <section className="section" id="market">
            <div className="section-title">
              <p className="kicker">Zive poptavky</p>
              <h2>Aktualni ukoly z databaze</h2>
            </div>
            <div className="task-grid">
              {visibleTasks.map((task) => <TaskCard key={task.id} task={task} offers={offers.filter((offer) => offer.task_id === task.id)} />)}
            </div>
          </section>
        ) : null}

        <section className="section" id="safety">
          <div className="section-title">
            <p className="kicker">Bezpecnost a pravni model</p>
            <h2>Taskovo je zprostredkovatel, ne zamestnavatel</h2>
            <p>Platforma propojuje klienta a poskytovatele. Poskytovatel odpovida za provedeni sluzby, dane, opravneni a legalni soulad sve cinnosti.</p>
          </div>
          <div className="trust-grid">
            <article><span className="trust-icon">ID</span><h3>Overeni identity</h3><p>Kontrola kontaktu, profilu a v dalsi fazi dokladu nebo IČO podle typu poskytovatele.</p></article>
            <article><span className="trust-icon">IČO</span><h3>Kontrola opravneni</h3><p>U firem a OSVC se bude overovat podnikatelsky profil a vhodnost pro vybrane kategorie.</p></article>
            <article><span className="trust-icon">R</span><h3>Recenze po ukolu</h3><p>Kazdy dokonceny ukol vytvari historii, rating a signal kvality pro dalsi klienty.</p></article>
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-title">
            <p className="kicker">FAQ</p>
            <h2>Otazky pred spustenim</h2>
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
