import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getOffers, getTaskers, getTasks } from "@/lib/data";

export default async function AdminPage() {
  const [tasks, offers, taskers] = await Promise.all([getTasks(), getOffers(), getTaskers()]);

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title">
          <p className="kicker">Admin</p>
          <h1 className="page-title">Pilotní přehled</h1>
          <p>Jednoduchý přehled pro první ruční moderaci. Plná admin akce přijde v další iteraci.</p>
        </section>
        <div className="admin-grid">
          <section className="admin-panel">
            <h2>Úkoly</h2>
            <div className="admin-list">
              {tasks.map((task) => (
                <article className="admin-item" key={task.id}>
                  <strong>{task.title}</strong>
                  <p>
                    {task.city} · {task.budget_czk.toLocaleString("cs-CZ")} Kč · {task.status}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Nabídky</h2>
            <div className="admin-list">
              {offers.map((offer) => (
                <article className="admin-item" key={offer.id}>
                  <strong>{offer.tasker_name}</strong>
                  <p>
                    {offer.price_czk.toLocaleString("cs-CZ")} Kč · {offer.message}
                  </p>
                </article>
              ))}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Pomocníci</h2>
            <div className="admin-list">
              {taskers.map((tasker) => (
                <article className="admin-item" key={tasker.id}>
                  <strong>{tasker.name}</strong>
                  <p>
                    {tasker.city} · {tasker.categories}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
