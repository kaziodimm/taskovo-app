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
import type { Task } from "@/lib/types";

const nextStepCopy: Record<string, string> = {
  open: "Čeká na nabídky od taskerů.",
  offers_received: "Vyberte taskera z doručených nabídek.",
  assigned: "Tasker je vybraný. Domluvte detaily v objednávce.",
  in_progress: "Tasker pracuje. Sledujte zprávy a detail objednávky.",
  awaiting_confirmation: "Tasker označil práci jako hotovou. Potvrďte dokončení.",
  completed: "Objednávka je dokončená.",
  cancelled: "Objednávka je zrušená.",
};

const photoStatusCopy: Record<string, string> = {
  none: "Zatím bez fotky ke kontrole.",
  pending: "Nová fotka čeká na schválení administrátorem.",
  approved: "Fotka je schválená a může se zobrazovat v profilu.",
  rejected: "Fotka byla odmítnutá. Můžete poslat novou.",
};

function needsClientAction(task: Task, offerCount: number) {
  return (task.status === "offers_received" && offerCount > 0) || task.status === "awaiting_confirmation";
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
  const offersByTask = new Map<string, number>();
  offers.forEach((offer) => offersByTask.set(offer.task_id, (offersByTask.get(offer.task_id) || 0) + 1));
  const actionTasks = tasks.filter((task) => needsClientAction(task, offersByTask.get(task.id) || 0));
  const activeTasks = tasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));
  const unreadTotal = Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  const photoStatus = profile?.avatar_review_status || "none";

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Klientský dashboard</p>
            <h1 className="page-title">Vítejte, {displayName}</h1>
            <p className="hero-lead">Tady budou vaše úkoly, nabídky od taskerů a zprávy. Nové úkoly se už ukládají přímo k vašemu účtu.</p>
          </div>
          <div className="page-hero-card"><strong>{tasks.length}</strong><p>vašich úkolů · {actionTasks.length} čeká na vás</p></div>
        </section>
        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlásit se</button></form>

        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Čeká na vás</h3><p>{actionTasks.length ? `${actionTasks.length} objednávka vyžaduje rozhodnutí.` : "Momentálně není potřeba žádná akce."}</p></article>
          <article className="dashboard-panel"><h3>Nové zprávy</h3><p>{unreadTotal ? `${unreadTotal} nových zpráv v objednávkách.` : "Žádné nové zprávy."}</p></article>
          <article className="dashboard-panel"><h3>Aktivní práce</h3><p>{activeTasks.length ? `${activeTasks.length} zakázka právě běží nebo čeká na potvrzení.` : "Zatím žádná aktivní zakázka."}</p></article>
        </div>

        <section className="section admin-panel">
          <div className="section-title">
            <p className="kicker">Můj profil</p>
            <h2>Kontaktní údaje klienta</h2>
            <p>Tyto údaje používáme pro vaše objednávky a komunikaci s podporou. Přihlašovací email zatím zůstává stejný.</p>
          </div>
          <form className="compact-form" action={updateClientOwnProfile}>
            <label>Jméno<input name="name" type="text" defaultValue={profile?.name || user.user_metadata?.name || ""} required /></label>
            <label>Přihlašovací email<input type="email" defaultValue={user.email || ""} disabled /></label>
            <label>Telefon<input name="phone" type="text" defaultValue={profile?.phone || ""} placeholder="+420..." /></label>
            <label>Město<input name="city" type="text" defaultValue={profile?.city || ""} placeholder="Praha, Plzeň, Tábor..." /></label>
            <label>Jazyk<select name="preferred_language" defaultValue={profile?.preferred_language || "cs"}><option value="cs">Čeština</option><option value="en">English</option><option value="uk">Українська</option><option value="ru">Русский</option></select></label>
            <label className="checkbox-row"><input name="marketing_consent" type="checkbox" defaultChecked={Boolean(profile?.marketing_consent)} /> Novinky a tipy od Taskovo</label>
            <button className="button primary span-full" type="submit">Uložit profil</button>
          </form>

          <section className="section-action">
            <div className="section-title">
              <p className="kicker">Foto profilu</p>
              <h2>Profilová fotka</h2>
              <p>Fotka se veřejně zobrazí až po kontrole administrátorem.</p>
            </div>
            <div className="dashboard-grid">
              <article className="dashboard-panel">
                <h3>Schválená fotka</h3>
                {profile?.avatar_url ? <img className="avatar brand-mark-large" src={profile.avatar_url} alt="Schválená profilová fotka" /> : <p>Schválená fotka zatím není nastavená.</p>}
              </article>
              <article className="dashboard-panel">
                <h3>Čeká na kontrolu</h3>
                {profile?.pending_avatar_url ? <img className="avatar brand-mark-large" src={profile.pending_avatar_url} alt="Fotka čekající na kontrolu" /> : <p>Žádná nová fotka nečeká na kontrolu.</p>}
              </article>
              <article className="dashboard-panel">
                <h3>Stav</h3>
                <p>{photoStatusCopy[photoStatus] || photoStatus}</p>
                {profile?.avatar_review_note ? <p>{profile.avatar_review_note}</p> : null}
              </article>
            </div>
            <ProfilePhotoUploadForm />
          </section>
        </section>

        {actionTasks.length ? (
          <section className="section">
            <div className="section-title"><p className="kicker">Priorita</p><h2>Čeká na vás</h2></div>
            <div className={dashboardListStyles.compactList}>
              {actionTasks.map((task) => (
                <article className={dashboardListStyles.compactItem} key={task.id}>
                  <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                  <p className={dashboardListStyles.itemText}>{nextStepCopy[task.status] ?? "Otevřete detail objednávky."} · {offersByTask.get(task.id) || 0} nabídek · {unreadCounts[task.id] || 0} nových zpráv</p>
                  <div className={dashboardListStyles.itemActions}>
                    <a className="button secondary" href={`/ukol/${task.id}`}>Otevřít objednávku</a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section split dashboard-create-section">
          <div className="section-title">
            <p className="kicker">Rychlé zadání</p>
            <h2>Vytvořte nový úkol</h2>
            <p>Po odeslání se úkol automaticky objeví v tomto dashboardu. Taskerům ho potom zobrazíme v marketplace.</p>
          </div>
          <TaskForm />
        </section>

        <section className="section">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Moje úkoly</p>
              <h2>Poptávky navázané na váš účet</h2>
            </div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>
          {tasks.length > 0 ? (
            <div className="task-grid">
              {tasks.map((task) => <TaskCard key={task.id} task={task} offers={offers.filter((offer) => offer.task_id === task.id)} canSelectOffer showOfferForm={false} canManageTask />)}
            </div>
          ) : (
            <div className="dashboard-panel"><h3>Zatím nemáte žádný úkol</h3><p>Vyplňte rychlé zadání výše. První úkol je nejlepší test celého toku.</p></div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
