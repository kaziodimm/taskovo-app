import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getTaskerById } from "@/lib/data";
import { featuredProviders, type FeaturedProvider } from "@/lib/marketplace-data";
import type { TaskerProfile } from "@/lib/types";
import styles from "./page.module.css";

export function generateStaticParams() {
  return featuredProviders.map((provider) => ({ id: provider.id }));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "T";
}

function taskerToProvider(profile: TaskerProfile): FeaturedProvider {
  return {
    id: profile.id,
    name: profile.name,
    city: profile.city,
    rating: profile.verified ? 4.7 : 4.3,
    reviews: 0,
    completedTasks: 0,
    priceFrom: "dohodou",
    categories: profile.categories.split(",").map((category) => category.trim()).filter(Boolean).slice(0, 4),
    verified: profile.verified,
    responseTime: "odpověď podle dostupnosti",
    bio: profile.bio || "Tasker připravený přijímat lokální úkoly přes Taskovo.",
    avatarUrl: profile.avatar_url || null,
  };
}

async function findProvider(id: string) {
  const liveTasker = await getTaskerById(id);
  if (liveTasker) return taskerToProvider(liveTasker);
  return featuredProviders.find((item) => item.id === id) || null;
}

export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await findProvider(id);
  if (!provider) notFound();

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className={styles.profileHero}>
          <div className={styles.profileCopy}>
            <p className="kicker">Profil taskera</p>
            <h1 className="page-title">{provider.name}</h1>
            <p className="hero-lead">{provider.bio}</p>
            <div className={styles.categoryRail}>{provider.categories.map((category) => <span key={category}>{category}</span>)}</div>
          </div>

          <aside className={styles.profileSummaryCard} aria-label={`Souhrn profilu ${provider.name}`}>
            <div className={styles.mediaFrame}>
              {provider.avatarUrl ? (
                <img className={styles.mediaImage} src={provider.avatarUrl} alt={`Profilové foto ${provider.name}`} />
              ) : (
                <div className={styles.mediaFallback} aria-hidden="true">{initials(provider.name)}</div>
              )}
              <span className={provider.verified ? styles.verifiedBadge : styles.waitingBadge}>{provider.verified ? "✓ Ověřeno" : "Čeká na ověření"}</span>
            </div>

            <div className={styles.summaryBody}>
              <div className={styles.identity}>
                <strong>{provider.name}</strong>
                <span>{provider.city} · {provider.responseTime}</span>
              </div>
              <p className={styles.bioText}>{provider.bio}</p>
              <div className={styles.metrics}>
                <span><strong>{provider.rating.toFixed(1)}</strong> hodnocení</span>
                <span><strong>{provider.completedTasks}</strong> úkolů</span>
                <span><strong>{provider.priceFrom}</strong> od</span>
              </div>
            </div>

            <a className="button primary" href={`/zadat-ukol?tasker=${provider.id}`}>Zadat úkol</a>
          </aside>
        </section>

        <section className={styles.detailGrid}>
          <article className={`dashboard-panel ${styles.detailPanel}`}><h3>Ověření</h3><p>{provider.verified ? "Profil je označený jako ověřený administrátorem Taskovo." : "Profil čeká na ověření administrátorem Taskovo."}</p></article>
          <article className={`dashboard-panel ${styles.detailPanel}`}><h3>Dostupnost</h3><p>{provider.city} a okolí · {provider.responseTime}</p></article>
          <article className={`dashboard-panel ${styles.detailPanel}`}><h3>Bezpečnost</h3><p>Klient potvrzuje výběr taskera sám. Taskovo je zprostředkovatelská platforma pro lokální služby.</p></article>
        </section>
      </main>
      <Footer />
    </>
  );
}
