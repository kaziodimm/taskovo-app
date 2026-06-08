import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskerForm } from "@/components/TaskerForm";

export default function ProviderRegistrationPage() {
  return (
    <>
      <Header />
      <main className="page-shell split">
        <section className="section-title">
          <p className="kicker">Pro poskytovatele</p>
          <h1 className="page-title">Nabizejte sluzby jako nezavisly poskytovatel</h1>
          <p>Taskovo je marketplace. Poskytovatel neni zamestnanec Taskovo, sam odpovida za opravneni, dane, kvalitu sluzby a komunikaci s klientem.</p>
          <div className="feature-list">
            <div><strong>Profil a overeni</strong><span>Kontakt, mesto, kategorie, pozdeji identita a IČO.</span></div>
            <div><strong>Vlastni nabidky</strong><span>Vy rozhodujete, na ktery ukol odpovite a za jakou cenu.</span></div>
            <div><strong>Recenze a historie</strong><span>Dokoncene ukoly budou budovat reputaci.</span></div>
          </div>
        </section>
        <TaskerForm />
      </main>
      <Footer />
    </>
  );
}
