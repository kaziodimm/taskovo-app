import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import { featuredProviders, marketplaceCategories, cities } from "@/lib/marketplace-data";

export default function ProvidersPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div><p className="kicker">Poskytovatele</p><h1 className="page-title">Najdete overene lidi ve svem okoli</h1><p className="hero-lead">Filtry budou v dalsi fazi napojene na profily, dostupnost, recenze, IČO a ceny.</p></div>
          <form className="search-panel"><label>Mesto<select>{cities.map((city) => <option key={city}>{city}</option>)}</select></label><label>Kategorie<select>{marketplaceCategories.map((category) => <option key={category.slug}>{category.title}</option>)}</select></label><button className="button primary" type="button">Filtrovat</button></form>
        </section>
        <div className="provider-grid">{featuredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div>
      </main>
      <Footer />
    </>
  );
}
