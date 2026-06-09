import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { getOffers, getTasks } from "@/lib/data";
import { marketplaceCategories } from "@/lib/marketplace-data";
import type { Task } from "@/lib/types";
import styles from "./page.module.css";

type TaskSearchParams = {
  city?: string;
  category?: string;
  status?: string;
  time?: string;
  min?: string;
  max?: string;
  sort?: string;
};

const statusOptions = [
  { value: "open", label: "Otevřené" },
  { value: "offers_received", label: "S nabídkami" },
  { value: "assigned", label: "Přiřazené" },
  { value: "in_progress", label: "Probíhá" },
  { value: "awaiting_confirmation", label: "Čeká na potvrzení" },
  { value: "completed", label: "Hotové" },
];

function selected(value: string | undefined, option: string) {
  return value === option;
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

export default async function TasksPage({ searchParams }: { searchParams: Promise<TaskSearchParams> }) {
  const params = await searchParams;
  const [tasks, offers] = await Promise.all([getTasks(), getOffers()]);
  const filteredTasks = filterTasks(tasks, params);
  const cities = Array.from(new Set(tasks.map((task) => task.city).filter(Boolean))).sort((a, b) => a.localeCompare(b, "cs-CZ"));

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title">
          <p className="kicker">Marketplace</p>
          <h1 className="page-title">Aktuální úkoly</h1>
          <p>Filtrovaný přehled úkolů pro taskery. Vyberte město, kategorii, rozpočet, stav a termín.</p>
        </section>

        <section className={styles.marketLayout}>
          <form className={styles.filterPanel} action="/tasks">
            <h2>Filtry</h2>
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
                    <option value="">Všechny stavy</option>
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
              <h2>{filteredTasks.length} úkolů</h2>
              <span className="pill">{tasks.length} celkem</span>
            </div>
            {filteredTasks.length ? (
              <div className="task-grid">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} offers={offers.filter((offer) => offer.task_id === task.id)} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyResults}>
                <h3>Žádné úkoly podle filtrů</h3>
                <p>Zkuste rozšířit město, cenu nebo stav. U pilotní verze bude počet úkolů růst postupně.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
