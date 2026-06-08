import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import { cities, featuredProviders, marketplaceCategories } from "@/lib/marketplace-data";

export default function ProvidersPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Taskeři</p>
            <h1 className="page-title">Najděte šikovné lidi ve svém okolí</h1>
            <p className="hero-lead">Tasker je člověk nebo firma, která přes Taskovo nabízí konkrétní službu. Filtry postupně napojíme na dostupnost, recenze, ověření a ceny.</p>
          </div>
          <form className="search-panel"><label>Město<select>{cities.map((city) => <option key={city}>{city}</option>)}</select></label><label>Kategorie<select>{marketplaceCategories.map((category) => <option key={category.slug}>{category.title}</option>)}</select></label><button className="button primary" type="button">Filtrovat</button></form>
        </section>
        <div className="provider-grid">{featuredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div>
      </main>
      <Footer />
    </>
  );
}
