import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { getOffers, getTasksForClient } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role === "tasker") redirect("/poskytovatel/dashboard");

  const [tasks, offers] = await Promise.all([getTasksForClient(user.id), getOffers()]);
  const displayName = user.user_metadata?.name || user.email;

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
          <div className="page-hero-card"><strong>{tasks.length}</strong><p>vašich úkolů</p></div>
        </section>
        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlásit se</button></form>

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
