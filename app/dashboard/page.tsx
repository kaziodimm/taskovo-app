import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getTasks } from "@/lib/data";

export default async function DashboardPage() {
  const tasks = await getTasks();
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title"><p className="kicker">Klientsky dashboard</p><h1 className="page-title">Vase ukoly a nabidky</h1><p>Po prihlaseni zde klient uvidi sve poptavky, stav vyberu poskytovatele, platby a zpravy.</p></section>
        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Aktivni ukoly</h3><p>{tasks.length} ukolu v databazi pilotu.</p></article>
          <article className="dashboard-panel"><h3>Platby</h3><p>Stripe escrow flow bude: rezervace platby, potvrzeni dokonceni, vyplata poskytovateli.</p></article>
          <article className="dashboard-panel"><h3>Zpravy</h3><p>Komunikace mezi klientem a poskytovatelem pred potvrzenim i po nem.</p></article>
        </div>
      </main>
      <Footer />
    </>
  );
}
