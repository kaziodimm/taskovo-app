import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { marketplaceCategories } from "@/lib/marketplace-data";

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Kategorie</p>
            <h1 className="page-title">Vyberte typ pomoci</h1>
            <p className="hero-lead">Taskovo zacina u kategorii s jasnou poptavkou, rychlym porovnanim nabidek a lokalni dostupnosti napric Ceskem.</p>
          </div>
          <div className="page-hero-card">
            <strong>8+ kategorii pro pilot</strong>
            <p>Uklid, stehovani, montaz, doruceni, zahrada, opravy a dalsi rozsireni podle realne poptavky.</p>
          </div>
        </section>
        <div className="category-grid">
          {marketplaceCategories.map((category) => <CategoryCard key={category.slug} category={category} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}
