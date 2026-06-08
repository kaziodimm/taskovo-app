import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function LoginPage() {
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
              <p className="hero-lead">Vyberte, jestli chcete zadávat úkoly jako klient, nebo nabízet služby jako nezávislý poskytovatel.</p>
            </div>
          </div>
          <div className="auth-grid">
            <form className="search-panel">
              <h2>Klient</h2>
              <p>Pro zadávání úkolů, porovnání nabídek, zprávy a platby.</p>
              <label>Email<input type="email" placeholder="vas@email.cz" /></label>
              <label>Heslo<input type="password" placeholder="••••••••" /></label>
              <button className="button primary" type="button">Přihlásit se jako klient</button>
              <a className="button secondary" href="/zadat-ukol">Pokračovat bez účtu</a>
            </form>
            <form className="search-panel provider-login-panel">
              <h2>Poskytovatel</h2>
              <p>Pro nabídky, profil, ověření, aktivní úkoly a budoucí výplaty.</p>
              <label>Email<input type="email" placeholder="firma@email.cz" /></label>
              <label>Heslo<input type="password" placeholder="••••••••" /></label>
              <button className="button primary" type="button">Přihlásit se jako poskytovatel</button>
              <a className="button secondary" href="/registrace-poskytovatel">Vytvořit profil poskytovatele</a>
            </form>
          </div>
          <p className="fine-print auth-note">Tato obrazovka je připravená pro další krok vývoje. Samotnou autorizaci napojíme přes Supabase Auth, aby účty, dashboardy a role fungovaly bezpečně.</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
