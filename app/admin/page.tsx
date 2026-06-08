import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getOffers, getTaskers, getTasks } from "@/lib/data";

export default async function AdminPage() {
  const [tasks, offers, taskers] = await Promise.all([getTasks(), getOffers(), getTaskers()]);

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin</p>
            <h1 className="page-title">Pilotni operacni centrum</h1>
            <p className="hero-lead">Rucni prehled pro prvni fazi: moderace ukolu, kontrola poskytovatelu, kvalita nabidek a bezpecnostni signaly.</p>
          </div>
          <div className="page-hero-card"><strong>{tasks.length + offers.length + taskers.length}</strong><p>celkovych zaznamu v pilotnim marketplace</p></div>
        </section>

        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Moderace ukolu</h3><p>Kontrola rizikovych, nelegalnich nebo nejasnych poptavek pred propagaci.</p></article>
          <article className="dashboard-panel"><h3>Overeni poskytovatelu</h3><p>Telefon, profil, kategorie, pozdeji IČO, doklady a Stripe onboarding.</p></article>
          <article className="dashboard-panel"><h3>Spory a reporty</h3><p>Evidence problemu, refundu, nekompletni prace a nevhodne komunikace.</p></article>
        </div>

        <div className="admin-grid section">
          <section className="admin-panel">
            <h2>Ukoly</h2>
            <div className="admin-list">
              {tasks.map((task) => <article className="admin-item" key={task.id}><strong>{task.title}</strong><p>{task.city} · {task.budget_czk.toLocaleString("cs-CZ")} Kc · {task.status}</p></article>)}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Nabidky</h2>
            <div className="admin-list">
              {offers.map((offer) => <article className="admin-item" key={offer.id}><strong>{offer.tasker_name}</strong><p>{offer.price_czk.toLocaleString("cs-CZ")} Kc · {offer.message}</p></article>)}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Poskytovatele</h2>
            <div className="admin-list">
              {taskers.map((tasker) => <article className="admin-item" key={tasker.id}><strong>{tasker.name}</strong><p>{tasker.city} · {tasker.categories}</p></article>)}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
