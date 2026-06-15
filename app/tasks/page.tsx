import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { getOffers, getTasks } from "@/lib/data";
import { marketplaceCategories } from "@/lib/marketplace-data";
import { createServerSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import styles from "./page.module.css";

const pageUrl = "https://taskovo.cz/tasks";

export const metadata: Metadata = {
  title: "Dostupné úkoly | Taskovo marketplace",
  description: "Aktuální úkoly na Taskovo pro nezávislé taskery: doručení, montáž, úklid, stěhování a lokální pomoc v Česku.",
  alternates: { canonical: "/tasks" },
  openGraph: {
    title: "Dostupné úkoly | Taskovo",
    description: "Filtrovaný přehled zakázek, na které mohou nezávislí taskeři poslat nabídku.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
    images: [{ url: "https://taskovo.cz/taskovo-logo.svg", width: 512, height: 512, alt: "Taskovo logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dostupné úkoly | Taskovo",
    description: "Filtrovaný přehled zakázek, na které mohou nezávislí taskeři poslat nabídku.",
    images: ["https://taskovo.cz/taskovo-logo.svg"],
  },
  robots: { index: true, follow: true },
};

type TaskSearchParams = {
  city?: string;
  category?: string;
  status?: string;
  time?: string;
  min?: string;
  max?: string;
  sort?: string;
};

const availableTaskStatuses = new Set(["open", "offers_received"]);

const statusOptions = [
  { value: "open", label: "Otevřené" },
  { value: "offers_received", label: "S nabídkami" },
];

const presetLinks = [
  { label: "Praha dnes", href: "/tasks?city=Praha&time=Dnes&sort=newest" },
  { label: "Montáž nábytku", href: "/tasks?category=Montáž&sort=price_desc" },
  { label: "Stěhování", href: "/tasks?category=Stěhování&sort=price_desc" },
  { label: "Rozpočet 1 000+ Kč", href: "/tasks?min=1000&sort=price_desc" },
];

async function getCurrentUser() {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

function includesText(value: string | null | undefined, query: string | undefined) {
  if (!query) return true;
  return (value || "").toLowerCase().includes(query.toLowerCase());
}

function filterTasks(tasks: Task[], params: TaskSearchParams) {
  const min = params.min ? Number(params.min) : null;
  const max = params.max ? Number(params.max) : null;

  const filtered = tasks.filter((task) => {
    if (params.city && !includesText(task.city, params.city)) return false;
    if (params.category && !includesText(task.category, params.category)) return false;
    if (params.status && task.status !== params.status) return false;
    if (params.time && !includesText(task.desired_time, params.time)) return false;
    if (min !== null && task.budget_czk < min) return false;
    if (max !== null && task.budget_czk > max) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    if (params.sort === "price_asc") return a.budget_czk - b.budget_czk;
    if (params.sort === "price_desc") return b.budget_czk - a.budget_czk;
    if (params.sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function formatCzk(value: number) {
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

function activeFilters(params: TaskSearchParams) {
  const filters = [
    params.city ? `Město: ${params.city}` : null,
    params.category ? `Kategorie: ${params.category}` : null,
    params.status ? `Stav: ${statusOptions.find((status) => status.value === params.status)?.label || params.status}` : null,
    params.time ? `Termín: ${params.time}` : null,
    params.min ? `Od ${formatCzk(Number(params.min))}` : null,
    params.max ? `Do ${formatCzk(Number(params.max))}` : null,
  ].filter(Boolean) as string[];

  return filters;
}

function buildTasksSchema(tasks: Task[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Dostupné úkoly na Taskovo",
    description: "Aktuální lokální úkoly, na které mohou nezávislí taskeři poslat nabídku.",
    url: pageUrl,
    itemListElement: tasks.slice(0, 20).map((task, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://taskovo.cz/ukol/${task.id}`,
      item: {
        "@type": "Service",
        name: task.title,
        serviceType: task.category,
        areaServed: task.city,
        description: task.description,
        offers: {
          "@type": "Offer",
          price: task.budget_czk,
          priceCurrency: "CZK",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
}

const searchActionSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Taskovo",
  url: "https://taskovo.cz",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://taskovo.cz/tasks?category={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default async function TasksPage({ searchParams }: { searchParams: Promise<TaskSearchParams> }) {
  const params = await searchParams;
  const [tasks, offers, user] = await Promise.all([getTasks(), getOffers(), getCurrentUser()]);
  const isTasker = user?.user_metadata?.role === "tasker";
  const availableTasks = tasks.filter((task) => availableTaskStatuses.has(task.status));
  const filteredTasks = filterTasks(availableTasks, params);
  const cities = Array.from(new Set(availableTasks.map((task) => task.city).filter(Boolean))).sort((a, b) => a.localeCompare(b, "cs-CZ"));
  const totalBudget = filteredTasks.reduce((sum, task) => sum + task.budget_czk, 0);
  const offerCount = offers.filter((offer) => availableTasks.some((task) => task.id === offer.task_id)).length;
  const filters = activeFilters(params);
  const averageBudget = filteredTasks.length ? Math.round(totalBudget / filteredTasks.length) : 0;
  const offerUnavailable = user ? (
    <>
      <p>Nabídky mohou posílat jen účty registrované jako tasker.</p>
      <a className="button secondary" href="/prihlaseni?mode=tasker">Vytvořit tasker účet</a>
    </>
  ) : (
    <>
      <p>Pro poslání nabídky se přihlaste nebo vytvořte tasker účet.</p>
      <a className="button primary" href="/prihlaseni?mode=tasker">Registrovat taskera</a>
    </>
  );

  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildTasksSchema(filteredTasks)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(searchActionSchema) }} />
        <section className="section-title">
          <p className="kicker">Marketplace pro taskery</p>
          <h1 className="page-title">Dostupné úkoly</h1>
          <p>Filtrovaný přehled zakázek pro taskery. Vyberte město, kategorii, rozpočet, stav a termín. Nabídku posílá nezávislý tasker, klient si vybírá sám.</p>
        </section>

        <section className={styles.marketIntro} aria-label="Souhrn marketplace">
          <article><span>Aktivní poptávky</span><strong>{availableTasks.length} úkolů</strong><p>Zakázky, na které lze poslat nabídku.</p></article>
          <article><span>Rozpočet výběru</span><strong>{formatCzk(totalBudget)}</strong><p>Součet rozpočtů ve zobrazených výsledcích.</p></article>
          <article><span>Průměr</span><strong>{averageBudget ? formatCzk(averageBudget) : "-"}</strong><p>Orientační hodnota jedné zakázky ve filtru.</p></article>
          <article><span>Aktivita</span><strong>{offerCount} nabídek</strong><p>Signál pilotní marketplace aktivity.</p></article>
        </section>

        <section className={styles.quickSearch} aria-label="Rychlé filtry">
          <div>
            <strong>Rychlý výběr</strong>
            <p>Nejčastější scénáře pro taskery v pilotní verzi.</p>
          </div>
          <nav aria-label="Rychlé filtry úkolů">
            {presetLinks.map((preset) => <a key={preset.href} href={preset.href}>{preset.label}</a>)}
          </nav>
        </section>

        <section className={styles.marketLayout}>
          <form className={styles.filterPanel} action="/tasks">
            <h2>Filtry</h2>
            <p className={styles.filterHint}>Zúžení funguje jako v obchodě: lokalita, typ práce, cena a řazení.</p>
            <details className={styles.filterGroup} open>
              <summary>Lokalita</summary>
              <div className={styles.filterFields}>
                <label>Město
                  <select name="city" defaultValue={params.city || ""}>
                    <option value="">Všechna města</option>
                    {cities.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </label>
              </div>
            </details>

            <details className={styles.filterGroup} open>
              <summary>Kategorie</summary>
              <div className={styles.filterFields}>
                <label>Typ práce
                  <select name="category" defaultValue={params.category || ""}>
                    <option value="">Všechny kategorie</option>
                    {marketplaceCategories.map((category) => <option key={category.slug} value={category.shortTitle}>{category.title}</option>)}
                  </select>
                </label>
              </div>
            </details>

            <details className={styles.filterGroup} open>
              <summary>Cena</summary>
              <div className={styles.filterFields}>
                <label>Od<input name="min" type="number" min="0" step="50" defaultValue={params.min || ""} placeholder="0" /></label>
                <label>Do<input name="max" type="number" min="0" step="50" defaultValue={params.max || ""} placeholder="5000" /></label>
              </div>
            </details>

            <details className={styles.filterGroup}>
              <summary>Stav a termín</summary>
              <div className={styles.filterFields}>
                <label>Stav
                  <select name="status" defaultValue={params.status || ""}>
                    <option value="">Všechny dostupné</option>
                    {statusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </label>
                <label>Termín<input name="time" type="text" defaultValue={params.time || ""} placeholder="Dnes, víkend, večer..." /></label>
              </div>
            </details>

            <details className={styles.filterGroup} open>
              <summary>Řazení</summary>
              <div className={styles.filterFields}>
                <label>Seřadit
                  <select name="sort" defaultValue={params.sort || "newest"}>
                    <option value="newest">Nejnovější</option>
                    <option value="oldest">Nejstarší</option>
                    <option value="price_desc">Cena sestupně</option>
                    <option value="price_asc">Cena vzestupně</option>
                  </select>
                </label>
              </div>
            </details>

            <button className="button primary" type="submit">Použít filtry</button>
            <a className="button secondary" href="/tasks">Vymazat</a>
          </form>

          <div>
            <div className={styles.resultsHeader}>
              <div>
                <h2>{filteredTasks.length} dostupných úkolů</h2>
                <p>{isTasker ? "Můžete poslat nabídku přímo z karty úkolu." : "Pro posílání nabídek je potřeba tasker účet."}</p>
              </div>
              <div className={styles.resultsMeta}><span className="pill">{availableTasks.length} dostupných celkem</span><span className="pill status-offers_received">Klient vybírá</span></div>
            </div>

            {filters.length ? (
              <div className={styles.activeFilters} aria-label="Aktivní filtry">
                <strong>Aktivní filtry</strong>
                {filters.map((filter) => <span key={filter}>{filter}</span>)}
                <a href="/tasks">Vymazat vše</a>
              </div>
            ) : null}

            <div className={styles.trustStrip} aria-label="Bezpečnost a role platformy">
              <span>Tasker je nezávislý OSVČ nebo firma</span>
              <span>Klient vybírá nabídku samostatně</span>
              <span>Kontakt se ukáže po potvrzení výběru</span>
            </div>

            {filteredTasks.length ? (
              <div className="task-grid">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    offers={offers.filter((offer) => offer.task_id === task.id)}
                    showOfferForm={isTasker}
                    authenticatedTasker={isTasker}
                    offerUnavailable={offerUnavailable}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyResults}>
                <h3>Žádné dostupné úkoly podle filtrů</h3>
                <p>Zkuste rozšířit město, cenu nebo termín. U pilotní verze bude počet dostupných zakázek růst postupně.</p>
                <div className={styles.emptyActions}>
                  <a className="button secondary" href="/tasks">Zobrazit vše</a>
                  <a className="button primary" href="/poskytovatel/dashboard">Zpět do dashboardu</a>
                </div>
              </div>
            )}
            <div className={styles.marketNote}><strong>Role Taskovo</strong>Taskovo pouze propojuje klienta a taskera. Tasker není zaměstnanec Taskovo a službu poskytuje samostatně jako OSVČ nebo firma.</div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
