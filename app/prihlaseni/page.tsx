import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { loginAccount, registerClientAccount, registerTaskerAccount } from "@/app/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string; error?: string }> }) {
  const params = await searchParams;
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
              <p className="hero-lead">Vytvořte účet klienta nebo taskera. Účet se uloží přes Supabase Auth a po registraci vás přihlásí do správného dashboardu.</p>
            </div>
          </div>
          {registered ? <p className="success-box">Účet byl vytvořen. Teď se můžete přihlásit.</p> : null}
          {error === "login" ? <p className="alert-box">Přihlášení se nepodařilo. Zkontrolujte email a heslo.</p> : null}
          {error === "register" ? <p className="alert-box">Registrace se nepodařila. Zkuste jiný email nebo silnější heslo.</p> : null}
          {error === "config" ? <p className="alert-box">Chybí konfigurace Supabase service role ve Vercel env.</p> : null}

          <div className="auth-grid auth-grid-three">
            <form className="search-panel" action={registerClientAccount}>
              <h2>Registrace klienta</h2>
              <p>Pro zadávání úkolů, zprávy a budoucí platby.</p>
              <label>Jméno<input name="name" type="text" placeholder="Jan Novák" required /></label>
              <label>Email<input name="email" type="email" placeholder="vas@email.cz" required /></label>
              <label>Heslo<input name="password" type="password" placeholder="min. 8 znaků" minLength={8} required /></label>
              <label>Telefon<input name="phone" type="tel" placeholder="+420 ..." /></label>
              <label>Město<input name="city" type="text" placeholder="Praha, Brno, Olomouc..." /></label>
              <label className="checkbox-row"><input name="marketing_consent" type="checkbox" /> Chci dostat informaci o spuštění pilotu</label>
              <button className="button primary" type="submit">Vytvořit účet klienta</button>
            </form>

            <form className="search-panel provider-login-panel" action={registerTaskerAccount}>
              <h2>Registrace taskera</h2>
              <p>Pro lidi, kteří chtějí nabízet služby přes Taskovo.</p>
              <label>Jméno<input name="name" type="text" placeholder="Petra Svobodová" required /></label>
              <label>Email<input name="email" type="email" placeholder="tasker@email.cz" required /></label>
              <label>Heslo<input name="password" type="password" placeholder="min. 8 znaků" minLength={8} required /></label>
              <label>Město<input name="city" type="text" placeholder="Praha" required /></label>
              <label>Kategorie<input name="categories" type="text" placeholder="Úklid, montáž, doručení" required /></label>
              <label>Kontakt<input name="contact" type="text" placeholder="+420 ... / Telegram" /></label>
              <button className="button primary" type="submit">Vytvořit účet taskera</button>
            </form>

            <form className="search-panel muted-panel" action={loginAccount}>
              <h2>Přihlášení</h2>
              <p>Jeden vstup pro klienta i taskera. Systém vás pošle do správného dashboardu.</p>
              <label>Email<input name="email" type="email" placeholder="vas@email.cz" required /></label>
              <label>Heslo<input name="password" type="password" placeholder="••••••••" required /></label>
              <button className="button primary" type="submit">Přihlásit se</button>
              <a className="button secondary" href="/admin/prihlaseni">Vstup pro admina</a>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
