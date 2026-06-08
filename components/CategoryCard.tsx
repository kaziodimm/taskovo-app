import type { MarketplaceCategory } from "@/lib/marketplace-data";

export function CategoryCard({ category }: { category: MarketplaceCategory }) {
  return (
    <a className="category-card" href={`/kategorie/${category.slug}`}>
      <span className="category-icon">{category.icon}</span>
      <span>
        <strong>{category.title}</strong>
        <small>{category.summary}</small>
      </span>
      <em>{category.averagePrice}</em>
    </a>
  );
}
