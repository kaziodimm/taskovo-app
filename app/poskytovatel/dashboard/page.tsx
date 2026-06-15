import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { updateTaskerOwnProfile } from "@/app/profile-actions";
import { withdrawTaskerOffer } from "@/app/tasker-offer-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfilePhotoStatus } from "@/components/ProfilePhotoStatus";
import { ProfilePhotoUploadForm } from "@/components/ProfilePhotoUploadForm";
import { TaskCard } from "@/components/TaskCard";
import dashboardListStyles from "@/components/DashboardList.module.css";
import { getAccountContext } from "@/lib/account";
import { getAssignedTasksForTasker, getOffers, getOffersForTasker, getOpenTasksForTaskers } from "@/lib/data";
import { getUnreadTaskMessageCounts } from "@/lib/message-data";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Task, TaskerProfile } from "@/lib/types";

const statusLabels: Record<string, string> = {
  assigned: "Tasker vybrán",
  in_progress: "Probíhá",
  awaiting_confirmation: "Čeká na klienta",
  completed: "Hotovo",
  cancelled: "Zrušeno",
  disputed: "Spor",
};

const offerStatusLabels: Record<string, string> = {
  pending: "Čeká na klienta",
  accepted: "Vybráno klientem",
  declined: "Odmítnuto",
  withdrawn: "Staženo",
};

const nextStepCopy: Record<string, string> = {
  assigned: "Začněte práci, až máte s klientem domluvené detaily.",
  in_progress: "Po dokončení označte práci jako hotovou.",
  awaiting_confirmation: "Čeká se na potvrzení klienta.",
  completed: "Objednávka je dokončena.",
  cancelled: "Objednávka je zrušena.",
  disputed: "Objednávka je ve sporu. Sledujte zprávy a vyčkejte na další krok.",
};

const updateMessages: Record<string, string> = {
  offer_sent: "Nabídka byla odeslána klientovi.",
  offer_withdrawn: "Nabídka byla stažena.",
  profile: "Profil taskera byl uložen.",
  photo_uploaded: "Fotka byla odeslána ke kontrole administrátorem.",
};

const errorMessages: Record<string, string> = {
  profile_required: "Nejdřív doplňte tasker profil.",
  profile_missing: "Nejdřív uložte profil taskera, potom nahrajte fotku.",
  config: "Chybí konfigurace služby. Zkontrolujeme nastavení Supabase.",
  forbidden: "K této akci nemáte oprávnění.",
  bad_file: "Vyberte fotku ve formátu JPG, PNG nebo WebP.",
  file_too_large: "Fotka je příliš velká. Maximální velikost je 5 MB.",
};

function needsTaskerAction(task: Task) {
  return task.status === "assigned" || task.status === "in_progress" || task.status === "disputed";
}

function formatCzk(amount: number) {
  return `${amount.toLocaleString("cs-CZ")} Kč`;
}

function profileCompletion(profile: TaskerProfile | null) {
  const checks = [profile?.name, profile?.city, profile?.categories, profile?.contact, profile?.bio, profile?.avatar_url, profile?.verified];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export default async function ProviderDashboardPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  const account = await getAccountContext(user);
  if (account.role === "admin") redirect("/admin");
  if (account.role === "client") redirect("/dashboard");
  if (account.role !== "tasker") redirect("/prihlaseni?mode=login&error=account_profile");

  const profile = account.taskerProfile;
  const [openTasks, allOffers, myOffers, assignedTasks] = await Promise.all([
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
  const completion = profileCompletion(profile);
  const estimatedEarnings = acceptedOffers.reduce((total, offer) => total + offer.price_czk, 0);
  const possiblePipeline = availableTasks.reduce((total, task) => total + (task.budget_czk || 0), 0);
  const notice = params.updated ? updateMessages[params.updated] : null;
  const error = params.error ? errorMessages[params.error] || "Akci se nepodařilo dokončit." : null;

  return (
    <>
      <Header />
      <main className="page-shell dashboard-shell">
        <section className="dashboard-hero">
          <div>
            <p className="kicker">Dashboard taskera</p>
            <h1 className="page-title">{profile?.name || account.displayName || "Tasker"}</h1>
            <p className="hero-lead">Sledujte dostupné úkoly, aktivní zakázky, nabídky, výplaty a stav ověření profilu.</p>
          </div>
          <div className="dashboard-hero-actions">
            <a className="button primary" href="#dostupne-ukoly">Najít úkol</a>
            <a className="button secondary" href="/pro-taskery">Jak vydělávat</a>
          </div>
        </section>

        {notice ? <p className="success-box">{notice}</p> : null}
        {error ? <p className="alert-box">{error}</p> : null}

        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlásit se</button></form>

        <section className="dashboard-overview" aria-label="Přehled taskera">
          <article className="metric-card metric-card-primary"><span>Dostupné úkoly</span><strong>{availableTasks.length}</strong><p>Odhad rozpočtu v okolí: {formatCzk(possiblePipeline)}.</p></article>
          <article className="metric-card"><span>Aktivní práce</span><strong>{assignedTasks.length}</strong><p>{actionTasks.length ? `${actionTasks.length} zakázka potřebuje další krok.` : "Žádné urgentní kroky."}</p></article>
          <article className="metric-card"><span>Odeslané nabídky</span><strong>{pendingOffers.length}</strong><p>{pendingOffers.length ? "Čekají na rozhodnutí klienta." : "Zatím nic nečeká."}</p></article>
          <article className="metric-card"><span>Odhad výdělku</span><strong>{formatCzk(estimatedEarnings)}</strong><p>Souhrn vybraných nabídek. Výplatní tok bude aktivní po spuštění platebního partnera.</p></article>
        </section>

        <section className="dashboard-tabs" aria-label="Rychlé sekce">
          <a href="#aktivni-prace">Aktivní práce</a>
          <a href="#dostupne-ukoly">Dostupné úkoly</a>
          <a href="#nabidky">Nabídky</a>
          <a href="#vyplaty">Výplaty</a>
          <a href="#profil">Profil</a>
        </section>

        <section className="section dashboard-section" id="aktivni-prace">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Moje zakázky</p><h2>Aktivní práce</h2><p>Jakmile vás klient vybere, zakázka se objeví tady. Další kroky se řeší na detailu objednávky.</p></div>
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Stav ověření</h3><p>{profile?.verified ? "Ověřený tasker. Profil může být zvýrazněn v marketplace." : "Profil čeká na ověření. Doplněný profil zvýší důvěru klientů."}</p></article>
            <article className="dashboard-panel"><h3>Dokončení profilu</h3><p>{completion}% hotovo. Doplňte bio, foto, kontakt a kategorie služeb.</p></article>
            <article className="dashboard-panel"><h3>Zprávy</h3><p>{unreadTotal ? `${unreadTotal} nových zpráv v aktivních zakázkách.` : "Žádné nové zprávy."}</p></article>
          </div>

          {assignedTasks.length > 0 ? (
            <div className={dashboardListStyles.compactList}>
              {assignedTasks.map((task) => (
                <article className={dashboardListStyles.compactItem} key={task.id}>
                  <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                  <p className={dashboardListStyles.itemText}>{task.city} · {task.desired_time} · stav: {statusLabels[task.status] ?? task.status}</p>
                  <p className={dashboardListStyles.itemText}>{nextStepCopy[task.status] ?? "Otevřete detail objednávky."} · {unreadCounts[task.id] || 0} nových zpráv</p>
                  <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>Otevřít objednávku</a></div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><h3>Zatím žádná aktivní zakázka</h3><p>Pošlete nabídku na vhodný úkol. Pokud si vás klient vybere, zakázka se přesune sem.</p><a className="button primary" href="#dostupne-ukoly">Projít úkoly</a></div>}
        </section>

        {waitingTasks.length ? (
          <section className="section dashboard-section">
            <div className="section-title"><p className="kicker">Potvrzení</p><h2>Čeká se na klienta</h2></div>
            <div className={dashboardListStyles.compactList}>
              {waitingTasks.map((task) => (
                <article className={dashboardListStyles.compactItem} key={task.id}>
                  <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                  <p className={dashboardListStyles.itemText}>Práce je označená jako hotová. Klient teď potvrzuje dokončení.</p>
                  <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>Otevřít objednávku</a></div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section dashboard-section" id="dostupne-ukoly">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Dostupné úkoly</p><h2>Pošlete nabídku klientovi</h2><p>Úkoly, na které jste už odpověděli, se schovají a objeví se v sekci vašich nabídek.</p></div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>
          {availableTasks.length > 0 ? <div className="task-grid">{availableTasks.map((task) => <TaskCard key={task.id} task={task} offers={allOffers.filter((offer) => offer.task_id === task.id)} showOfferForm authenticatedTasker />)}</div> : <div className="empty-state"><h3>Žádné nové úkoly</h3><p>Buď nejsou žádné otevřené poptávky, nebo jste už na všechny dostupné úkoly poslali nabídku.</p></div>}
        </section>

        <section className="section dashboard-section" id="nabidky">
          <div className="section-title"><p className="kicker">Moje nabídky</p><h2>Odeslané nabídky</h2><p>Klient si taskera vybírá samostatně podle ceny, zprávy, profilu a domluvy.</p></div>
          {myOffers.length > 0 ? (
            <div className={dashboardListStyles.compactList}>
              {myOffers.map((offer) => (
                <article className={`${dashboardListStyles.compactItem} ${dashboardListStyles.offerItem}`} key={offer.id}>
                  <strong className={dashboardListStyles.itemTitle}>{formatCzk(offer.price_czk)}</strong>
                  <p className={dashboardListStyles.itemText}>{offer.message} · stav: {offerStatusLabels[offer.status] ?? offer.status}</p>
                  <div className={dashboardListStyles.itemActions}>
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
          ) : <div className="empty-state"><h3>Zatím bez nabídek</h3><p>Vyberte úkol výše a pošlete první nabídku.</p><a className="button primary" href="#dostupne-ukoly">Najít první úkol</a></div>}
        </section>

        <section className="section dashboard-section" id="vyplaty">
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Výplaty</h3><p>{completedTasks.length ? `Dokončené zakázky: ${completedTasks.length}. Výplatní tok bude aktivní po spuštění platebního partnera.` : "Výplaty budou dostupné po první dokončené a potvrzené zakázce."}</p></article>
            <article className="dashboard-panel"><h3>Provize</h3><p>Přesné podmínky se zobrazí před odeslání nabídky a před potvrzením objednávky klientem.</p></article>
            <article className="dashboard-panel"><h3>Právní role</h3><p>Tasker je nezávislý OSVČ nebo firma. Taskovo práci nezaměstnává ani přímo neposkytuje.</p></article>
          </div>
        </section>

        <section className="section admin-panel" id="profil">
          <div className="section-title">
            <p className="kicker">Profil taskera</p>
            <h2>Pracovní údaje</h2>
            <p>Tyto informace vidí klienti v marketplace a v nabídkách. Ověření profilu nastavuje pouze administrátor.</p>
          </div>
          <form className="compact-form" action={updateTaskerOwnProfile}>
            <label>Jméno<input name="name" type="text" defaultValue={profile?.name || account.displayName || ""} required /></label>
            <label>Přihlašovací email<input type="email" defaultValue={user.email || ""} disabled /></label>
            <label>Město<input name="city" type="text" defaultValue={profile?.city || ""} required /></label>
            <label>Kategorie<input name="categories" type="text" defaultValue={profile?.categories || ""} placeholder="Úklid, stěhování, montáž..." required /></label>
            <label>Kontakt pro klienty<input name="contact" type="text" defaultValue={profile?.contact || user.email || ""} /></label>
            <label>Stav ověření<input type="text" defaultValue={profile?.verified ? "Ověřený tasker" : "Čeká na ověření"} disabled /></label>
            <label className="span-full">Bio<textarea name="bio" rows={4} defaultValue={profile?.bio || ""} placeholder="Krátce popište zkušenosti, dostupnost a typické služby." /></label>
            <button className="button primary span-full" type="submit">Uložit profil taskera</button>
          </form>

          <section className="section-action">
            <div className="section-title"><p className="kicker">Foto profilu</p><h2>Profilová fotka</h2><p>Fotka se veřejně zobrazí na kartě taskera až po kontrole administrátorem.</p></div>
            <ProfilePhotoStatus
              avatarUrl={profile?.avatar_url}
              pendingAvatarUrl={profile?.pending_avatar_url}
              status={profile?.avatar_review_status}
              note={profile?.avatar_review_note}
              roleLabel="taskera"
            />
            <ProfilePhotoUploadForm />
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
