import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { getOffers, getOffersForTasker, getOpenTasksForTaskers, getTaskerProfileForUser } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function ProviderDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role !== "tasker") redirect("/dashboard");

  const [profile, openTasks, allOffers, myOffers] = await Promise.all([
    getTaskerProfileForUser(user.id),
    getOpenTasksForTaskers(),
    getOffers(),
    getOffersForTasker(user.id),
  ]);

  const myOfferTaskIds = new Set(myOffers.map((offer) => offer.task_id));
  const availableTasks = openTasks.filter((task) => !myOfferTaskIds.has(task.id));

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Dashboard taskera</p>
            <h1 className="page-title">{profile?.name || user.user_metadata?.name || "Tasker"}</h1>
            <p className="hero-lead">Vidíte dostupné úkoly, můžete poslat nabídku a sledovat své odeslané nabídky.</p>
          </div>
          <div className="page-hero-card"><strong>{availableTasks.length}</strong><p>dostupných úkolů · {myOffers.length} vašich nabídek</p></div>
        </section>
        <form action={logoutAccount} className="admin-toolbar"><span>{user.email}</span><button className="button secondary" type="submit">Odhlásit se</button></form>

        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Můj profil</h3><p>{profile?.categories || "Doplňte kategorie služeb v profilu taskera."}</p></article>
          <article className="dashboard-panel"><h3>Město</h3><p>{profile?.city || "Město zatím není uvedeno."}</p></article>
          <article className="dashboard-panel"><h3>Kontakt</h3><p>{profile?.contact || user.email}</p></article>
        </div>

        <section className="section">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Dostupné úkoly</p><h2>Pošlete nabídku klientovi</h2><p>Úkoly, na které jste už odpověděli, se zde schovají a objeví se v sekci vašich nabídek.</p></div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>
          {availableTasks.length > 0 ? <div className="task-grid">{availableTasks.map((task) => <TaskCard key={task.id} task={task} offers={allOffers.filter((offer) => offer.task_id === task.id)} />)}</div> : <div className="dashboard-panel"><h3>Žádné nové úkoly</h3><p>Buď nejsou žádné otevřené poptávky, nebo jste už na všechny dostupné úkoly poslali nabídku.</p></div>}
        </section>

        <section className="section">
          <div className="section-title"><p className="kicker">Moje nabídky</p><h2>Odeslané nabídky</h2></div>
          {myOffers.length > 0 ? <div className="admin-list">{myOffers.map((offer) => <article className="admin-item" key={offer.id}><strong>{offer.price_czk.toLocaleString("cs-CZ")} Kč</strong><p>{offer.message} · stav: {offer.status}</p></article>)}</div> : <div className="dashboard-panel"><h3>Zatím bez nabídek</h3><p>Vyberte úkol výše a pošlete první nabídku.</p></div>}
        </section>
      </main>
      <Footer />
    </>
  );
}
