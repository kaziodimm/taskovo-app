import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getTasks } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role === "tasker") redirect("/poskytovatel/dashboard");

  const tasks = await getTasks();
  const displayName = user.user_metadata?.name || user.email;

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Klientský dashboard</p>
            <h1 className="page-title">Vítejte, {displayName}</h1>
            <p className="hero-lead">Toto je osobní prostor klienta. Další krok bude filtrovat jen vaše úkoly a propojit zprávy s konkrétními nabídkami.</p>
          </div>
          <div className="page-hero-card"><strong>{user.email}</strong><p>přihlášený klient</p></div>
        </section>
        <form action={logoutAccount} className="admin-toolbar"><span>Účet klienta</span><button className="button secondary" type="submit">Odhlásit se</button></form>
        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Moje úkoly</h3><p>{tasks.length} úkolů v pilotní databázi. V další iteraci je navážeme přímo na účet klienta.</p></article>
          <article className="dashboard-panel"><h3>Nabídky</h3><p>Přehled nabídek od taskerů, výběr vítěze a stav potvrzení.</p></article>
          <article className="dashboard-panel"><h3>Zprávy</h3><p>Bezpečná komunikace s taskerem k jednotlivým úkolům.</p></article>
        </div>
      </main>
      <Footer />
    </>
  );
}
