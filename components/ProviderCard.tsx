import type { FeaturedProvider } from "@/lib/marketplace-data";
import styles from "./ProviderCard.module.css";

const verifiedBadgeStyle = {
  color: "#0d1b2a",
  background: "linear-gradient(135deg, #f5c542 0%, #ff6b35 100%)",
  boxShadow: "0 8px 20px rgba(255, 107, 53, 0.22)",
} as const;

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function trustLabel(provider: FeaturedProvider) {
  if (provider.verified) return "Ověřený profil";
  if (provider.completedTasks > 0) return "Historie úkolů";
  return "Nový profil";
}

export function ProviderCard({ provider }: { provider: FeaturedProvider }) {
  return (
    <article className={`provider-card ${styles.card}`}>
      <div className={styles.mediaFrame}>
        {provider.avatarUrl ? (
          <img className={styles.mediaImage} src={provider.avatarUrl} alt={`Profilové foto ${provider.name}`} />
        ) : (
          <div className={styles.mediaFallback} aria-hidden="true">{initials(provider.name)}</div>
        )}
        {provider.verified ? <span className={`verified-badge ${styles.badge}`} style={verifiedBadgeStyle}>Ověřeno</span> : <span className={`${styles.badge} ${styles.newBadge}`}>Nový profil</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.identity}>
          <h3>{provider.name}</h3>
          <p>{provider.city} · {provider.responseTime}</p>
        </div>
        <p className={styles.bio}>{provider.bio}</p>
        <div className={styles.trustRow}>
          <span>{trustLabel(provider)}</span>
          <span>{provider.reviews ? `${provider.reviews} recenzí` : "Recenze po pilotu"}</span>
        </div>
        <div className={`provider-metrics ${styles.metrics}`}>
          <span><strong>{provider.rating.toFixed(1)}</strong> hodnocení</span>
          <span><strong>{provider.completedTasks}</strong> úkolů</span>
          <span><strong>{provider.priceFrom}</strong> od</span>
        </div>
        <div className={`chip-row ${styles.chips}`}>
          {provider.categories.map((category) => <span key={category}>{category}</span>)}
        </div>
        <a className={`button secondary ${styles.action}`} href={`/poskytovatel/${provider.id}`}>Zobrazit profil</a>
      </div>
    </article>
  );
}
