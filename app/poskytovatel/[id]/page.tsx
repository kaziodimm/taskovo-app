import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getTaskerById } from "@/lib/data";
import { featuredProviders, type FeaturedProvider } from "@/lib/marketplace-data";
import type { TaskerProfile } from "@/lib/types";
import styles from "./page.module.css";

const siteUrl = "https://taskovo.cz";

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

function profileDescription(provider: FeaturedProvider) {
  const categories = provider.categories.slice(0, 3).join(", ");
  return `${provider.name} nabízí ${categories || "lokální služby"} v lokalitě ${provider.city}. Taskovo je zprostředkovatelská platforma, klient si taskera vybírá samostatně.`;
}

function providerSchema(provider: FeaturedProvider) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: provider.name,
    description: profileDescription(provider),
    url: `${siteUrl}/poskytovatel/${provider.id}`,
    image: provider.avatarUrl || `${siteUrl}/taskovo-logo.svg`,
    areaServed: provider.city,
    address: {
      "@type": "PostalAddress",
      addressLocality: provider.city,
      addressCountry: "CZ",
    },
    knowsAbout: provider.categories,
    priceRange: provider.priceFrom,
  };

  if (provider.reviews > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: provider.rating.toFixed(1),
      reviewCount: provider.reviews,
    };
  }

  return schema;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const provider = await findProvider(id);

  if (!provider) {
    return {
      title: "Tasker nenalezen | Taskovo",
      description: "Profil taskera na Taskovo nebyl nalezen.",
      robots: { index: false, follow: false },
    };
  }

  const description = profileDescription(provider);
  const title = `${provider.name} | Tasker ${provider.city} | Taskovo`;

  return {
    title,
    description,
    alternates: { canonical: `/poskytovatel/${provider.id}` },
    openGraph: {
      title,
      description,
      url: `/poskytovatel/${provider.id}`,
      siteName: "Taskovo",
      type: "profile",
      images: [
        {
          url: provider.avatarUrl || "/taskovo-logo.svg",
          width: 512,
          height: 512,
          alt: `Profil ${provider.name}`,
        },
      ],
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProviderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = await findProvider(id);
  if (!provider) notFound();

  const trustItems = [
    provider.verified ? "Profil ověřen administrátorem" : "Profil čeká na ověření",
    "Klient vybírá taskera samostatně",
    "Taskovo službu zprostředkovává",
  ];

  return (
    <>
      <Header />
      <main className="page-shell">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(providerSchema(provider)) }}
        />

        <section className={styles.profileHero}>
          <div className={styles.profileCopy}>
            <p className="kicker">Profil taskera</p>
            <h1 className="page-title">{provider.name}</h1>
            <p className="hero-lead">{provider.bio}</p>
            <div className={styles.categoryRail}>{provider.categories.map((category) => <span key={category}>{category}</span>)}</div>
            <div className={styles.profileTrustStrip} aria-label="Důvěryhodnost profilu">
              {trustItems.map((item) => <span key={item}>{item}</span>)}
            </div>
            <div className={styles.heroActions}>
              <a className="button primary" href={`/zadat-ukol?tasker=${provider.id}`}>Zadat úkol pro tohoto taskera</a>
              <a className="button secondary" href="/poskytovatele">Zpět na taskery</a>
            </div>
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

        <section className={styles.profileOverview} aria-label="Informace o spolupráci">
          <article className={`dashboard-panel ${styles.servicePanel}`}>
            <p className="kicker">Služby</p>
            <h2>Co může tasker řešit</h2>
            <div className={styles.serviceList}>
              {provider.categories.map((category) => <span key={category}>{category}</span>)}
            </div>
          </article>

          <article className={`dashboard-panel ${styles.platformPanel}`}>
            <p className="kicker">Role Taskovo</p>
            <h2>Platforma, ne zaměstnavatel</h2>
            <p>Taskovo pouze propojuje klienta a taskera. Tasker je nezávislý OSVČ nebo firma a klient si finální výběr potvrzuje samostatně.</p>
          </article>
        </section>

        <section className={styles.workflowGrid} aria-label="Jak spolupráce probíhá">
          <article>
            <span>1</span>
            <h3>Zadáte úkol</h3>
            <p>Popíšete, co potřebujete, přidáte lokalitu, rozpočet a případné fotky v detailu úkolu.</p>
          </article>
          <article>
            <span>2</span>
            <h3>Domluvíte se s taskerem</h3>
            <p>Tasker reaguje podle dostupnosti. Vy si ověříte cenu, termín a rozsah práce.</p>
          </article>
          <article>
            <span>3</span>
            <h3>Potvrdíte dokončení</h3>
            <p>Po dokončení úkolu zůstane prostor pro hodnocení, historii a později i bezpečnou platbu.</p>
          </article>
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
