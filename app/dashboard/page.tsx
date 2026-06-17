import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { updateClientOwnProfile } from "@/app/profile-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfilePhotoStatus } from "@/components/ProfilePhotoStatus";
import { ProfilePhotoUploadForm } from "@/components/ProfilePhotoUploadForm";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import dashboardListStyles from "@/components/DashboardList.module.css";
import { getAccountContext } from "@/lib/account";
import { getOffers, getTasksForClient } from "@/lib/data";
import { getUnreadTaskMessageCounts } from "@/lib/message-data";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Offer, Task } from "@/lib/types";

export const metadata: Metadata = {
  title: "Můj dashboard | Taskovo",
  description: "Soukromý klientský dashboard Taskovo pro správu úkolů, nabídek, zpráv, profilu a plateb.",
  robots: { index: false, follow: false },
};

const nextStepCopy: Record<string, string> = {
  open: "Čeká na nabídky od taskerů.",
  offers_received: "Vyberte taskera z doručených nabídek.",
  assigned: "Tasker je vybraný. Domluvte detaily v objednávce.",
  in_progress: "Tasker pracuje. Sledujte zprávy a detail objednávky.",
  awaiting_confirmation: "Tasker označil práci jako hotovou. Potvrďte dokončení.",
  completed: "Objednávka je dokončena.",
  cancelled: "Objednávka je zrušena.",
  disputed: "Objednávka je ve sporu. Otevřete detail a sledujte zprávy od Taskovo.",
};

const statusLabels: Record<string, string> = {
  open: "Otevřeno",
  offers_received: "Nabídky doručeny",
  assigned: "Tasker vybrán",
  in_progress: "Probíhá",
  awaiting_confirmation: "Čeká na potvrzení",
  completed: "Dokončeno",
  cancelled: "Zrušeno",
  disputed: "Spor",
};

const updateMessages: Record<string, string> = {
  task_cancelled: "Objednávka byla zrušena a přesunuta do archivu.",
  profile: "Profil byl uložen.",
  photo_uploaded: "Fotka byla odeslána ke kontrole administrátorem.",
};

const errorMessages: Record<string, string> = {
  forbidden: "K této objednávce nemáte oprávnění.",
  config: "Chybí konfigurace služby. Zkontrolujeme nastavení Supabase.",
  locked: "Objednávku už nelze upravit v tomto stavu.",
  bad_file: "Vyberte fotku ve formátu JPG, PNG nebo WebP.",
  file_too_large: "Fotka je příliš velká. Maximální velikost je 5 MB.",
  profile_missing: "Nejdřív uložte profil, potom nahrajte fotku.",
};

function needsClientAction(task: Task, offerCount: number) {
  return (task.status === "offers_received" && offerCount > 0) || task.status === "awaiting_confirmation" || task.status === "disputed";
}

function isArchivedTask(task: Task) {
  return task.status === "completed" || task.status === "cancelled";
}

function formatCzk(amount: number) {
  return `${amount.toLocaleString("cs-CZ")} Kč`;
}

function groupOffersByTask(offers: Offer[]) {
  const grouped = new Map<string, Offer[]>();
  offers.forEach((offer) => grouped.set(offer.task_id, [...(grouped.get(offer.task_id) || []), offer]));
  return grouped;
}

function onboardingStatus(done: boolean, active: boolean) {
  if (done) return "Hotovo";
  if (active) return "Teď";
  return "Další krok";
}

function clientOnboardingSteps(taskCount: number, offerCount: number, selectedTaskerCount: number, completedTaskCount: number) {
  const hasTask = taskCount > 0;
  const hasOffer = offerCount > 0;
  const hasSelectedTasker = selectedTaskerCount > 0;
  const hasCompletedTask = completedTaskCount > 0;

  return [
    {
      title: "Zadejte úkol",
      status: onboardingStatus(hasTask, !hasTask),
      text: hasTask
        ? "První poptávka je založená. Další krok je porovnat nabídky a vybrat vhodného taskera."
        : "Popište, co potřebujete, přidejte město, rozpočet a termín. Jasné zadání přinese lepší nabídky.",
      href: "#novy-ukol",
      cta: hasTask ? "Zadat další úkol" : "Zadat první úkol",
    },
    {
      title: "Počkejte na nabídky",
      status: onboardingStatus(hasOffer, hasTask && !hasOffer),
      text: hasOffer
        ? "Nabídky už máte k dispozici. Porovnejte cenu, zprávu, profil a domluvu."
        : "Jakmile taskeři pošlou nabídky, uvidíte je u konkrétní objednávky i v této sekci.",
      href: "#nabidky",
      cta: hasOffer ? "Porovnat nabídky" : "Sledovat nabídky",
    },
    {
      title: "Vyberte taskera",
      status: onboardingStatus(hasSelectedTasker, hasOffer && !hasSelectedTasker),
      text: hasSelectedTasker
        ? "Tasker je vybraný. Detaily, zprávy a další kroky řešte přímo v objednávce."
        : "Klient si taskera vybírá samostatně podle nabídky, profilu a komunikace.",
      href: "#aktivni",
      cta: hasSelectedTasker ? "Otevřít objednávky" : "Vybrat taskera",
    },
    {
      title: "Potvrďte dokončení",
      status: onboardingStatus(hasCompletedTask, hasSelectedTasker && !hasCompletedTask),
      text: hasCompletedTask
        ? "Máte dokončenou objednávku. Recenze po dokončení pomáhá zvyšovat kvalitu marketplace."
        : "Po dokončení práce potvrďte výsledek. Výplata taskerovi se uvolní podle pravidel platebního partnera.",
      href: "#platby",
      cta: hasCompletedTask ? "Zkontrolovat historii" : "Jak fungují platby",
    },
  ];
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  const account = await getAccountContext(user);
  if (account.role === "admin") redirect("/admin");
  if (account.role === "tasker") redirect("/poskytovatel/dashboard");
  if (account.role !== "client") redirect("/prihlaseni?mode=login&error=account_profile");

  const [tasks, offers] = await Promise.all([getTasksForClient(user.id), getOffers()]);
  const profile = account.clientProfile;
  const unreadCounts = await getUnreadTaskMessageCounts(tasks.map((task) => task.id), user.id);
  const displayName = profile?.name || account.displayName;
  const taskIds = new Set(tasks.map((task) => task.id));
  const clientOffers = offers.filter((offer) => taskIds.has(offer.task_id));
  const offersByTask = groupOffersByTask(clientOffers);
  const currentTasks = tasks.filter((task) => !isArchivedTask(task));
  const archivedTasks = tasks.filter(isArchivedTask);
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const actionTasks = currentTasks.filter((task) => needsClientAction(task, offersByTask.get(task.id)?.length || 0));
  const openTasks = currentTasks.filter((task) => ["open", "offers_received"].includes(task.status));
  const pendingOffers = clientOffers.filter((offer) => offer.status === "pending");
  const acceptedOffers = clientOffers.filter((offer) => offer.status === "accepted");
  const unreadTotal = Object.values(unreadCounts).reduce((total, count) => total + count, 0);
  const estimatedBudget = currentTasks.reduce((total, task) => total + (task.budget_czk || 0), 0);
  const paidEstimate = acceptedOffers.reduce((total, offer) => total + (offer.price_czk || 0), 0);
  const selectedTaskCount = currentTasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation", "completed"].includes(task.status)).length;
  const onboarding = clientOnboardingSteps(tasks.length, pendingOffers.length + acceptedOffers.length, Math.max(acceptedOffers.length, selectedTaskCount), completedTasks.length);
  const notice = params.updated ? updateMessages[params.updated] : null;
  const error = params.error ? errorMessages[params.error] || "Akci se nepodařilo dokončit." : null;

  return (
    <>
      <Header />
      <main className="page-shell dashboard-shell">
        <section className="dashboard-hero">
          <div>
            <p className="kicker">Klientský dashboard</p>
            <h1 className="page-title">Vítejte, {displayName}</h1>
            <p className="hero-lead">Spravujte poptávky, nabídky od taskerů, zprávy a platby z jednoho místa.</p>
          </div>
          <div className="dashboard-hero-actions">
            <a className="button primary" href="#novy-ukol">Zadat nový úkol</a>
            <a className="button secondary" href="/poskytovatele">Najít taskera</a>
          </div>
        </section>

        {notice ? <p className="success-box">{notice}</p> : null}
        {error ? <p className="alert-box">{error}</p> : null}

        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlásit se</button></form>

        <section className="section dashboard-section" aria-label="Start klienta na Taskovo">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Start klienta</p>
              <h2>Od nápadu k dokončené objednávce</h2>
              <p>Krátká cesta, která pomáhá zadat úkol, porovnat nabídky a vybrat taskera samostatně.</p>
            </div>
            <a className="button secondary" href="#novy-ukol">Zadat úkol</a>
          </div>
          <div className="dashboard-grid">
            {onboarding.map((step) => (
              <article className="dashboard-panel" key={step.title}>
                <p className="kicker">{step.status}</p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                <a className="button secondary" href={step.href}>{step.cta}</a>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-overview" aria-label="Přehled účtu">
          <article className="metric-card metric-card-primary"><span>Aktivní úkoly</span><strong>{currentTasks.length}</strong><p>{actionTasks.length ? `${actionTasks.length} čeká na vaše rozhodnutí.` : "Vše je bez okamžité akce."}</p></article>
          <article className="metric-card"><span>Doručené nabídky</span><strong>{pendingOffers.length}</strong><p>{pendingOffers.length ? "Porovnejte cenu, zprávu a profil taskera." : "Zatím žádné nové nabídky."}</p></article>
          <article className="metric-card"><span>Zprávy</span><strong>{unreadTotal}</strong><p>{unreadTotal ? "Máte nové zprávy v objednávkách." : "Žádné nepřečtené zprávy."}</p></article>
          <article className="metric-card"><span>Odhad rozpočtu</span><strong>{formatCzk(estimatedBudget)}</strong><p>Souhrn aktuálních otevřených úkolů.</p></article>
        </section>

        <section className="dashboard-tabs" aria-label="Rychlé sekce">
          <a href="#aktivni">Aktivní úkoly</a>
          <a href="#nabidky">Nabídky</a>
          <a href="#zpravy">Zprávy</a>
          <a href="#platby">Platby</a>
          <a href="#profil">Profil</a>
        </section>

        <section className="section dashboard-section" id="aktivni">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Přehled práce</p>
              <h2>Aktivní úkoly</h2>
              <p>Otevřené poptávky, vybraní taskeři a zakázky, které čekají na potvrzení.</p>
            </div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>

          {actionTasks.length ? (
            <div className="priority-panel">
              <div><p className="kicker">Priorita</p><h3>Čeká na váš krok</h3></div>
              <div className={dashboardListStyles.compactList}>
                {actionTasks.map((task) => (
                  <article className={dashboardListStyles.compactItem} key={task.id}>
                    <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                    <p className={dashboardListStyles.itemText}>{nextStepCopy[task.status] ?? "Otevřete detail objednávky."} · {offersByTask.get(task.id)?.length || 0} nabídek · {unreadCounts[task.id] || 0} nových zpráv</p>
                    <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>Otevřít objednávku</a></div>
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
            <div className="empty-state"><h3>Zatím nemáte žádný úkol</h3><p>Zadejte první poptávku a Taskovo ji ukáže vhodným taskerům v okolí.</p><a className="button primary" href="#novy-ukol">Zadat nový úkol</a></div>
          )}
        </section>

        <section className="section dashboard-section" id="nabidky">
          <div className="section-title"><p className="kicker">Nabídky</p><h2>Porovnání nabídek</h2><p>Klient si taskera vybírá samostatně. Taskovo je zprostředkovatel, ne zaměstnavatel ani přímý poskytovatel služby.</p></div>
          {openTasks.length ? (
            <div className={dashboardListStyles.compactList}>
              {openTasks.map((task) => {
                const taskOffers = offersByTask.get(task.id) || [];
                return (
                  <article className={dashboardListStyles.compactItem} key={task.id}>
                    <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                    <p className={dashboardListStyles.itemText}>Stav: {statusLabels[task.status] ?? task.status} · {taskOffers.length} nabídek · rozpočet {formatCzk(task.budget_czk)}</p>
                    <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>{taskOffers.length ? "Vybrat taskera" : "Otevřít detail"}</a></div>
                  </article>
                );
              })}
            </div>
          ) : <div className="empty-state"><h3>Žádné nabídky k výběru</h3><p>Jakmile taskeři odpoví na vaše úkoly, uvidíte je tady.</p></div>}
        </section>

        <section className="section dashboard-section" id="zpravy">
          <div className="section-title"><p className="kicker">Komunikace</p><h2>Zprávy</h2><p>Zprávy jsou vázané na konkrétní objednávku, aby domluva nezmizela mimo kontext.</p></div>
          {unreadTotal ? (
            <div className={dashboardListStyles.compactList}>
              {currentTasks.filter((task) => unreadCounts[task.id]).map((task) => (
                <article className={dashboardListStyles.compactItem} key={task.id}>
                  <strong className={dashboardListStyles.itemTitle}>{task.title}</strong>
                  <p className={dashboardListStyles.itemText}>{unreadCounts[task.id]} nových zpráv · {task.city}</p>
                  <div className={dashboardListStyles.itemActions}><a className="button secondary" href={`/ukol/${task.id}`}>Otevřít zprávy</a></div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><h3>Žádné nové zprávy</h3><p>Až se tasker ozve nebo upřesní detail, zpráva se objeví v objednávce.</p></div>}
        </section>

        <section className="section dashboard-section" id="platby">
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Platby</h3><p>{acceptedOffers.length ? `Evidujeme ${acceptedOffers.length} vybraných nabídek v odhadované hodnotě ${formatCzk(paidEstimate)}.` : "Platby jsou zpracovány přes platebního partnera. Výplata se uvolní po potvrzení dokončení."}</p></article>
            <article className="dashboard-panel"><h3>Recenze</h3><p>{completedTasks.length ? `Po ${completedTasks.length} dokončených úkolech bude možné přidat recenzi taskerovi.` : "Po dokončení první objednávky zde bude výzva k recenzi."}</p></article>
            <article className="dashboard-panel"><h3>Bezpečnost</h3><p>Platby a spory jsou vedeny přes Taskovo proces. Tasker zůstává nezávislý OSVČ nebo firma.</p></article>
          </div>
        </section>

        <section className="section split dashboard-create-section" id="novy-ukol">
          <div className="section-title">
            <p className="kicker">Rychlé zadání</p>
            <h2>Vytvořte nový úkol</h2>
            <p>Po odeslání se úkol uloží k vašemu účtu a taskerům ho zobrazíme v marketplace.</p>
          </div>
          <TaskForm />
        </section>

        <section className="section admin-panel" id="profil">
          <div className="section-title">
            <p className="kicker">Můj profil</p>
            <h2>Kontaktní údaje klienta</h2>
            <p>Tyto údaje používáme pro objednávky a podporu. Přihlašovací email zůstává hlavním identifikátorem účtu.</p>
          </div>
          <form className="compact-form" action={updateClientOwnProfile}>
            <label>Jméno<input name="name" type="text" defaultValue={profile?.name || account.displayName || ""} required /></label>
            <label>Přihlašovací email<input type="email" defaultValue={user.email || ""} disabled /></label>
            <label>Telefon<input name="phone" type="text" defaultValue={profile?.phone || ""} placeholder="+420..." /></label>
            <label>Město<input name="city" type="text" defaultValue={profile?.city || ""} placeholder="Praha, Plzeň, Tábor..." /></label>
            <label>Jazyk<select name="preferred_language" defaultValue={profile?.preferred_language || "cs"}><option value="cs">Čeština</option><option value="en">English</option><option value="uk">Ukrajinština</option><option value="ru">Ruština</option></select></label>
            <label className="checkbox-row"><input name="marketing_consent" type="checkbox" defaultChecked={Boolean(profile?.marketing_consent)} /> Novinky a tipy od Taskovo</label>
            <button className="button primary span-full" type="submit">Uložit profil</button>
          </form>

          <section className="section-action">
            <div className="section-title"><p className="kicker">Foto profilu</p><h2>Profilová fotka</h2><p>Fotka se veřejně zobrazí až po kontrole administrátorem.</p></div>
            <ProfilePhotoStatus
              avatarUrl={profile?.avatar_url}
              pendingAvatarUrl={profile?.pending_avatar_url}
              status={profile?.avatar_review_status}
              note={profile?.avatar_review_note}
              roleLabel="klienta"
            />
            <ProfilePhotoUploadForm />
          </section>
        </section>

        {archivedTasks.length ? (
          <section className="section dashboard-section">
            <div className="section-title"><p className="kicker">Archiv</p><h2>Dokončené a zrušené objednávky</h2><p>Historie zůstává oddělená od aktuálních úkolů.</p></div>
            <div className="task-grid">{archivedTasks.map((task) => <TaskCard key={task.id} task={task} offers={offersByTask.get(task.id) || []} showOfferForm={false} />)}</div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
