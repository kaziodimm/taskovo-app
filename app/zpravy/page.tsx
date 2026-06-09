import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isAdminEmail } from "@/lib/admin-auth";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function MessagesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (isAdminEmail(user.email)) redirect("/admin");

  const dashboardHref = user.user_metadata?.role === "tasker" ? "/poskytovatel/dashboard" : "/dashboard";

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title">
          <p className="kicker">Zprávy</p>
          <h1 className="page-title">Komunikace k úkolům</h1>
          <p>Soukromé zprávy jsou dostupné jen v detailu objednávky pro klienta a vybraného taskera.</p>
        </section>
        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Soukromě</h3><p>Konverzace se zobrazí pouze účastníkům konkrétní objednávky.</p></article>
          <article className="dashboard-panel"><h3>Po výběru taskera</h3><p>Chat se otevře až po potvrzení nabídky klientem.</p></article>
          <article className="dashboard-panel"><h3>Historie</h3><p>Zprávy zůstávají navázané na objednávku pro podporu a řešení sporů.</p></article>
        </div>
        <div className="section-action">
          <a className="button primary" href={dashboardHref}>Přejít do dashboardu</a>
        </div>
      </main>
      <Footer />
    </>
  );
}
