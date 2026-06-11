import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { updateTaskerOwnProfile } from "@/app/profile-actions";
import { withdrawTaskerOffer } from "@/app/tasker-offer-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfilePhotoUploadForm } from "@/components/ProfilePhotoUploadForm";
import { TaskCard } from "@/components/TaskCard";
import dashboardListStyles from "@/components/DashboardList.module.css";
import { getAssignedTasksForTasker, getOffers, getOffersForTasker, getOpenTasksForTaskers, getTaskerProfileForUser } from "@/lib/data";
import { getUnreadTaskMessageCounts } from "@/lib/message-data";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Task, TaskerProfile } from "@/lib/types";

const statusLabels: Record<string, string> = {
  assigned: "Tasker vybran",
  in_progress: "Probiha",
  awaiting_confirmation: "Ceka na klienta",
  completed: "Hotovo",
  cancelled: "Zruseno",
  disputed: "Spor",
};

const offerStatusLabels: Record<string, string> = {
  pending: "Ceka na klienta",
  accepted: "Vybrano klientem",
  declined: "Odmitnuto",
};

const nextStepCopy: Record<string, string> = {
  assigned: "Zacnete praci, az mate s klientem domluvene detaily.",
  in_progress: "Po dokonceni oznacte praci jako hotovou.",
  awaiting_confirmation: "Ceka se na potvrzeni klienta.",
  completed: "Objednavka je dokoncena.",
  cancelled: "Objednavka je zrusena.",
};

const photoStatusCopy: Record<string, string> = {
  none: "Zatim bez fotky ke kontrole.",
  pending: "Nova fotka ceka na schvaleni administratorem.",
  approved: "Fotka je schvalena a muze se zobrazovat v profilu taskera.",
  rejected: "Fotka byla odmitnuta. Muzete poslat novou.",
};

function needsTaskerAction(task: Task) {
  return task.status === "assigned" || task.status === "in_progress";
}

function formatCzk(amount: number) {
  return `${amount.toLocaleString("cs-CZ")} Kc`;
}

function profileCompletion(profile: TaskerProfile | null) {
  const checks = [profile?.name, profile?.city, profile?.categories, profile?.contact, profile?.bio, profile?.avatar_url, profile?.verified];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default async function ProviderDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role !== "tasker") redirect("/dashboard");

  const [profile, openTasks, allOffers, myOffers, assignedTasks] = await Promise.all([
    getTaskerProfileForUser(user.id),
    getOpenTasksForTaskers(),
    getOffers(),
    getOffersForTasker(user.id),
    getAssignedTasksForTasker(user.id),
  ]);
  const unreadCounts = await getUnreadTaskMessageCounts(assignedTasks.map((task) => task.id), user.id);

  const myOfferTaskIds = new Set(myOffers.map((offer) => offer.task_id));
  const availableTasks = openTasks.filter((task) => !myOfferTaskIds.has(task.id));
  const actionTasks = assignedTasks.filter(needsTaskerAction);
  const waitingTasks = assignedTasks.filter((task) => task.status === "awaiting_confirmation");
  const completedTasks = assignedTasks.filter((task) => task.status === "completed");
  const acceptedOffers = myOffers.filter((offer) => offer.status === "accepted");
  const pendingOffers = myOffers.filter((offer) => offer.status === "pending");
  const unreadTotal = Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  const photoStatus = profile?.avatar_review_status || "none";
  const completion = profileCompletion(profile);
  const estimatedEarnings = acceptedOffers.reduce((total, offer) => total + offer.price_czk, 0);
  const possiblePipeline = availableTasks.reduce((total, task) => total + (task.budget_czk || 0), 0);

  return (
    <>
      <Header />
      <main className="page-shell dashboard-shell">
        <section className="dashboard-hero">
          <div>
            <p className="kicker">Dashboard taskera</p>
            <h1 className="page-title">{profile?.name || user.user_metadata?.name || "Tasker"}</h1>
            <p className="hero-lead">Sledujte dostupne ukoly, aktivni zakazky, nabidky, vyplaty a stav overeni profilu.</p>
          </div>
          <div className="dashboard-hero-actions">
            <a className="button primary" href="#dostupne-ukoly">Najit ukol</a>
            <a className="button secondary" href="/pro-taskery">Jak vydelavat</a>
          </div>
        </section>

        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlasit se</button></form>

        <section className="dashboard-overview" aria-label="Prehled taskera">
          <article className="metric-card metric-card-primary"><span>Dostupne ukoly</span><strong>{availableTasks.length}</strong><p>Odhad rozpoctu v okoli: {formatCzk(possiblePipeline)}.</p></article>
          <article className="metric-card"><span>Aktivni prace</span><strong>{assignedTasks.length}</strong><p>{actionTasks.length ? `${actionTasks.length} zakazka potrebuje dalsi krok.` : "Zadne urgentni kroky."}</p></article>
          <article className="metric-card"><span>Odeslane nabidky</span><strong>{pendingOffers.length}</strong><p>{pendingOffers.length ? "Cekaji na rozhodnuti klienta." : "Zatim nic neceka."}</p></article>
          <article className="metric-card"><span>Odhad vydelku</span><strong>{formatCzk(estimatedEarnings)}</strong><p>Souhrn vybranych nabidek pred finalnim Stripe tokem.</p></article>
        </section>

        <section className="dashboard-tabs" aria-label="Rychle sekce">
          <a href="#aktivni-prace">Aktivni prace</a>
          <a href="#dostupne-ukoly">Dostupne ukoly</a>
          <a href="#nabidky">Nabidky</a>
          <a href="#vyplaty">Vyplaty</a>
          <a href="#profil">Profil</a>
        </section>

        <section className="section dashboard-section" id="aktivni-prace">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Moje zakazky</p><h2>Aktivni prace</h2><p>Jakmile vas klient vybere, zakazka se objevi tady. Dalsi kroky se resi na detailu objednavky.</p></div>
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Stav overeni</h3><p>{profile?.verified ? "Overeny tasker. Profil muze byt zvyraznen v marketplace." : "Profil ceka na overeni. Doplneny profil zvysi duveru klientu."}</p></article>
            <article className="dashboard-panel"><h3>Dokonceni profilu</h3><p>{completion}% hotovo. Doplne bio, foto, kontakt a kategorie sluzeb.</p></article>
            <article className="dashboard-panel"><h3>Zpravy</h3><p>{unreadTotal ? `${unreadTotal} novych zprav v aktivnich zakazkach.` : "Zadne nove zpravy."}</p></article>
          </div>

          {assignedTasks.length > 0 ? (
            <div className={dashboardListStyles.compactList}>
              {assignedTasks.map((task) => (
                <article className={dashboardListStyles.compactItem} key={task.id}>
                  <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                  <p className={dashboardListStyles.itemText}>{task.city} · {task.desired_time} · stav: {statusLabels[task.status] ?? task.status}</p>
                  <p className={dashboardListStyles.itemText}>{nextStepCopy[task.status] ?? "Otevrete detail objednavky."} · {unreadCounts[task.id] || 0} novych zprav</p>
                  <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>Otevrit objednavku</a></div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><h3>Zatim zadna aktivni zakazka</h3><p>Poslete nabidku na vhodny ukol. Pokud si vas klient vybere, zakazka se presune sem.</p><a className="button primary" href="#dostupne-ukoly">Projit ukoly</a></div>}
        </section>

        {waitingTasks.length ? (
          <section className="section dashboard-section">
            <div className="section-title"><p className="kicker">Potvrzeni</p><h2>Ceka se na klienta</h2></div>
            <div className={dashboardListStyles.compactList}>
              {waitingTasks.map((task) => (
                <article className={dashboardListStyles.compactItem} key={task.id}>
                  <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                  <p className={dashboardListStyles.itemText}>Prace je oznacena jako hotova. Klient ted potvrzuje dokonceni.</p>
                  <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>Otevrit objednavku</a></div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section dashboard-section" id="dostupne-ukoly">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Dostupne ukoly</p><h2>Poslete nabidku klientovi</h2><p>Ukoly, na ktere jste uz odpovedeli, se schovaji a objevi se v sekci vasich nabidek.</p></div>
            <a className="button secondary" href="/tasks">Verejny marketplace</a>
          </div>
          {availableTasks.length > 0 ? <div className="task-grid">{availableTasks.map((task) => <TaskCard key={task.id} task={task} offers={allOffers.filter((offer) => offer.task_id === task.id)} />)}</div> : <div className="empty-state"><h3>Zadne nove ukoly</h3><p>Bud nejsou zadne otevrene poptavky, nebo jste uz na vsechny dostupne ukoly poslali nabidku.</p></div>}
        </section>

        <section className="section dashboard-section" id="nabidky">
          <div className="section-title"><p className="kicker">Moje nabidky</p><h2>Odeslane nabidky</h2><p>Klient si taskera vybira samostatne podle ceny, zpravy, profilu a domluvy.</p></div>
          {myOffers.length > 0 ? (
            <div className={dashboardListStyles.compactList}>
              {myOffers.map((offer) => (
                <article className={`${dashboardListStyles.compactItem} ${dashboardListStyles.offerItem}`} key={offer.id}>
                  <strong className={dashboardListStyles.itemTitle}>{formatCzk(offer.price_czk)}</strong>
                  <p className={dashboardListStyles.itemText}>{offer.message} · stav: {offerStatusLabels[offer.status] ?? offer.status}</p>
                  <div className={dashboardListStyles.itemActions}>
                    <a className="button secondary" href={`/ukol/${offer.task_id}`}>Detail objednavky</a>
                    {offer.status === "pending" ? (
                      <form action={withdrawTaskerOffer}>
                        <input type="hidden" name="offer_id" value={offer.id} />
                        <button className="button secondary" type="submit">Stahnout nabidku</button>
                      </form>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><h3>Zatim bez nabidek</h3><p>Vyberte ukol vyse a poslete prvni nabidku.</p></div>}
        </section>

        <section className="section dashboard-section" id="vyplaty">
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Vyplaty</h3><p>{completedTasks.length ? `Dokoncene zakazky: ${completedTasks.length}. Vyplatni tok pripojime po Stripe.` : "Vyplaty budou dostupne po prvni dokoncene a potvrzene zakazce."}</p></article>
            <article className="dashboard-panel"><h3>Provize</h3><p>Pilotni uroven: standardni provize Taskovo. Presne sazby doplnime pred spustenim plateb.</p></article>
            <article className="dashboard-panel"><h3>Pravni role</h3><p>Tasker je nezavisly OSVC nebo firma. Taskovo praci nezamestnava ani primo neposkytuje.</p></article>
          </div>
        </section>

        <section className="section admin-panel" id="profil">
          <div className="section-title">
            <p className="kicker">Profil taskera</p>
            <h2>Pracovni udaje</h2>
            <p>Tyto informace vidi klienti v marketplace a v nabidkach. Overeni profilu nastavuje pouze administrator.</p>
          </div>
          <form className="compact-form" action={updateTaskerOwnProfile}>
            <label>Jmeno<input name="name" type="text" defaultValue={profile?.name || user.user_metadata?.name || ""} required /></label>
            <label>Prihlasovaci email<input type="email" defaultValue={user.email || ""} disabled /></label>
            <label>Mesto<input name="city" type="text" defaultValue={profile?.city || ""} required /></label>
            <label>Kategorie<input name="categories" type="text" defaultValue={profile?.categories || ""} placeholder="Uklid, stehovani, montaz..." required /></label>
            <label>Kontakt pro klienty<input name="contact" type="text" defaultValue={profile?.contact || user.email || ""} /></label>
            <label>Stav overeni<input type="text" defaultValue={profile?.verified ? "Overeny tasker" : "Ceka na overeni"} disabled /></label>
            <label className="span-full">Bio<textarea name="bio" rows={4} defaultValue={profile?.bio || ""} placeholder="Kratce popiste zkusenosti, dostupnost a typicke sluzby." /></label>
            <button className="button primary span-full" type="submit">Ulozit profil taskera</button>
          </form>

          <section className="section-action">
            <div className="section-title"><p className="kicker">Foto profilu</p><h2>Profilova fotka</h2><p>Fotka se verejne zobrazi na karte taskera az po kontrole administratorem.</p></div>
            <div className="dashboard-grid">
              <article className="dashboard-panel"><h3>Schvalena fotka</h3>{profile?.avatar_url ? <img className="avatar brand-mark-large" src={profile.avatar_url} alt="Schvalena profilova fotka" /> : <p>Schvalena fotka zatim neni nastavena.</p>}</article>
              <article className="dashboard-panel"><h3>Ceka na kontrolu</h3>{profile?.pending_avatar_url ? <img className="avatar brand-mark-large" src={profile.pending_avatar_url} alt="Fotka cekajici na kontrolu" /> : <p>Zadna nova fotka neceka na kontrolu.</p>}</article>
              <article className="dashboard-panel"><h3>Stav</h3><p>{photoStatusCopy[photoStatus] || photoStatus}</p>{profile?.avatar_review_note ? <p>{profile.avatar_review_note}</p> : null}</article>
            </div>
            <ProfilePhotoUploadForm />
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
