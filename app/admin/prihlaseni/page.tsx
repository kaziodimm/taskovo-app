import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { adminLogin } from "@/app/actions";
import { hasAdminConfig } from "@/lib/admin-auth";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params.error;

  return (
    <>
      <Header />
      <main className="page-shell auth-shell">
        <section className="auth-panel auth-panel-narrow">
          <p className="kicker">Admin Taskovo</p>
          <h1 className="page-title">Přihlášení správce</h1>
          <p className="hero-lead">Tento vstup je určený pouze pro administraci pilotu, kontrolu klientů, úkolů a taskerů.</p>
          {!hasAdminConfig() ? <p className="alert-box">Nejdřív nastavte ve Vercel proměnné ADMIN_EMAIL a ADMIN_PASSWORD.</p> : null}
          {error === "invalid" ? <p className="alert-box">Nesprávný email nebo heslo.</p> : null}
          <form className="search-panel" action={adminLogin}>
            <label>Email<input name="email" type="email" placeholder="admin@taskovo.cz" required /></label>
            <label>Heslo<input name="password" type="password" placeholder="••••••••" required /></label>
            <button className="button primary" type="submit">Přihlásit do administrace</button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
