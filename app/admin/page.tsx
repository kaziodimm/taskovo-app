import { redirect } from "next/navigation";
import {
  acceptAdminOffer,
  approveProfilePhoto,
  cancelAdminTask,
  declineAdminOffer,
  rejectProfilePhoto,
  reopenAdminTask,
  toggleTaskerVerification,
  updateAdminTaskStatus,
} from "@/app/admin-actions";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminTasks, getClients, getOffers, getTaskMessageCounts, getTaskers } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import styles from "./page.module.css";

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

type ReviewProfile = {
  id: string;
  name: string;
  email?: string | null;
  city?: string | null;
  categories?: string | null;
  pending_avatar_url?: string | null;
  avatar_review_status?: string | null;
};

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

function taskCancelForm(taskId: string) {
  return (
    <details className={styles.dangerBox}>
      <summary>Zrušit objednávku</summary>
      <form className="compact-form" action={cancelAdminTask}>
        <input type="hidden" name="task_id" value={taskId} />
        <label className="span-full">Důvod zrušení<textarea name="reason" rows={3} placeholder="Například: nevhodný obsah, duplicitní úkol, porušení pravidel..." required /></label>
        <button className="button secondary span-full" type="submit">Potvrdit zrušení</button>
      </form>
    </details>
  );
}

function photoReviewItem(profile: ReviewProfile, role: "client" | "tasker") {
  const detailPath = role === "tasker" ? `/admin/taskers/${profile.id}` : `/admin/clients/${profile.id}`;
  const roleLabel = role === "tasker" ? "Tasker" : "Klient";

  return (
    <article className={styles.reviewItem} key={`${role}-${profile.id}`}>
      <img className={styles.reviewImage} src={profile.pending_avatar_url || ""} alt={`Fotka ke kontrole: ${profile.name}`} />
      <div className={styles.reviewBody}>
        <span className="pill">{roleLabel}</span>
        <strong>{profile.name}</strong>
        <p>{profile.email || profile.categories || "Kontakt není uveden"} · {profile.city || "město neuvedeno"}</p>
        <p>Stav: {profile.avatar_review_status === "pending" ? "čeká na kontrolu" : profile.avatar_review_status || "nová fotka"}</p>
        <div className="hero-actions">
          <a className="button secondary" href={detailPath}>Otevřít profil</a>
          <form action={approveProfilePhoto}>
            <input type="hidden" name="profile_id" value={profile.id} />
            <input type="hidden" name="role" value={role} />
            <button className="button primary" type="submit">Schválit</button>
          </form>
        </div>
        <form className={`compact-form ${styles.reviewRejectForm}`} action={rejectProfilePhoto}>
          <input type="hidden" name="profile_id" value={profile.id} />
          <input type="hidden" name="role" value={role} />
          <label>Důvod odmítnutí<input name="reason" type="text" placeholder="Nevhodná fotka, špatná kvalita..." /></label>
          <button className="button secondary" type="submit">Odmítnout</button>
        </form>
      </div>
    </article>
  );
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/prihlaseni?mode=login&error=login_required");
  }

  const [tasks, offers, taskers, clients] = await Promise.all([getAdminTasks(), getOffers(), getTaskers(), getClients()]);
  const messageCounts = await getTaskMessageCounts(tasks.map((task) => task.id));
  const offersByTask = new Map<string, typeof offers>();
  offers.forEach((offer) => offersByTask.set(offer.task_id, [...(offersByTask.get(offer.task_id) || []), offer]));

  const visibleTasks = tasks.filter((task) => task.status !== "cancelled");
  const cancelledTasks = tasks.filter((task) => task.status === "cancelled");
  const activeTasks = visibleTasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));
  const waitingClientTasks = visibleTasks.filter((task) => task.status === "awaiting_confirmation");
  const openTasks = visibleTasks.filter((task) => ["open", "offers_received"].includes(task.status));
  const completedTasks = visibleTasks.filter((task) => task.status === "completed");
  const disputedTasks = visibleTasks.filter((task) => task.status === "disputed");
  const pendingClientPhotos = clients.filter((client) => client.pending_avatar_url);
  const pendingTaskerPhotos = taskers.filter((tasker) => tasker.pending_avatar_url);
  const pendingPhotoCount = pendingClientPhotos.length + pendingTaskerPhotos.length;

  return (
    <>
      <Header />
      <main className={`page-shell ${styles.adminShell}`}>
        <section className="page-hero">
          <div>
            <p className="kicker">Admin</p>
            <h1 className="page-title">Operační centrum Taskovo</h1>
            <p className="hero-lead">Kontrola objednávek, klientů, taskerů, nabídek a stavu práce v pilotním marketplace.</p>
          </div>
          <div className="page-hero-card"><strong>{visibleTasks.length}</strong><p>aktivních objednávek · {cancelledTasks.length} zrušených v archivu</p></div>
        </section>

        <form action={logoutAccount} className="admin-toolbar">
          <span>Přihlášený účet správce</span>
          <button className="button secondary" type="submit">Odhlásit se</button>
        </form>

        <nav className={styles.adminJumpNav} aria-label="Rychlá navigace administrace">
          <a href="#review">Ke kontrole</a>
          <a href="#orders">Objednávky</a>
          <a href="#clients">Klienti</a>
          <a href="#taskers">Taskeři</a>
          <a href="#offers">Nabídky</a>
          <a href="/tasks">Marketplace</a>
        </nav>

        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Ke kontrole</h3><p>{pendingPhotoCount} profilových fotek čeká na rozhodnutí.</p></article>
          <article className="dashboard-panel"><h3>Otevřené</h3><p>{openTasks.length} objednávek čeká na nabídky nebo výběr taskera.</p></article>
          <article className="dashboard-panel"><h3>Aktivní</h3><p>{activeTasks.length} objednávek je přiřazených, probíhá nebo čeká na potvrzení.</p></article>
          <article className="dashboard-panel"><h3>Spory</h3><p>{disputedTasks.length} objednávek čeká na zásah administrátora.</p></article>
          <article className="dashboard-panel"><h3>Čeká na klienta</h3><p>{waitingClientTasks.length} objednávek čeká na potvrzení dokončení.</p></article>
          <article className="dashboard-panel"><h3>Účty</h3><p>{taskers.length} registrovaných taskerů · {clients.length} klientů.</p></article>
        </div>

        <section id="review" className={`section ${styles.sectionCard}`}>
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Ke kontrole</p><h2>Moderace profilových fotek</h2><p>Nové fotky se nezobrazují veřejně, dokud je administrátor neschválí. Tady jsou všechny čekající žádosti na jednom místě.</p></div>
          </div>
          {pendingPhotoCount > 0 ? (
            <div className={styles.reviewGrid}>
              {pendingClientPhotos.map((client) => photoReviewItem(client, "client"))}
              {pendingTaskerPhotos.map((tasker) => photoReviewItem(tasker, "tasker"))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>Momentálně nic nečeká na kontrolu.</strong>
              <p>Až klient nebo tasker nahraje novou fotku, objeví se tady.</p>
            </div>
          )}
        </section>

        <section id="orders" className={`section ${styles.sectionCard}`}>
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Objednávky</p><h2>Kontrola zakázek</h2><p>Hlavní operativní seznam bez zrušených objednávek. Zrušené objednávky zůstávají jen v archivu kvůli historii.</p></div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>
          <div className={styles.adminList}>
            {visibleTasks.map((task) => {
              const taskOffers = offersByTask.get(task.id) || [];
              const acceptedOffer = taskOffers.find((offer) => offer.id === task.accepted_offer_id || offer.status === "accepted");

              return (
                <article className={`admin-item ${styles.adminItem}`} key={task.id}>
                  <strong>{task.title}</strong>
                  <p>{task.city} · {task.desired_time} · {money(task.budget_czk)} Kč · {statusLabels[task.status] ?? task.status}</p>
                  <p>Klient: {task.client_name} · {task.client_contact || "kontakt není uveden"}</p>
                  <p>Tasker: {acceptedOffer?.tasker_name || "zatím nevybrán"} · {taskOffers.length} nabídek · {messageCounts[task.id] || 0} zpráv</p>
                  <div className="hero-actions">
                    <a className="button primary" href={`/admin/tasks/${task.id}`}>Řídit objednávku</a>
                    <a className="button secondary" href={`/ukol/${task.id}`}>Veřejný detail</a>
                    <form className="compact-form" action={updateAdminTaskStatus}>
                      <input type="hidden" name="task_id" value={task.id} />
                      <label>Stav<select name="status" defaultValue={task.status}>{adminStatusOptions.map((status) => <option key={status} value={status}>{statusLabels[status] ?? status}</option>)}</select></label>
                      <button className="button secondary" type="submit">Uložit stav</button>
                    </form>
                    {acceptedOffer ? (
                      <form action={reopenAdminTask}>
                        <input type="hidden" name="task_id" value={task.id} />
                        <button className="button secondary" type="submit">Vrátit do hledání</button>
                      </form>
                    ) : null}
                  </div>
                  {taskCancelForm(task.id)}
                </article>
              );
            })}
          </div>
        </section>

        <div className="admin-grid section">
          <section id="clients" className={styles.sectionCard}>
            <div className="section-title"><p className="kicker">Klienti</p><h2>Klientské účty</h2></div>
            <div className={`${styles.adminList} ${styles.directoryList}`}>
              {clients.map((client) => (
                <article className={`admin-item ${styles.adminItem}`} key={client.id}>
                  <strong>{client.name}</strong>
                  <p>{client.email} · {client.phone || "bez telefonu"} · {client.city || "město neuvedeno"}</p>
                  {client.pending_avatar_url ? <span className="pill">fotka čeká na kontrolu</span> : null}
                  <a className="button secondary" href={`/admin/clients/${client.id}`}>Detail klienta</a>
                </article>
              ))}
            </div>
          </section>
          <section id="taskers" className={styles.sectionCard}>
            <div className="section-title"><p className="kicker">Taskeři</p><h2>Profily taskerů</h2></div>
            <div className={`${styles.adminList} ${styles.directoryList}`}>
              {taskers.map((tasker) => (
                <article className={`admin-item ${styles.adminItem}`} key={tasker.id}>
                  <strong>{tasker.name}</strong>
                  <p>{tasker.city} · {tasker.categories} · {tasker.verified ? "ověřen" : "čeká na ověření"}</p>
                  <p>{tasker.email || "email neuveden"} · {tasker.contact || "kontakt neuveden"}</p>
                  {tasker.pending_avatar_url ? <span className="pill">fotka čeká na kontrolu</span> : null}
                  <div className="hero-actions">
                    <a className="button secondary" href={`/admin/taskers/${tasker.id}`}>Detail taskera</a>
                    <form action={toggleTaskerVerification} className="inline-action-form">
                      <input type="hidden" name="tasker_id" value={tasker.id} />
                      <input type="hidden" name="verified" value={tasker.verified ? "false" : "true"} />
                      <button className="button secondary" type="submit">{tasker.verified ? "Odebrat ověření" : "Ověřit taskera"}</button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <section id="offers" className={styles.sectionCard}>
            <div className="section-title"><p className="kicker">Nabídky</p><h2>Nabídky taskerů</h2></div>
            <div className={styles.adminList}>
              {offers.map((offer) => (
                <article className={`admin-item ${styles.adminItem}`} key={offer.id}>
                  <strong>{offer.tasker_name}</strong>
                  <p>{money(offer.price_czk)} Kč · {offer.status} · {offer.message}</p>
                  <div className="hero-actions">
                    <a className="button secondary" href={`/admin/tasks/${offer.task_id}`}>Objednávka</a>
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
