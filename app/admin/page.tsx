import { redirect } from "next/navigation";
import { acceptAdminOffer, cancelAdminTask, declineAdminOffer, reopenAdminTask, toggleTaskerVerification, updateAdminTaskStatus } from "@/app/admin-actions";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getClients, getOffers, getTaskMessageCounts, getTaskers, getTasks } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const statusLabels: Record<string, string> = {
  pending_review: "Kontrola",
  open: "Otevřeno",
  offers_received: "Nabídky",
  assigned: "Tasker vybrán",
  in_progress: "Probíhá",
  awaiting_confirmation: "Čeká na klienta",
  completed: "Hotovo",
  cancelled: "Zrušeno",
  disputed: "Spor",
};

const adminStatusOptions = [
  "pending_review",
  "open",
  "offers_received",
  "assigned",
  "in_progress",
  "awaiting_confirmation",
  "completed",
  "cancelled",
  "disputed",
];

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/prihlaseni?mode=login&error=login_required");
  }

  const [tasks, offers, taskers, clients] = await Promise.all([getTasks(), getOffers(), getTaskers(), getClients()]);
  const messageCounts = await getTaskMessageCounts(tasks.map((task) => task.id));
  const offersByTask = new Map<string, typeof offers>();
  offers.forEach((offer) => offersByTask.set(offer.task_id, [...(offersByTask.get(offer.task_id) || []), offer]));

  const activeTasks = tasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));
  const waitingClientTasks = tasks.filter((task) => task.status === "awaiting_confirmation");
  const openTasks = tasks.filter((task) => ["open", "offers_received"].includes(task.status));
  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin</p>
            <h1 className="page-title">Operační centrum Taskovo</h1>
            <p className="hero-lead">Kontrola objednávek, klientů, taskerů, nabídek a stavu práce v pilotním marketplace.</p>
          </div>
          <div className="page-hero-card"><strong>{tasks.length}</strong><p>objednávek · {activeTasks.length} aktivních</p></div>
        </section>

        <form action={logoutAccount} className="admin-toolbar">
          <span>Přihlášený účet správce</span>
          <button className="button secondary" type="submit">Odhlásit se</button>
        </form>

        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Otevřené</h3><p>{openTasks.length} objednávek čeká na nabídky nebo výběr taskera.</p></article>
          <article className="dashboard-panel"><h3>Aktivní</h3><p>{activeTasks.length} objednávek je přiřazených, probíhá nebo čeká na potvrzení.</p></article>
          <article className="dashboard-panel"><h3>Čeká na klienta</h3><p>{waitingClientTasks.length} objednávek čeká na potvrzení dokončení.</p></article>
          <article className="dashboard-panel"><h3>Dokončeno</h3><p>{completedTasks.length} objednávek je hotových.</p></article>
          <article className="dashboard-panel"><h3>Klienti</h3><p>{clients.length} registrovaných klientů.</p></article>
          <article className="dashboard-panel"><h3>Taskeři</h3><p>{taskers.length} registrovaných taskerů.</p></article>
        </div>

        <section className="section admin-panel">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Objednávky</p><h2>Kontrola zakázek</h2><p>Rychlý přehled stavu, klienta, vybraného taskera, nabídek a zpráv.</p></div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>
          <div className="admin-list">
            {tasks.map((task) => {
              const taskOffers = offersByTask.get(task.id) || [];
              const acceptedOffer = taskOffers.find((offer) => offer.id === task.accepted_offer_id || offer.status === "accepted");

              return (
                <article className="admin-item" key={task.id}>
                  <strong>{task.title}</strong>
                  <p>{task.city} · {task.desired_time} · {money(task.budget_czk)} Kč · {statusLabels[task.status] ?? task.status}</p>
                  <p>Klient: {task.client_name} · {task.client_contact || "kontakt není uveden"}</p>
                  <p>Tasker: {acceptedOffer?.tasker_name || "zatím nevybrán"} · {taskOffers.length} nabídek · {messageCounts[task.id] || 0} zpráv</p>
                  <div className="hero-actions">
                    <a className="button secondary" href={`/ukol/${task.id}`}>Otevřít objednávku</a>
                    <form className="compact-form" action={updateAdminTaskStatus}>
                      <input type="hidden" name="task_id" value={task.id} />
                      <label>Stav<select name="status" defaultValue={task.status}>{adminStatusOptions.map((status) => <option key={status} value={status}>{statusLabels[status] ?? status}</option>)}</select></label>
                      <button className="button secondary" type="submit">Uložit stav</button>
                    </form>
                    {task.status !== "cancelled" ? (
                      <form action={cancelAdminTask}>
                        <input type="hidden" name="task_id" value={task.id} />
                        <button className="button secondary" type="submit">Zrušit</button>
                      </form>
                    ) : null}
                    {acceptedOffer ? (
                      <form action={reopenAdminTask}>
                        <input type="hidden" name="task_id" value={task.id} />
                        <button className="button secondary" type="submit">Vrátit do hledání</button>
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <div className="admin-grid section">
          <section className="admin-panel">
            <h2>Klienti</h2>
            <div className="admin-list">
              {clients.map((client) => <article className="admin-item" key={client.id}><strong>{client.name}</strong><p>{client.email} · {client.phone || "bez telefonu"} · {client.city || "město neuvedeno"}</p></article>)}
            </div>
          </section>
          <section className="admin-panel">
            <h2>Taskeři</h2>
            <div className="admin-list">
              {taskers.map((tasker) => (
                <article className="admin-item" key={tasker.id}>
                  <strong>{tasker.name}</strong>
                  <p>{tasker.city} · {tasker.categories} · {tasker.verified ? "ověřen" : "čeká na ověření"}</p>
                  <p>{tasker.email || "email neuveden"} · {tasker.contact || "kontakt neuveden"}</p>
                  <form action={toggleTaskerVerification} className="inline-action-form">
                    <input type="hidden" name="tasker_id" value={tasker.id} />
                    <input type="hidden" name="verified" value={tasker.verified ? "false" : "true"} />
                    <button className="button secondary" type="submit">{tasker.verified ? "Odebrat ověření" : "Ověřit taskera"}</button>
                  </form>
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
                  <p>{money(offer.price_czk)} Kč · {offer.status} · {offer.message}</p>
                  <div className="hero-actions">
                    <a className="button secondary" href={`/ukol/${offer.task_id}`}>Objednávka</a>
                    {offer.status !== "accepted" ? (
                      <form action={acceptAdminOffer}>
                        <input type="hidden" name="task_id" value={offer.task_id} />
                        <input type="hidden" name="offer_id" value={offer.id} />
                        <button className="button secondary" type="submit">Vybrat taskera</button>
                      </form>
                    ) : null}
                    {offer.status !== "declined" ? (
                      <form action={declineAdminOffer}>
                        <input type="hidden" name="task_id" value={offer.task_id} />
                        <input type="hidden" name="offer_id" value={offer.id} />
                        <button className="button secondary" type="submit">Odmítnout nabídku</button>
                      </form>
                    ) : null}
                  </div>
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
