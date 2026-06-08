import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { TaskerForm } from "@/components/TaskerForm";
import { getOffers, getTaskers, getTasks } from "@/lib/data";

export default async function Home() {
  const [tasks, offers, taskers] = await Promise.all([getTasks(), getOffers(), getTaskers()]);
  const visibleTasks = tasks.slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-image" aria-hidden="true">
            <img
              src="https://images.pexels.com/photos/8988545/pexels-photo-8988545.jpeg?auto=compress&cs=tinysrgb&w=1800"
              alt=""
            />
          </div>
          <div className="hero-overlay" aria-hidden="true" />
          <div className="hero-inner">
            <div className="hero-copy">
              <p className="kicker">Lokální pomoc v Česku</p>
              <h1>Lidé na úkoly v okolí</h1>
              <p className="hero-lead">
                Vyzvednutí, dovoz, montáž, odnos věcí nebo domácí pomoc. Taskovo propojí klienty
                s lidmi, kteří mají čas, šikovné ruce a jsou poblíž.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="#request">
                  Zadat úkol
                </a>
                <a className="button secondary" href="#taskers">
                  Chci pomáhat
                </a>
              </div>
            </div>
            <TaskForm />
          </div>
        </section>

        <section className="signal-bar" aria-label="Stav služby">
          <div>
            <strong>{tasks.length}</strong>
            <span>aktivních úkolů</span>
          </div>
          <div>
            <strong>{offers.length}</strong>
            <span>nabídek</span>
          </div>
          <div>
            <strong>{taskers.length}</strong>
            <span>pomocníků</span>
          </div>
          <div>
            <strong>12%</strong>
            <span>modelová provize</span>
          </div>
        </section>

        <section className="section" id="market">
          <div className="section-title">
            <p className="kicker">Marketplace</p>
            <h2>Aktuální úkoly</h2>
            <p>První ostrá verze marketplace: zadání, nabídky, pomocníci a admin kontrola.</p>
          </div>
          <div className="task-grid">
            {visibleTasks.map((task) => (
              <TaskCard key={task.id} task={task} offers={offers.filter((offer) => offer.task_id === task.id)} />
            ))}
          </div>
          <div className="section-action">
            <a className="button secondary" href="/tasks">
              Zobrazit všechny úkoly
            </a>
          </div>
        </section>

        <section className="section split" id="taskers">
          <div className="section-title">
            <p className="kicker">Pomocníci</p>
            <h2>Chcete si přivydělat?</h2>
            <p>
              Registrace sbírá první síť lidí pro pilot. V produkční verzi budou profily ověřené
              telefonem, recenzemi a historií dokončených úkolů.
            </p>
            <div className="feature-list">
              <div>
                <strong>Flexibilně</strong>
                <span>Vyberete si úkoly podle města, času a ceny.</span>
              </div>
              <div>
                <strong>Lokálně</strong>
                <span>Malé zakázky blízko vás bez dlouhého čekání.</span>
              </div>
              <div>
                <strong>Transparentně</strong>
                <span>Cena, provize a kontakt jsou jasné předem.</span>
              </div>
            </div>
          </div>
          <TaskerForm />
        </section>

        <section className="section" id="safety">
          <div className="section-title">
            <p className="kicker">Důvěra</p>
            <h2>Bezpečná lokální služba od prvního dne</h2>
          </div>
          <div className="trust-grid">
            <article>
              <span className="trust-icon">01</span>
              <h3>Ověření kontaktu</h3>
              <p>Telefon nebo email je základ. U ostré verze přidáme profily, historii a recenze.</p>
            </article>
            <article>
              <span className="trust-icon">02</span>
              <h3>Jasné ceny</h3>
              <p>Klient vidí nabídku před výběrem. Pomocník vidí rozpočet a modelovou provizi.</p>
            </article>
            <article>
              <span className="trust-icon">03</span>
              <h3>Moderace úkolů</h3>
              <p>Převoz osob, nelegální zadání a rizikové práce nepatří do prvního spuštění.</p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
