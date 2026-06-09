import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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

const nextStepCopy: Record<string, string> = {
  assigned: "Začněte práci, až máte s klientem domluvené detaily.",
  in_progress: "Po dokončení označte práci jako hotovou.",
  awaiting_confirmation: "Čeká se na potvrzení klienta.",
  completed: "Objednávka je dokončená.",
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
          {myOffers.length > 0 ? <div className="admin-list">{myOffers.map((offer) => <article className="admin-item" key={offer.id}><strong>{offer.price_czk.toLocaleString("cs-CZ")} Kč</strong><p>{offer.message} · stav: {offer.status}</p><a className="button secondary" href={`/ukol/${offer.task_id}`}>Detail objednávky</a></article>)}</div> : <div className="dashboard-panel"><h3>Zatím bez nabídek</h3><p>Vyberte úkol výše a pošlete první nabídku.</p></div>}
        </section>
      </main>
      <Footer />
    </>
  );
}
