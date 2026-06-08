import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getTasks } from "@/lib/data";

export default async function DashboardPage() {
  const tasks = await getTasks();
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Klientský dashboard</p>
            <h1 className="page-title">Vaše úkoly, nabídky a zprávy</h1>
            <p className="hero-lead">Toto bude osobní prostor klienta po přihlášení. Přímý vstup jsme přesunuli na stránku přihlášení, aby nevznikal zmatek.</p>
          </div>
          <div className="page-hero-card"><strong>{tasks.length}</strong><p>úkolů v pilotní databázi</p></div>
        </section>
        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Moje úkoly</h3><p>Přehled zadaných úkolů, stav nabídek a vybraný poskytovatel.</p></article>
          <article className="dashboard-panel"><h3>Platby</h3><p>Po napojení Stripe zde bude rezervace platby, potvrzení dokončení a historie plateb.</p></article>
          <article className="dashboard-panel"><h3>Zprávy</h3><p>Bezpečná komunikace s poskytovatelem k jednotlivým úkolům.</p></article>
        </div>
      </main>
      <Footer />
    </>
  );
}
