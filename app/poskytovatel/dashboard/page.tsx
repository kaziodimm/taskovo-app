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

function nextActionCopy(completion: number, offerCount: number, pendingCount: number) {
  if (completion < 85) {
    return {
      title: "Doplňte profil a zvyšte šanci na první zakázku.",
      text: "Klienti se rozhodují podle důvěry. Přidejte bio, kontakt, kategorie, fotku a pracujte na ověření profilu.",
      href: "#profil",
      cta: "Doplnit profil",
    };
  }

  if (offerCount === 0) {
    return {
      title: "Pošlete první nabídku a začněte budovat reputaci.",
      text: "Vyberte úkol, který opravdu zvládnete, napište jasnou cenu a ukažte klientovi, proč si má vybrat právě vás.",
      href: "#dostupne-ukoly",
      cta: "Najít první úkol",
    };
  }

  if (pendingCount > 0) {
    return {
      title: "Vaše nabídky čekají na rozhodnutí klientů.",
      text: "Sledujte zprávy, reagujte rychle a udržujte profesionální komunikaci. Každá dobrá domluva pomáhá reputaci.",
      href: "#nabidky",
      cta: "Zkontrolovat nabídky",
    };
  }

  return {
    title: "Pokračujte v získávání zákazníků a budování reputace.",
    text: "Pracujete sami za sebe. Vybírejte vhodné úkoly, posílejte vlastní nabídky a zlepšujte profil po každé zkušenosti.",
    href: "#dostupne-ukoly",
    cta: "Hledat nové příležitosti",
  };
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
  const nextAction = nextActionCopy(completion, myOffers.length, pendingOffers.length);

  return (
    <>
      <Header />
      <main className="page-shell dashboard-shell">
        <section className="dashboard-hero">
          <div>
            <p className="kicker">Dashboard taskera</p>
            <h1 className="page-title">{profile?.name || account.displayName || "Tasker"}</h1>
            <p className="hero-lead">Váš pracovní kokpit pro získávání zákazníků, vlastní nabídky, aktivní práci, reputaci a výdělky na Taskovo.</p>
          </div>
          <div className="dashboard-hero-actions">
            <a className="button primary" href="#dostupne-ukoly">Najít úkol</a>
            <a className="button secondary" href="/pro-taskery">Jak získávat zákazníky</a>
          </div>
        </section>

        {notice ? <p className="success-box">{notice}</p> : null}
        {error ? <p className="alert-box">{error}</p> : null}

        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlásit se</button></form>

        <section className="section dashboard-section" aria-label="Růst taskera">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Váš růst na Taskovo</p><h2>Budujte malé podnikání krok za krokem</h2><p>Taskovo vám může pomoct získat zákazníky, posílat vlastní nabídky a budovat reputaci jako nezávislý tasker.</p></div>
          </div>
          <div className="dashboard-overview">
            <article className="metric-card metric-card-primary"><span>Dokončení profilu</span><strong>{completion}%</strong><p>Silný profil zvyšuje důvěru klienta před první zprávou.</p></article>
            <article className="metric-card"><span>Nové příležitosti</span><strong>{availableTasks.length}</strong><p>Odhad rozpočtu v okolí: {formatCzk(possiblePipeline)}.</p></article>
            <article className="metric-card"><span>Odeslané nabídky</span><strong>{myOffers.length}</strong><p>{pendingOffers.length} čeká na rozhodnutí klientů.</p></article>
            <article className="metric-card"><span>Aktivní práce</span><strong>{assignedTasks.length}</strong><p>{actionTasks.length ? `${actionTasks.length} zakázka potřebuje další krok.` : "Žádné urgentní kroky."}</p></article>
            <article className="metric-card"><span>Odhad výdělku</span><strong>{formatCzk(estimatedEarnings)}</strong><p>Souhrn vybraných nabídek. Výplata se uvolní po potvrzení dokončení.</p></article>
            <article className="metric-card"><span>Reputace</span><strong>{completedTasks.length}</strong><p>Dokončené zakázky pomáhají získat další zákazníky.</p></article>
          </div>
        </section>

        <section className="priority-panel" aria-label="Doporučený další krok">
          <div><p className="kicker">Další nejlepší krok</p><h3>{nextAction.title}</h3><p>{nextAction.text}</p></div>
          <a className="button primary" href={nextAction.href}>{nextAction.cta}</a>
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
            <div className="section-title"><p className="kicker">Moje zakázky</p><h2>Aktivní práce</h2><p>Jakmile si vás klient vybere, zakázka se objeví tady. Další kroky se řeší na detailu objednávky.</p></div>
          </div>

          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Stav ověření</h3><p>{profile?.verified ? "Ověřený tasker. Profil může působit důvěryhodněji v marketplace." : "Profil čeká na ověření. Doplněný profil zvyšuje důvěru klientů."}</p></article>
            <article className="dashboard-panel"><h3>Profil jako výloha</h3><p>{completion}% hotovo. Doplňte bio, foto, kontakt a kategorie, aby klient rychle pochopil, co umíte.</p></article>
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
          ) : <div className="empty-state"><h3>Zatím žádná aktivní zakázka</h3><p>Pošlete nabídku na vhodný úkol. Pokud si vás klient vybere, začnete budovat první pracovní historii.</p><a className="button primary" href="#dostupne-ukoly">Projít úkoly</a></div>}
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
            <div className="section-title"><p className="kicker">Dostupné úkoly</p><h2>Pošlete vlastní nabídku a získejte zákazníka</h2><p>Vyberte jen úkoly, které zvládnete dodat dobře. Jasná cena, termín a profesionální zpráva pomáhají klientovi rozhodnout se.</p></div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>
          {availableTasks.length > 0 ? <div className="task-grid">{availableTasks.map((task) => <TaskCard key={task.id} task={task} offers={allOffers.filter((offer) => offer.task_id === task.id)} showOfferForm authenticatedTasker />)}</div> : <div className="empty-state"><h3>Žádné nové úkoly</h3><p>Buď nejsou žádné otevřené poptávky, nebo jste už na všechny dostupné úkoly poslali nabídku.</p></div>}
        </section>

        <section className="section dashboard-section" id="nabidky">
          <div className="section-title"><p className="kicker">Moje nabídky</p><h2>Odeslané nabídky</h2><p>Klient si taskera vybírá samostatně podle ceny, zprávy, profilu a domluvy. Vy nastavujete vlastní cenu a pracujete sami za sebe.</p></div>
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
          ) : <div className="empty-state"><h3>Zatím bez nabídek</h3><p>Vyberte úkol výše a pošlete první nabídku. První dobrá komunikace je začátek reputace.</p><a className="button primary" href="#dostupne-ukoly">Najít první úkol</a></div>}
        </section>

        <section className="section dashboard-section" id="vyplaty">
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Výplaty</h3><p>{completedTasks.length ? `Dokončené zakázky: ${completedTasks.length}. Výplata se uvolní po potvrzení dokončení podle pravidel platebního partnera.` : "Výplaty jsou navázané na dokončené a klientem potvrzené zakázky."}</p></article>
            <article className="dashboard-panel"><h3>Provize</h3><p>Přesné podmínky se zobrazí před odeslání nabídky a před potvrzením objednávky klientem.</p></article>
            <article className="dashboard-panel"><h3>Právní role</h3><p>Taskovo je zprostředkovatelská platforma. Tasker není zaměstnancem Taskovo a služby poskytuje samostatně jako OSVČ nebo firma.</p></article>
          </div>
        </section>

        <section className="section admin-panel" id="profil">
          <div className="section-title">
            <p className="kicker">Profil taskera</p>
            <h2>Profil, který pomáhá získat zákazníky</h2>
            <p>Tyto informace vidí klienti v marketplace a v nabídkách. Berte profil jako svou pracovní vizitku na Taskovo.</p>
          </div>
          <form className="compact-form" action={updateTaskerOwnProfile}>
            <label>Jméno<input name="name" type="text" defaultValue={profile?.name || account.displayName || ""} required /></label>
            <label>Přihlašovací email<input type="email" defaultValue={user.email || ""} disabled /></label>
            <label>Město<input name="city" type="text" defaultValue={profile?.city || ""} required /></label>
            <label>Kategorie<input name="categories" type="text" defaultValue={profile?.categories || ""} placeholder="Úklid, stěhování, montáž..." required /></label>
            <label>Kontakt pro klienty<input name="contact" type="text" defaultValue={profile?.contact || user.email || ""} /></label>
            <label>Stav ověření<input type="text" defaultValue={profile?.verified ? "Ověřený tasker" : "Čeká na ověření"} disabled /></label>
            <label className="span-full">Bio<textarea name="bio" rows={4} defaultValue={profile?.bio || ""} placeholder="Krátce popište zkušenosti, dostupnost, typické služby a proč si klient může vybrat právě vás." /></label>
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
