import type { Metadata } from "next";
import { BrandMark } from "@/components/BrandMark";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { updateRecoveredPassword } from "@/app/auth-actions";

export const metadata: Metadata = {
  title: "Nové heslo | Taskovo",
  description: "Nastavení nového hesla pro účet Taskovo.",
  alternates: { canonical: "/nove-heslo" },
  robots: { index: false, follow: false },
};

export default async function NewPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params.error;

  return (
    <>
      <Header />
      <main className="page-shell auth-shell">
        <section className="auth-panel auth-panel-narrow">
          <div className="auth-brand">
            <BrandMark large />
            <div>
              <p className="kicker">Bezpečnost účtu</p>
              <h1 className="page-title">Nastavení nového hesla</h1>
              <p className="hero-lead">Zadejte nové heslo pro svůj účet Taskovo.</p>
            </div>
          </div>

          {error === "password_match" ? <p className="alert-box">Hesla se neshodují.</p> : null}
          {error === "password_length" ? <p className="alert-box">Heslo musí mít alespoň 8 znaků.</p> : null}
          {error === "update_password" ? <p className="alert-box">Heslo se nepodařilo změnit. Otevřete odkaz z emailu znovu nebo si vyžádejte nový.</p> : null}

          <form className="search-panel muted-panel" action={updateRecoveredPassword}>
            <div className="card-heading">
              <h2>Nové heslo</h2>
              <p>Po uložení vás odhlásíme a přihlásíte se novým heslem.</p>
            </div>
            <label>Nové heslo<input name="password" type="password" placeholder="min. 8 znaků" minLength={8} required /></label>
            <label>Potvrzení hesla<input name="confirm_password" type="password" placeholder="zopakujte heslo" minLength={8} required /></label>
            <button className="button primary" type="submit">Uložit nové heslo</button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
