import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ProviderDashboardPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title"><p className="kicker">Dashboard poskytovatele</p><h1 className="page-title">Nabidky, ukoly a vyplaty</h1><p>Budouci pracovni plocha pro nezavisle poskytovatele: dostupne poptavky, odeslane nabidky, aktivni prace a vyplaty.</p></section>
        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Dostupne ukoly</h3><p>Filtry podle mesta, kategorie, rozpoctu a casu.</p></article>
          <article className="dashboard-panel"><h3>Moje nabidky</h3><p>Prehled cen, zprav a stavu vyberu klientem.</p></article>
          <article className="dashboard-panel"><h3>Vyplaty</h3><p>Stripe Connect nebo podobny model po overeni pravniho nastaveni.</p></article>
        </div>
      </main>
      <Footer />
    </>
  );
}
