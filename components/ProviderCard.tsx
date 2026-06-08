import type { FeaturedProvider } from "@/lib/marketplace-data";

export function ProviderCard({ provider }: { provider: FeaturedProvider }) {
  return (
    <article className="provider-card">
      <div className="provider-top">
        <div className="avatar" aria-hidden="true">{provider.name.split(" ").map((part) => part[0]).join("")}</div>
        <div>
          <h3>{provider.name}</h3>
          <p>{provider.city} · {provider.responseTime}</p>
        </div>
        {provider.verified ? <span className="verified-badge">Ověřeno</span> : null}
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
