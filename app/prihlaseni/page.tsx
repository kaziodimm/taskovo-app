import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { createClientProfile } from "@/app/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const params = await searchParams;
  const registered = params.registered === "client";

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
              <p className="hero-lead">Klienti mohou už teď vytvořit základní profil. Plné přihlášení s heslem napojíme přes Supabase Auth v dalším kroku.</p>
            </div>
          </div>
          {registered ? <p className="success-box">Klientský profil byl uložen. Najdete ho v administraci Taskovo.</p> : null}
          <div className="auth-grid auth-grid-three">
            <form className="search-panel" action={createClientProfile}>
              <h2>Registrace klienta</h2>
              <p>Uložení klienta do Supabase pro pilot a budoucí účty.</p>
              <label>Jméno<input name="name" type="text" placeholder="Jan Novák" required /></label>
              <label>Email<input name="email" type="email" placeholder="vas@email.cz" required /></label>
              <label>Telefon<input name="phone" type="tel" placeholder="+420 ..." /></label>
              <label>Město<input name="city" type="text" placeholder="Praha, Brno, Olomouc..." /></label>
              <label className="checkbox-row"><input name="marketing_consent" type="checkbox" /> Chci dostat informaci o spuštění pilotu</label>
              <button className="button primary" type="submit">Registrovat klienta</button>
            </form>
            <form className="search-panel muted-panel">
              <h2>Přihlášení klienta</h2>
              <p>Přihlášení bude aktivní po napojení Supabase Auth.</p>
              <label>Email<input type="email" placeholder="vas@email.cz" /></label>
              <label>Heslo<input type="password" placeholder="••••••••" /></label>
              <button className="button secondary" type="button">Připravujeme</button>
              <a className="button secondary" href="/zadat-ukol">Pokračovat bez účtu</a>
            </form>
            <form className="search-panel provider-login-panel">
              <h2>Tasker</h2>
              <p>Pro lidi, kteří chtějí nabízet služby přes Taskovo.</p>
              <label>Email<input type="email" placeholder="tasker@email.cz" /></label>
              <label>Heslo<input type="password" placeholder="••••••••" /></label>
              <button className="button secondary" type="button">Připravujeme</button>
              <a className="button primary" href="/registrace-poskytovatel">Vytvořit profil taskera</a>
            </form>
          </div>
          <p className="fine-print auth-note">Admin vstup je samostatně na adrese /admin/prihlaseni a funguje přes ADMIN_EMAIL + ADMIN_PASSWORD ve Vercel env.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
