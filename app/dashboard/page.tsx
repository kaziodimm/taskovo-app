import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { getOffers, getTasksForClient } from "@/lib/data";
import { getUnreadTaskMessageCounts } from "@/lib/message-data";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Task } from "@/lib/types";

const nextStepCopy: Record<string, string> = {
  open: "Čeká na nabídky od taskerů.",
  offers_received: "Vyberte taskera z doručených nabídek.",
  assigned: "Tasker je vybraný. Domluvte detaily v objednávce.",
  in_progress: "Tasker pracuje. Sledujte zprávy a detail objednávky.",
  awaiting_confirmation: "Tasker označil práci jako hotovou. Potvrďte dokončení.",
  completed: "Objednávka je dokončená.",
};

function needsClientAction(task: Task, offerCount: number) {
  return (task.status === "offers_received" && offerCount > 0) || task.status === "awaiting_confirmation";
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role === "tasker") redirect("/poskytovatel/dashboard");

  const [tasks, offers] = await Promise.all([getTasksForClient(user.id), getOffers()]);
  const unreadCounts = await getUnreadTaskMessageCounts(tasks.map((task) => task.id), user.id);
  const displayName = user.user_metadata?.name || user.email;
  const offersByTask = new Map<string, number>();
  offers.forEach((offer) => offersByTask.set(offer.task_id, (offersByTask.get(offer.task_id) || 0) + 1));
  const actionTasks = tasks.filter((task) => needsClientAction(task, offersByTask.get(task.id) || 0));
  const activeTasks = tasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));
  const unreadTotal = Object.values(unreadCounts).reduce((total, count) => total + count, 0);

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

        {actionTasks.length ? (
          <section className="section">
            <div className="section-title"><p className="kicker">Priorita</p><h2>Čeká na vás</h2></div>
            <div className="admin-list">
              {actionTasks.map((task) => (
                <article className="admin-item" key={task.id}>
                  <strong>{task.title}</strong>
                  <p>{nextStepCopy[task.status] ?? "Otevřete detail objednávky."} · {offersByTask.get(task.id) || 0} nabídek · {unreadCounts[task.id] || 0} nových zpráv</p>
                  <a className="button secondary" href={`/ukol/${task.id}`}>Otevřít objednávku</a>
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
              {tasks.map((task) => <TaskCard key={task.id} task={task} offers={offers.filter((offer) => offer.task_id === task.id)} canSelectOffer showOfferForm={false} />)}
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
