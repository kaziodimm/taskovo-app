import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { loginAccount, registerClientAccount, registerTaskerAccount, requestPasswordReset } from "@/app/auth-actions";
import { getAccountContext } from "@/lib/account";
import { createServerSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Přihlášení a registrace | Taskovo",
  description: "Přihlášení do Taskovo, registrace klienta a registrace taskera pro český marketplace lokálních služeb.",
  alternates: { canonical: "/prihlaseni" },
  openGraph: {
    title: "Přihlášení a registrace | Taskovo",
    description: "Jeden vstup pro klienty a taskery v marketplace Taskovo.",
    url: "https://taskovo.cz/prihlaseni",
    siteName: "Taskovo",
    type: "website",
  },
  robots: { index: false, follow: false },
};

type AuthMode = "client" | "tasker" | "login" | "reset";

function normalizeMode(mode?: string): AuthMode {
  if (mode === "tasker" || mode === "login" || mode === "reset") return mode;
  return "client";
}

function tabClass(active: boolean) {
  return active ? "button primary" : "button secondary";
}

async function redirectSignedInUser() {
  if (!hasSupabaseEnv()) return;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const account = await getAccountContext(user);
  if (account.role !== "unknown") redirect(account.dashboardHref);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; registered?: string; error?: string; resetSent?: string; email?: string; passwordUpdated?: string }>;
}) {
  await redirectSignedInUser();

  const params = await searchParams;
  const mode = normalizeMode(params.mode);
  const registered = params.registered;
  const error = params.error;
  const email = params.email || "";

  return (
    <>
      <Header />
      <main className="page-shell auth-shell">
        <section className="auth-panel">
          <div className="auth-brand">
            <BrandMark large />
            <div>
              <p className="kicker">Účet Taskovo</p>
              <h1 className="page-title">Přihlášení a registrace</h1>
              <p className="hero-lead">Vytvořte účet, potvrďte email a používejte Taskovo jako klient nebo tasker.</p>
            </div>
          </div>

          <div className="hero-actions auth-note" aria-label="Výběr typu účtu">
            <a className={tabClass(mode === "client")} href="/prihlaseni?mode=client">Klient</a>
            <a className={tabClass(mode === "tasker")} href="/prihlaseni?mode=tasker">Tasker</a>
            <a className={tabClass(mode === "login")} href="/prihlaseni?mode=login">Přihlášení</a>
          </div>

          {registered ? <p className="success-box">Účet byl vytvořen. Poslali jsme potvrzovací email, po potvrzení se můžete přihlásit.</p> : null}
          {params.resetSent ? <p className="success-box">Pokud účet s tímto emailem existuje, poslali jsme odkaz pro obnovu hesla.</p> : null}
          {params.passwordUpdated ? <p className="success-box">Heslo bylo změněno. Přihlaste se prosím novým heslem.</p> : null}
          {error === "duplicate" ? <p className="alert-box">Tento email už je v Taskovo registrovaný. Přihlaste se nebo použijte obnovu hesla.</p> : null}
          {error === "email_confirm" ? <p className="alert-box">Potvrzení emailu se nepodařilo. Otevřete prosím nejnovější email z Taskovo nebo si účet zaregistrujte znovu.</p> : null}
          {error === "email_not_confirmed" ? <p className="alert-box">Email ještě není potvrzený. Zkontrolujte prosím potvrzovací zprávu ve své schránce.</p> : null}
          {error === "account_profile" ? <p className="alert-box">Účet existuje, ale chybí mu profil klienta nebo taskera. Kontaktujte prosím podporu Taskovo.</p> : null}
          {error === "login" ? <p className="alert-box">Přihlášení se nepodařilo. Zkontrolujte email a heslo.</p> : null}
          {error === "login_required" ? <p className="alert-box">Pro pokračování se prosím přihlaste.</p> : null}
          {error === "register" ? <p className="alert-box">Registrace se nepodařila. Zkuste jiný email nebo silnější heslo.</p> : null}
          {error === "reset" ? <p className="alert-box">Odeslání odkazu pro obnovu hesla se nepodařilo. Zkuste to prosím později.</p> : null}
          {error === "config" ? <p className="alert-box">Chybí konfigurace Supabase service role ve Vercel env.</p> : null}

          <div className="auth-grid auth-note">
            {mode === "client" ? (
              <form className="search-panel" action={registerClientAccount}>
                <div className="card-heading">
                  <h2>Registrace klienta</h2>
                  <p>Po registraci potvrdíte email. Jeden email může mít jen jeden účet Taskovo.</p>
                </div>
                <label>Jméno<input name="name" type="text" placeholder="Jan Novák" required /></label>
                <label>Email<input name="email" type="email" placeholder="vas@email.cz" required /></label>
                <label>Heslo<input name="password" type="password" placeholder="min. 8 znaků" minLength={8} required /></label>
                <label>Telefon<input name="phone" type="tel" placeholder="+420 ..." /></label>
                <label>Město<input name="city" type="text" placeholder="Praha, Brno, Olomouc..." /></label>
                <label className="checkbox-row"><input name="marketing_consent" type="checkbox" /> Chci dostat informaci o spuštění Taskovo</label>
                <button className="button primary" type="submit">Vytvořit účet klienta</button>
                <p className="fine-print">Už máte účet? <a href="/prihlaseni?mode=login">Přihlaste se</a>.</p>
              </form>
            ) : null}

            {mode === "tasker" ? (
              <form className="search-panel provider-login-panel" action={registerTaskerAccount}>
                <div className="card-heading">
                  <h2>Registrace taskera</h2>
                  <p>Po potvrzení emailu můžete dokončit profil, posílat nabídky a spravovat zakázky.</p>
                </div>
                <label>Jméno<input name="name" type="text" placeholder="Petra Svobodová" required /></label>
                <label>Email<input name="email" type="email" placeholder="tasker@email.cz" required /></label>
                <label>Heslo<input name="password" type="password" placeholder="min. 8 znaků" minLength={8} required /></label>
                <label>Město<input name="city" type="text" placeholder="Praha" required /></label>
                <label>Kategorie<input name="categories" type="text" placeholder="Úklid, montáž, doručení" required /></label>
                <label>Kontakt<input name="contact" type="text" placeholder="+420 ... / Telegram" /></label>
                <button className="button primary" type="submit">Vytvořit účet taskera</button>
                <p className="fine-print">Už máte účet? <a href="/prihlaseni?mode=login">Přihlaste se</a>.</p>
              </form>
            ) : null}

            {mode === "login" ? (
              <form className="search-panel muted-panel" action={loginAccount}>
                <div className="card-heading">
                  <h2>Přihlášení</h2>
                  <p>Jeden vstup pro klienta i taskera. Systém vás pošle do správného dashboardu.</p>
                </div>
                <label>Email<input name="email" type="email" placeholder="vas@email.cz" defaultValue={email} required /></label>
                <label>Heslo<input name="password" type="password" placeholder="••••••••" required /></label>
                <button className="button primary" type="submit">Přihlásit se</button>
                <div className="auth-links">
                  <a href="/prihlaseni?mode=reset">Zapomenuté heslo</a>
                  <span>Nemáte účet? <a href="/prihlaseni?mode=client">Klient</a> nebo <a href="/prihlaseni?mode=tasker">tasker</a>.</span>
                </div>
              </form>
            ) : null}

            {mode === "reset" ? (
              <form className="search-panel muted-panel" action={requestPasswordReset}>
                <div className="card-heading">
                  <h2>Obnova hesla</h2>
                  <p>Zadejte email účtu. Pokud účet existuje, pošleme bezpečný odkaz pro nastavení nového hesla.</p>
                </div>
                <label>Email<input name="email" type="email" placeholder="vas@email.cz" defaultValue={email} required /></label>
                <button className="button primary" type="submit">Poslat odkaz pro obnovu</button>
                <p className="fine-print"><a href="/prihlaseni?mode=login">Zpět na přihlášení</a></p>
              </form>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
