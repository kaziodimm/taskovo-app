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
            <p className="kicker">Klientsky dashboard</p>
            <h1 className="page-title">Vitejte, {displayName}</h1>
            <p className="hero-lead">Tady budou vase ukoly, nabidky od taskeru a zpravy. Nove ukoly se uz ukladaji primo k vasemu uctu.</p>
          </div>
          <div className="page-hero-card"><strong>{tasks.length}</strong><p>vasich ukolu</p></div>
        </section>
        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlasit se</button></form>

        <section className="section split dashboard-create-section">
          <div className="section-title">
            <p className="kicker">Rychle zadani</p>
            <h2>Vytvorte novy ukol</h2>
            <p>Po odeslani se ukol automaticky objevi v tomto dashboardu. Taskerum ho potom zobrazime v marketplace.</p>
          </div>
          <TaskForm />
        </section>

        <section className="section">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Moje ukoly</p>
              <h2>Poptavky navazane na vas ucet</h2>
            </div>
            <a className="button secondary" href="/tasks">Verejny marketplace</a>
          </div>
          {tasks.length > 0 ? (
            <div className="task-grid">
              {tasks.map((task) => <TaskCard key={task.id} task={task} offers={offers.filter((offer) => offer.task_id === task.id)} canSelectOffer showOfferForm={false} />)}
            </div>
          ) : (
            <div className="dashboard-panel"><h3>Zatim nemate zadny ukol</h3><p>Vyplnte rychle zadani vyse. Prvni ukol je nejlepsi test celeho toku.</p></div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
