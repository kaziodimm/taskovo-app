import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { updateClientOwnProfile } from "@/app/profile-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfilePhotoUploadForm } from "@/components/ProfilePhotoUploadForm";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import dashboardListStyles from "@/components/DashboardList.module.css";
import { getOffers, getTasksForClient } from "@/lib/data";
import { isAdminEmail } from "@/lib/admin-auth";
import { getUnreadTaskMessageCounts } from "@/lib/message-data";
import { getClientProfileForUser } from "@/lib/profile-data";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Offer, Task } from "@/lib/types";

const nextStepCopy: Record<string, string> = {
  open: "Ceka na nabidky od taskeru.",
  offers_received: "Vyberte taskera z dorucenych nabidek.",
  assigned: "Tasker je vybrany. Domluvte detaily v objednavce.",
  in_progress: "Tasker pracuje. Sledujte zpravy a detail objednavky.",
  awaiting_confirmation: "Tasker oznacil praci jako hotovou. Potvrdte dokonceni.",
  completed: "Objednavka je dokoncena.",
  cancelled: "Objednavka je zrusena.",
};

const statusLabels: Record<string, string> = {
  open: "Otevreno",
  offers_received: "Nabidky doruceny",
  assigned: "Tasker vybran",
  in_progress: "Probiha",
  awaiting_confirmation: "Ceka na potvrzeni",
  completed: "Dokonceno",
  cancelled: "Zruseno",
  disputed: "Spor",
};

const photoStatusCopy: Record<string, string> = {
  none: "Zatim bez fotky ke kontrole.",
  pending: "Nova fotka ceka na schvaleni administratorem.",
  approved: "Fotka je schvalena a muze se zobrazovat v profilu.",
  rejected: "Fotka byla odmitnuta. Muzete poslat novou.",
};

function needsClientAction(task: Task, offerCount: number) {
  return (task.status === "offers_received" && offerCount > 0) || task.status === "awaiting_confirmation";
}

function isArchivedTask(task: Task) {
  return task.status === "completed" || task.status === "cancelled";
}

function formatCzk(amount: number) {
  return `${amount.toLocaleString("cs-CZ")} Kc`;
}

function groupOffersByTask(offers: Offer[]) {
  const grouped = new Map<string, Offer[]>();
  offers.forEach((offer) => grouped.set(offer.task_id, [...(grouped.get(offer.task_id) || []), offer]));
  return grouped;
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (isAdminEmail(user.email)) redirect("/admin");
  if (user.user_metadata?.role === "tasker") redirect("/poskytovatel/dashboard");

  const [tasks, offers, profile] = await Promise.all([getTasksForClient(user.id), getOffers(), getClientProfileForUser(user.id)]);
  const unreadCounts = await getUnreadTaskMessageCounts(tasks.map((task) => task.id), user.id);
  const displayName = profile?.name || user.user_metadata?.name || user.email;
  const taskIds = new Set(tasks.map((task) => task.id));
  const clientOffers = offers.filter((offer) => taskIds.has(offer.task_id));
  const offersByTask = groupOffersByTask(clientOffers);
  const currentTasks = tasks.filter((task) => !isArchivedTask(task));
  const archivedTasks = tasks.filter(isArchivedTask);
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const actionTasks = currentTasks.filter((task) => needsClientAction(task, offersByTask.get(task.id)?.length || 0));
  const activeTasks = currentTasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));
  const openTasks = currentTasks.filter((task) => ["open", "offers_received"].includes(task.status));
  const pendingOffers = clientOffers.filter((offer) => offer.status === "pending");
  const acceptedOffers = clientOffers.filter((offer) => offer.status === "accepted");
  const unreadTotal = Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  const photoStatus = profile?.avatar_review_status || "none";
  const estimatedBudget = currentTasks.reduce((total, task) => total + (task.budget_czk || 0), 0);
  const paidEstimate = acceptedOffers.reduce((total, offer) => total + (offer.price_czk || 0), 0);

  return (
    <>
      <Header />
      <main className="page-shell dashboard-shell">
        <section className="dashboard-hero">
          <div>
            <p className="kicker">Klientsky dashboard</p>
            <h1 className="page-title">Vitejte, {displayName}</h1>
            <p className="hero-lead">Spravujte poptavky, nabidky od taskeru, zpravy a platby z jednoho mista.</p>
          </div>
          <div className="dashboard-hero-actions">
            <a className="button primary" href="#novy-ukol">Zadat novy ukol</a>
            <a className="button secondary" href="/taskeri">Najit taskera</a>
          </div>
        </section>

        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlasit se</button></form>

        <section className="dashboard-overview" aria-label="Prehled uctu">
          <article className="metric-card metric-card-primary"><span>Aktivni ukoly</span><strong>{currentTasks.length}</strong><p>{actionTasks.length ? `${actionTasks.length} ceka na vase rozhodnuti.` : "Vse je bez okamzite akce."}</p></article>
          <article className="metric-card"><span>Dorucene nabidky</span><strong>{pendingOffers.length}</strong><p>{pendingOffers.length ? "Porovnejte cenu, zpravu a profil taskera." : "Zatim zadne nove nabidky."}</p></article>
          <article className="metric-card"><span>Zpravy</span><strong>{unreadTotal}</strong><p>{unreadTotal ? "Mate nove zpravy v objednavkach." : "Zadne neprectene zpravy."}</p></article>
          <article className="metric-card"><span>Odhad rozpoctu</span><strong>{formatCzk(estimatedBudget)}</strong><p>Souhrn aktualnich otevrenych ukolu.</p></article>
        </section>

        <section className="dashboard-tabs" aria-label="Rychle sekce">
          <a href="#aktivni">Aktivni ukoly</a>
          <a href="#nabidky">Nabidky</a>
          <a href="#zpravy">Zpravy</a>
          <a href="#platby">Platby</a>
          <a href="#profil">Profil</a>
        </section>

        <section className="section dashboard-section" id="aktivni">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Prehled prace</p>
              <h2>Aktivni ukoly</h2>
              <p>Otevrene poptavky, vybrani taskeri a zakazky, ktere cekaji na potvrzeni.</p>
            </div>
            <a className="button secondary" href="/tasks">Verejny marketplace</a>
          </div>

          {actionTasks.length ? (
            <div className="priority-panel">
              <div><p className="kicker">Priorita</p><h3>Ceka na vas krok</h3></div>
              <div className={dashboardListStyles.compactList}>
                {actionTasks.map((task) => (
                  <article className={dashboardListStyles.compactItem} key={task.id}>
                    <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                    <p className={dashboardListStyles.itemText}>{nextStepCopy[task.status] ?? "Otevrete detail objednavky."} · {offersByTask.get(task.id)?.length || 0} nabidek · {unreadCounts[task.id] || 0} novych zprav</p>
                    <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>Otevrit objednavku</a></div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {currentTasks.length > 0 ? (
            <div className="task-grid">
              {currentTasks.map((task) => <TaskCard key={task.id} task={task} offers={offersByTask.get(task.id) || []} canSelectOffer showOfferForm={false} canManageTask />)}
            </div>
          ) : (
            <div className="empty-state"><h3>Zatim nemate zadny ukol</h3><p>Zadejte prvni poptavku a Taskovo ji ukaze vhodnym taskerum v okoli.</p><a className="button primary" href="#novy-ukol">Zadat novy ukol</a></div>
          )}
        </section>

        <section className="section dashboard-section" id="nabidky">
          <div className="section-title"><p className="kicker">Nabidky</p><h2>Porovnani nabidek</h2><p>Klient si taskera vybira samostatne. Taskovo je zprostredkovatel, ne zamestnavatel ani primy poskytovatel sluzby.</p></div>
          {openTasks.length ? (
            <div className={dashboardListStyles.compactList}>
              {openTasks.map((task) => {
                const taskOffers = offersByTask.get(task.id) || [];
                return (
                  <article className={dashboardListStyles.compactItem} key={task.id}>
                    <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                    <p className={dashboardListStyles.itemText}>Stav: {statusLabels[task.status] ?? task.status} · {taskOffers.length} nabidek · rozpocet {formatCzk(task.budget_czk)}</p>
                    <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>{taskOffers.length ? "Vybrat taskera" : "Otevrit detail"}</a></div>
                  </article>
                );
              })}
            </div>
          ) : <div className="empty-state"><h3>Zadne nabidky k vyberu</h3><p>Jakmile taskeri odpovi na vase ukoly, uvidite je tady.</p></div>}
        </section>

        <section className="section dashboard-section" id="zpravy">
          <div className="section-title"><p className="kicker">Komunikace</p><h2>Zpravy</h2><p>Zpravy jsou vazane na konkretni objednavku, aby domluva nezmizela mimo kontext.</p></div>
          {unreadTotal ? (
            <div className={dashboardListStyles.compactList}>
              {currentTasks.filter((task) => unreadCounts[task.id]).map((task) => (
                <article className={dashboardListStyles.compactItem} key={task.id}>
                  <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                  <p className={dashboardListStyles.itemText}>{unreadCounts[task.id]} novych zprav · {task.city}</p>
                  <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>Otevrit zpravy</a></div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><h3>Zadne nove zpravy</h3><p>Až se tasker ozve nebo upresni detail, zprava se objevi v objednavce.</p></div>}
        </section>

        <section className="section dashboard-section" id="platby">
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Platby</h3><p>{acceptedOffers.length ? `Evidujeme ${acceptedOffers.length} vybranych nabidek v odhadovane hodnote ${formatCzk(paidEstimate)}.` : "Platebni tok pripojime po dokonceni Stripe. Ted je sekce pripravena pro pilot."}</p></article>
            <article className="dashboard-panel"><h3>Recenze</h3><p>{completedTasks.length ? `Po ${completedTasks.length} dokoncenych ukolech bude mozne pridat recenzi taskerovi.` : "Po dokonceni prvni objednavky zde bude vyzva k recenzi."}</p></article>
            <article className="dashboard-panel"><h3>Bezpecnost</h3><p>Platby a spory budou vedeny pres Taskovo proces. Tasker zustava nezavisly OSVC nebo firma.</p></article>
          </div>
        </section>

        <section className="section split dashboard-create-section" id="novy-ukol">
          <div className="section-title">
            <p className="kicker">Rychle zadani</p>
            <h2>Vytvorte novy ukol</h2>
            <p>Po odeslani se ukol ulozi k vasemu uctu a taskerum ho zobrazime v marketplace.</p>
          </div>
          <TaskForm />
        </section>

        <section className="section admin-panel" id="profil">
          <div className="section-title">
            <p className="kicker">Muj profil</p>
            <h2>Kontaktni udaje klienta</h2>
            <p>Tyto udaje pouzivame pro objednavky a podporu. Prihlasovaci email zatim zustava stejny.</p>
          </div>
          <form className="compact-form" action={updateClientOwnProfile}>
            <label>Jmeno<input name="name" type="text" defaultValue={profile?.name || user.user_metadata?.name || ""} required /></label>
            <label>Prihlasovaci email<input type="email" defaultValue={user.email || ""} disabled /></label>
            <label>Telefon<input name="phone" type="text" defaultValue={profile?.phone || ""} placeholder="+420..." /></label>
            <label>Mesto<input name="city" type="text" defaultValue={profile?.city || ""} placeholder="Praha, Plzen, Tabor..." /></label>
            <label>Jazyk<select name="preferred_language" defaultValue={profile?.preferred_language || "cs"}><option value="cs">Cestina</option><option value="en">English</option><option value="uk">Ukrainstina</option><option value="ru">Rustina</option></select></label>
            <label className="checkbox-row"><input name="marketing_consent" type="checkbox" defaultChecked={Boolean(profile?.marketing_consent)} /> Novinky a tipy od Taskovo</label>
            <button className="button primary span-full" type="submit">Ulozit profil</button>
          </form>

          <section className="section-action">
            <div className="section-title"><p className="kicker">Foto profilu</p><h2>Profilova fotka</h2><p>Fotka se verejne zobrazi az po kontrole administratorem.</p></div>
            <div className="dashboard-grid">
              <article className="dashboard-panel"><h3>Schvalena fotka</h3>{profile?.avatar_url ? <img className="avatar brand-mark-large" src={profile.avatar_url} alt="Schvalena profilova fotka" /> : <p>Schvalena fotka zatim neni nastavena.</p>}</article>
              <article className="dashboard-panel"><h3>Ceka na kontrolu</h3>{profile?.pending_avatar_url ? <img className="avatar brand-mark-large" src={profile.pending_avatar_url} alt="Fotka cekajici na kontrolu" /> : <p>Zadna nova fotka neceka na kontrolu.</p>}</article>
              <article className="dashboard-panel"><h3>Stav</h3><p>{photoStatusCopy[photoStatus] || photoStatus}</p>{profile?.avatar_review_note ? <p>{profile.avatar_review_note}</p> : null}</article>
            </div>
            <ProfilePhotoUploadForm />
          </section>
        </section>

        {archivedTasks.length ? (
          <section className="section dashboard-section">
            <div className="section-title"><p className="kicker">Archiv</p><h2>Dokoncene a zrusene objednavky</h2><p>Historie zustava oddelena od aktualnich ukolu.</p></div>
            <div className="task-grid">{archivedTasks.map((task) => <TaskCard key={task.id} task={task} offers={offersByTask.get(task.id) || []} showOfferForm={false} />)}</div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
