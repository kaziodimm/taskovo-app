import { redirect } from "next/navigation";
import { adminLogout } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getClients, getOffers, getTaskers, getTasks } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/prihlaseni");
  }

  const [tasks, offers, taskers, clients] = await Promise.all([getTasks(), getOffers(), getTaskers(), getClients()]);

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin</p>
            <h1 className="page-title">Operační centrum Taskovo</h1>
            <p className="hero-lead">Ručný přehled pro pilot: klienti, úkoly, taskeři, nabídky a bezpečnostní kontrola.</p>
          </div>
          <div className="page-hero-card"><strong>{tasks.length + offers.length + taskers.length + clients.length}</strong><p>záznamů v pilotním marketplace</p></div>
        </section>

        <form action={adminLogout} className="admin-toolbar">
          <span>Přihlášený správce</span>
          <button className="button secondary" type="submit">Odhlásit se</button>
        </form>

        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Klienti</h3><p>{clients.length} registrovaných klientů z formuláře.</p></article>
          <article className="dashboard-panel"><h3>Taskeři</h3><p>{taskers.length} lidí připravených nabízet služby.</p></article>
          <article className="dashboard-panel"><h3>Úkoly</h3><p>{tasks.length} poptávek pro ruční kontrolu.</p></article>
        </div>

        <div className="admin-grid section">
          <section className="admin-panel">
            <h2>Klienti</h2>
            <div className="admin-list">
              {clients.map((client) => <article className="admin-item" key={client.id}><strong>{client.name}</strong><p>{client.email} · {client.phone || "bez telefonu"} · {client.city || "město neuvedeno"}</p></article>)}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Úkoly</h2>
            <div className="admin-list">
              {tasks.map((task) => <article className="admin-item" key={task.id}><strong>{task.title}</strong><p>{task.city} · {task.budget_czk.toLocaleString("cs-CZ")} Kč · {task.status}</p></article>)}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Nabídky</h2>
            <div className="admin-list">
              {offers.map((offer) => <article className="admin-item" key={offer.id}><strong>{offer.tasker_name}</strong><p>{offer.price_czk.toLocaleString("cs-CZ")} Kč · {offer.message}</p></article>)}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Taskeři</h2>
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
