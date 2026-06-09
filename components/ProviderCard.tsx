import type { FeaturedProvider } from "@/lib/marketplace-data";

const verifiedBadgeStyle = {
  color: "#0d1b2a",
  background: "linear-gradient(135deg, #f5c542 0%, #ff6b35 100%)",
  boxShadow: "0 8px 20px rgba(255, 107, 53, 0.22)",
} as const;

export function ProviderCard({ provider }: { provider: FeaturedProvider }) {
  return (
    <article className="provider-card">
      <div className="provider-top">
        <div className="avatar" aria-hidden="true">{provider.name.split(" ").map((part) => part[0]).join("")}</div>
        <div>
          <h3>{provider.name}</h3>
          <p>{provider.city} · {provider.responseTime}</p>
        </div>
        {provider.verified ? <span className="verified-badge" style={verifiedBadgeStyle}>✓ Ověřeno</span> : null}
      </div>
      <p>{provider.bio}</p>
      <div className="provider-metrics">
        <span><strong>{provider.rating.toFixed(1)}</strong> hodnocení</span>
        <span><strong>{provider.completedTasks}</strong> úkolů</span>
        <span><strong>{provider.priceFrom}</strong> od</span>
      </div>
      <div className="chip-row">
        {provider.categories.map((category) => <span key={category}>{category}</span>)}
      </div>
      <a className="button secondary" href={`/poskytovatel/${provider.id}`}>Zobrazit profil</a>
    </article>
  );
}
