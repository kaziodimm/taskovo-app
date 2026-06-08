import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { featuredProviders } from "@/lib/marketplace-data";

export function generateStaticParams() {
  return featuredProviders.map((provider) => ({ id: provider.id }));
}

export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = featuredProviders.find((item) => item.id === id);
  if (!provider) notFound();

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Profil poskytovatele</p>
            <h1 className="page-title">{provider.name}</h1>
            <p className="hero-lead">{provider.bio}</p>
            <div className="chip-row">{provider.categories.map((category) => <span key={category}>{category}</span>)}</div>
          </div>
          <div className="page-hero-card"><strong>{provider.rating.toFixed(1)} / 5</strong><p>{provider.reviews} recenzi · {provider.completedTasks} dokoncenych ukolu · {provider.priceFrom}</p></div>
        </section>
        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Overeni</h3><p>Telefon overen. IČO a doklady budou soucasti produkcniho onboardingu.</p></article>
          <article className="dashboard-panel"><h3>Dostupnost</h3><p>{provider.city} a okoli · {provider.responseTime}</p></article>
          <article className="dashboard-panel"><h3>Bezpecnost</h3><p>Klient potvrzuje vyber poskytovatele sam. Taskovo pouze zprostredkovava platformu.</p></article>
        </div>
      </main>
      <Footer />
    </>
  );
}
