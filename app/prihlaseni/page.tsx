import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { loginAccount, registerClientAccount, registerTaskerAccount } from "@/app/actions";

type AuthMode = "client" | "tasker" | "login";

function normalizeMode(mode?: string): AuthMode {
  if (mode === "tasker" || mode === "login") return mode;
  return "client";
}

function tabClass(active: boolean) {
  return active ? "button primary" : "button secondary";
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string; registered?: string; error?: string }> }) {
  const params = await searchParams;
  const mode = normalizeMode(params.mode);
  const registered = params.registered;
  const error = params.error;

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
              <p className="hero-lead">Vyberte, jestli chcete zadat úkol, pracovat jako tasker, nebo se přihlásit do existujícího účtu.</p>
            </div>
          </div>

          <div className="hero-actions auth-note" aria-label="Výběr typu účtu">
            <a className={tabClass(mode === "client")} href="/prihlaseni?mode=client">Klient</a>
            <a className={tabClass(mode === "tasker")} href="/prihlaseni?mode=tasker">Tasker</a>
            <a className={tabClass(mode === "login")} href="/prihlaseni?mode=login">Přihlášení</a>
          </div>

          {registered ? <p className="success-box">Účet byl vytvořen. Teď se můžete přihlásit.</p> : null}
          {error === "login" ? <p className="alert-box">Přihlášení se nepodařilo. Zkontrolujte email a heslo.</p> : null}
          {error === "login_required" ? <p className="alert-box">Pro pokračování se prosím přihlaste.</p> : null}
          {error === "register" ? <p className="alert-box">Registrace se nepodařila. Zkuste jiný email nebo silnější heslo.</p> : null}
          {error === "config" ? <p className="alert-box">Chybí konfigurace Supabase service role ve Vercel env.</p> : null}

          <div className="auth-grid auth-note">
            {mode === "client" ? (
              <form className="search-panel" action={registerClientAccount}>
                <div className="card-heading">
                  <h2>Registrace klienta</h2>
                  <p>Účet pro zadávání úkolů, komunikaci s taskery a budoucí platby.</p>
                </div>
                <label>Jméno<input name="name" type="text" placeholder="Jan Novák" required /></label>
                <label>Email<input name="email" type="email" placeholder="vas@email.cz" required /></label>
                <label>Heslo<input name="password" type="password" placeholder="min. 8 znaků" minLength={8} required /></label>
                <label>Telefon<input name="phone" type="tel" placeholder="+420 ..." /></label>
                <label>Město<input name="city" type="text" placeholder="Praha, Brno, Olomouc..." /></label>
                <label className="checkbox-row"><input name="marketing_consent" type="checkbox" /> Chci dostat informaci o spuštění pilotu</label>
                <button className="button primary" type="submit">Vytvořit účet klienta</button>
                <p className="fine-print">Už máte účet? <a href="/prihlaseni?mode=login">Přihlaste se</a>.</p>
              </form>
            ) : null}

            {mode === "tasker" ? (
              <form className="search-panel provider-login-panel" action={registerTaskerAccount}>
                <div className="card-heading">
                  <h2>Registrace taskera</h2>
                  <p>Profil pro lidi, kteří chtějí přijímat úkoly a nabízet služby přes Taskovo.</p>
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
                  <p>Jeden vstup pro klienta i taskera. Po přihlášení vás systém pošle do správného dashboardu.</p>
                </div>
                <label>Email<input name="email" type="email" placeholder="vas@email.cz" required /></label>
                <label>Heslo<input name="password" type="password" placeholder="••••••••" required /></label>
                <button className="button primary" type="submit">Přihlásit se</button>
                <a className="button secondary" href="/admin/prihlaseni">Vstup pro admina</a>
                <p className="fine-print">Nemáte účet? <a href="/prihlaseni?mode=client">Registrace klienta</a> nebo <a href="/prihlaseni?mode=tasker">registrace taskera</a>.</p>
              </form>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
