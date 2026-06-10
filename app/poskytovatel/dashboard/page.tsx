import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { updateTaskerOwnProfile } from "@/app/profile-actions";
import { withdrawTaskerOffer } from "@/app/tasker-offer-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfilePhotoUploadForm } from "@/components/ProfilePhotoUploadForm";
import { TaskCard } from "@/components/TaskCard";
import { getAssignedTasksForTasker, getOffers, getOffersForTasker, getOpenTasksForTaskers, getTaskerProfileForUser } from "@/lib/data";
import { getUnreadTaskMessageCounts } from "@/lib/message-data";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Task } from "@/lib/types";

const statusLabels: Record<string, string> = {
  assigned: "Tasker vybrán",
  in_progress: "Probíhá",
  awaiting_confirmation: "Čeká na klienta",
  completed: "Hotovo",
};

const offerStatusLabels: Record<string, string> = {
  pending: "Čeká na klienta",
  accepted: "Vybráno klientem",
  declined: "Odmítnuto",
};

const nextStepCopy: Record<string, string> = {
  assigned: "Začněte práci, až máte s klientem domluvené detaily.",
  in_progress: "Po dokončení označte práci jako hotovou.",
  awaiting_confirmation: "Čeká se na potvrzení klienta.",
  completed: "Objednávka je dokončená.",
};

const photoStatusCopy: Record<string, string> = {
  none: "Zatím bez fotky ke kontrole.",
  pending: "Nová fotka čeká na schválení administrátorem.",
  approved: "Fotka je schválená a může se zobrazovat v profilu taskera.",
  rejected: "Fotka byla odmítnutá. Můžete poslat novou.",
};

function needsTaskerAction(task: Task) {
  return task.status === "assigned" || task.status === "in_progress";
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
  const unreadTotal = Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  const photoStatus = profile?.avatar_review_status || "none";

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Dashboard taskera</p>
            <h1 className="page-title">{profile?.name || user.user_metadata?.name || "Tasker"}</h1>
            <p className="hero-lead">Vidíte dostupné úkoly, své aktivní zakázky a odeslané nabídky.</p>
          </div>
          <div className="page-hero-card"><strong>{assignedTasks.length}</strong><p>aktivních zakázek · {availableTasks.length} dostupných úkolů</p></div>
        </section>
        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlásit se</button></form>

        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Můj profil</h3><p>{profile?.categories || "Doplňte kategorie služeb v profilu taskera."}</p></article>
          <article className="dashboard-panel"><h3>Čeká na vás</h3><p>{actionTasks.length ? `${actionTasks.length} zakázka potřebuje další krok.` : "Momentálně není potřeba žádná akce."}</p></article>
          <article className="dashboard-panel"><h3>Nové zprávy</h3><p>{unreadTotal ? `${unreadTotal} nových zpráv v aktivních zakázkách.` : "Žádné nové zprávy."}</p></article>
        </div>

        <section className="section admin-panel">
          <div className="section-title">
            <p className="kicker">Profil taskera</p>
            <h2>Pracovní údaje</h2>
            <p>Tyto informace vidí klienti v marketplace a v nabídkách. Ověření profilu nastavuje pouze administrátor.</p>
          </div>
          <form className="compact-form" action={updateTaskerOwnProfile}>
            <label>Jméno<input name="name" type="text" defaultValue={profile?.name || user.user_metadata?.name || ""} required /></label>
            <label>Přihlašovací email<input type="email" defaultValue={user.email || ""} disabled /></label>
            <label>Město<input name="city" type="text" defaultValue={profile?.city || ""} required /></label>
            <label>Kategorie<input name="categories" type="text" defaultValue={profile?.categories || ""} placeholder="Úklid, stěhování, montáž..." required /></label>
            <label>Kontakt pro klienty<input name="contact" type="text" defaultValue={profile?.contact || user.email || ""} /></label>
            <label>Stav ověření<input type="text" defaultValue={profile?.verified ? "Ověřený tasker" : "Čeká na ověření"} disabled /></label>
            <label className="span-full">Bio<textarea name="bio" rows={4} defaultValue={profile?.bio || ""} placeholder="Krátce popište zkušenosti, dostupnost a typické služby." /></label>
            <button className="button primary span-full" type="submit">Uložit profil taskera</button>
          </form>

          <section className="section-action">
            <div className="section-title">
              <p className="kicker">Foto profilu</p>
              <h2>Profilová fotka</h2>
              <p>Fotka se veřejně zobrazí na kartě taskera až po kontrole administrátorem.</p>
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

        <section className="section">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Moje zakázky</p><h2>Aktivní práce</h2><p>Jakmile vás klient vybere, zakázka se objeví tady. Další kroky se řeší na detailu objednávky.</p></div>
          </div>
          {assignedTasks.length > 0 ? (
            <div className="admin-list">
              {assignedTasks.map((task) => (
                <article className="admin-item" key={task.id}>
                  <strong>{task.title}</strong>
                  <p>{task.city} · {task.desired_time} · stav: {statusLabels[task.status] ?? task.status}</p>
                  <p>{nextStepCopy[task.status] ?? "Otevřete detail objednávky."} · {unreadCounts[task.id] || 0} nových zpráv</p>
                  <a className="button secondary" href={`/ukol/${task.id}`}>Otevřít objednávku</a>
                </article>
              ))}
            </div>
          ) : <div className="dashboard-panel"><h3>Zatím žádná aktivní zakázka</h3><p>Až si klient vybere vaši nabídku, uvidíte ji v této sekci.</p></div>}
        </section>

        {waitingTasks.length ? (
          <section className="section">
            <div className="section-title"><p className="kicker">Potvrzení</p><h2>Čeká se na klienta</h2></div>
            <div className="admin-list">
              {waitingTasks.map((task) => (
                <article className="admin-item" key={task.id}>
                  <strong>{task.title}</strong>
                  <p>Práce je označená jako hotová. Klient teď potvrzuje dokončení.</p>
                  <a className="button secondary" href={`/ukol/${task.id}`}>Otevřít objednávku</a>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Dostupné úkoly</p><h2>Pošlete nabídku klientovi</h2><p>Úkoly, na které jste už odpověděli, se zde schovají a objeví se v sekci vašich nabídek.</p></div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>
          {availableTasks.length > 0 ? <div className="task-grid">{availableTasks.map((task) => <TaskCard key={task.id} task={task} offers={allOffers.filter((offer) => offer.task_id === task.id)} />)}</div> : <div className="dashboard-panel"><h3>Žádné nové úkoly</h3><p>Buď nejsou žádné otevřené poptávky, nebo jste už na všechny dostupné úkoly poslali nabídku.</p></div>}
        </section>

        <section className="section">
          <div className="section-title"><p className="kicker">Moje nabídky</p><h2>Odeslané nabídky</h2></div>
          {myOffers.length > 0 ? (
            <div className="admin-list">
              {myOffers.map((offer) => (
                <article className="admin-item" key={offer.id}>
                  <strong>{offer.price_czk.toLocaleString("cs-CZ")} Kč</strong>
                  <p>{offer.message} · stav: {offerStatusLabels[offer.status] ?? offer.status}</p>
                  <div className="hero-actions">
                    <a className="button secondary" href={`/ukol/${offer.task_id}`}>Detail objednávky</a>
                    {offer.status === "pending" ? (
                      <form action={withdrawTaskerOffer}>
                        <input type="hidden" name="offer_id" value={offer.id} />
                        <button className="button secondary" type="submit">Stáhnout nabídku</button>
                      </form>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="dashboard-panel"><h3>Zatím bez nabídek</h3><p>Vyberte úkol výše a pošlete první nabídku.</p></div>}
        </section>
      </main>
      <Footer />
    </>
  );
}
