import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { createServiceSupabaseClient, createServerSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type { TaskerProfile } from "@/lib/types";

export default async function ProviderDashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role !== "tasker") redirect("/dashboard");

  let profile: TaskerProfile | null = null;
  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const service = createServiceSupabaseClient();
    const { data } = await service.from("tasker_profiles").select("*").eq("auth_user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    profile = data as TaskerProfile | null;
  }

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Dashboard taskera</p>
            <h1 className="page-title">{profile?.name || user.user_metadata?.name || "Tasker"}</h1>
            <p className="hero-lead">Pracovní plocha pro nabídky, aktivní úkoly, profil a budoucí výplaty.</p>
          </div>
          <div className="page-hero-card"><strong>{user.email}</strong><p>{profile?.city || "město zatím není uvedeno"}</p></div>
        </section>
        <form action={logoutAccount} className="admin-toolbar"><span>Účet taskera</span><button className="button secondary" type="submit">Odhlásit se</button></form>
        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Dostupné úkoly</h3><p>Filtry podle města, kategorie, rozpočtu a času.</p></article>
          <article className="dashboard-panel"><h3>Moje nabídky</h3><p>Přehled cen, zpráv a stavu výběru klientem.</p></article>
          <article className="dashboard-panel"><h3>Můj profil</h3><p>{profile?.categories || "Doplňte kategorie služeb v profilu taskera."}</p></article>
        </div>
      </main>
      <Footer />
    </>
  );
}
