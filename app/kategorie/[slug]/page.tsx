import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProviderCard } from "@/components/ProviderCard";
import { featuredProviders, marketplaceCategories } from "@/lib/marketplace-data";

export function generateStaticParams() {
  return marketplaceCategories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = marketplaceCategories.find((item) => item.slug === slug);
  if (!category) notFound();

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Kategorie</p>
            <h1 className="page-title">{category.title}</h1>
            <p className="hero-lead">{category.description}</p>
            <div className="hero-actions"><a className="button primary" href="/zadat-ukol">Zadat ukol</a><a className="button secondary" href="/poskytovatele">Najit poskytovatele</a></div>
          </div>
          <div className="page-hero-card">
            <strong>{category.averagePrice}</strong>
            <p>{category.responseTime}</p>
          </div>
        </section>
        <section className="section-title"><p className="kicker">Typicke ukoly</p><h2>Co muzete zadat</h2></section>
        <div className="category-grid">
          {category.examples.map((example) => <article className="legal-card" key={example}><h3>{example}</h3><p>Klient zada detaily, misto, termin a rozpocet. Poskytovatele poslou nabidky.</p></article>)}
        </div>
        <section className="section">
          <div className="section-title"><p className="kicker">Doporuceni poskytovatele</p><h2>Profily vhodne pro tuto kategorii</h2></div>
          <div className="provider-grid">{featuredProviders.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div>
        </section>
      </main>
      <Footer />
    </>
  );
}
