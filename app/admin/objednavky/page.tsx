import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminTasks, getOffers, getTaskMessageCounts } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { Task, TaskStatus } from "@/lib/types";
import styles from "../prehled/page.module.css";

const statusLabels: Record<TaskStatus, string> = {
  pending_review: "Kontrola",
  open: "Otevřeno",
  offers_received: "Nabídky",
  assigned: "Tasker vybrán",
  in_progress: "Probíhá",
  awaiting_confirmation: "Čeká na klienta",
  completed: "Hotovo",
  cancelled: "Zrušeno",
  disputed: "Spor",
};

const statusOptions = Object.entries(statusLabels);

type AdminOrdersSearchParams = Promise<{
  q?: string;
  status?: string;
  sort?: string;
}>;

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesTerm(task: Task, term: string) {
  if (!term) return true;
  const haystack = [
    task.title,
    task.description,
    task.category,
    task.city,
    task.district,
    task.client_name,
    task.client_contact,
    task.budget_czk,
    statusLabels[task.status],
  ].map((value) => normalize(String(value ?? ""))).join(" ");

  return haystack.includes(term);
}

function isKnownStatus(status?: string): status is TaskStatus {
  return Boolean(status && status in statusLabels);
}

function money(value: number) {
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" });
}

function statusClass(status: TaskStatus) {
  if (status === "disputed" || status === "cancelled") return styles.warningPill;
  if (status === "completed") return styles.successPill;
  return styles.statusPill;
}

function sortTasks(tasks: Task[], sort: string) {
  const sorted = [...tasks];
  if (sort === "budget_desc") return sorted.sort((a, b) => b.budget_czk - a.budget_czk);
  if (sort === "budget_asc") return sorted.sort((a, b) => a.budget_czk - b.budget_czk);
  if (sort === "oldest") return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default async function AdminOrdersPage({ searchParams }: { searchParams?: AdminOrdersSearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const params = searchParams ? await searchParams : {};
  const q = params.q || "";
  const term = normalize(q);
  const status = isKnownStatus(params.status) ? params.status : "all";
  const sort = ["newest", "oldest", "budget_desc", "budget_asc"].includes(params.sort || "") ? params.sort || "newest" : "newest";

  const [tasks, offers] = await Promise.all([getAdminTasks(), getOffers()]);
  const messageCounts = await getTaskMessageCounts(tasks.map((task) => task.id));
  const offersByTask = new Map<string, typeof offers>();
  offers.forEach((offer) => offersByTask.set(offer.task_id, [...(offersByTask.get(offer.task_id) || []), offer]));

  const filteredTasks = sortTasks(
    tasks.filter((task) => (status === "all" || task.status === status) && includesTerm(task, term)),
    sort,
  );
  const visibleTasks = filteredTasks.slice(0, 100);
  const hiddenCount = Math.max(filteredTasks.length - visibleTasks.length, 0);

  const openTaskCount = tasks.filter((task) => ["open", "offers_received"].includes(task.status)).length;
  const activeTaskCount = tasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status)).length;
  const disputedTaskCount = tasks.filter((task) => task.status === "disputed").length;
  const cancelledTaskCount = tasks.filter((task) => task.status === "cancelled").length;

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin · objednávky</p>
            <h1 className="page-title">Správa objednávek</h1>
            <p className="hero-lead">Samostatný pracovní seznam pro hledání, kontrolu a rychlý přechod do detailu objednávky.</p>
          </div>
          <div className="page-hero-card"><strong>{tasks.length}</strong><p>objednávek celkem</p></div>
        </section>

        <form className={styles.filterPanel} action="/admin/objednavky">
          <div className={styles.filterGrid}>
            <label>Hledat
              <input name="q" type="search" defaultValue={q} placeholder="úkol, klient, město, kontakt..." />
            </label>
            <label>Stav
              <select name="status" defaultValue={status}>
                <option value="all">Všechny stavy</option>
                {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Řazení
              <select name="sort" defaultValue={sort}>
                <option value="newest">Nejnovější</option>
                <option value="oldest">Nejstarší</option>
                <option value="budget_desc">Rozpočet od nejvyššího</option>
                <option value="budget_asc">Rozpočet od nejnižšího</option>
              </select>
            </label>
            <div className={styles.filterActions}>
              <button className="button primary" type="submit">Filtrovat</button>
              <a className="button secondary" href="/admin/objednavky">Vyčistit</a>
            </div>
          </div>
          <div className={styles.resultTabs} aria-label="Rychlé odkazy objednávek">
            <a href="/admin/prehled">Přehled</a>
            <a href="/admin">Operační centrum</a>
            <a href="/tasks">Marketplace</a>
          </div>
        </form>

        <section className={styles.summaryGrid} aria-label="Souhrn objednávek">
          <article className={styles.summaryCard}><span>Otevřené</span><strong>{openTaskCount}</strong><p>Čekají na nabídky nebo výběr taskera.</p></article>
          <article className={styles.summaryCard}><span>Aktivní</span><strong>{activeTaskCount}</strong><p>Přiřazené, probíhající nebo čekající na klienta.</p></article>
          <article className={styles.summaryCard}><span>Spory</span><strong>{disputedTaskCount}</strong><p>Vyžadují ruční zásah administrace.</p></article>
          <article className={styles.summaryCard}><span>Archiv</span><strong>{cancelledTaskCount}</strong><p>Zrušené objednávky pro historii.</p></article>
        </section>

        <section className={styles.resultSection}>
          <div className={styles.sectionHeader}>
            <div><h2>Výsledky</h2><p>Zobrazuje se maximálně 100 objednávek, aby administrace zůstala rychlá.</p></div>
            <span className={styles.countPill}>{filteredTasks.length} výsledků</span>
          </div>
          <div className={styles.resultList}>
            {visibleTasks.length ? visibleTasks.map((task) => {
              const taskOffers = offersByTask.get(task.id) || [];
              const acceptedOffer = taskOffers.find((offer) => offer.id === task.accepted_offer_id || offer.status === "accepted");
              return (
                <article className={styles.resultRow} key={task.id}>
                  <div className={styles.resultMain}>
                    <strong>{task.title}</strong>
                    <p>{task.category} · {task.city}{task.district ? ` · ${task.district}` : ""} · vytvořeno {dateTime(task.created_at)}</p>
                  </div>
                  <div className={styles.resultMeta}>
                    <strong>{task.client_name}</strong>
                    <p>{acceptedOffer?.tasker_name ? `Tasker: ${acceptedOffer.tasker_name}` : "Tasker zatím nevybrán"}</p>
                  </div>
                  <div className={styles.rowBadges}>
                    <span className={statusClass(task.status)}>{statusLabels[task.status]}</span>
                    <span className={styles.statusPill}>{money(task.budget_czk)}</span>
                    <span className={styles.statusPill}>{taskOffers.length} nabídek</span>
                    <span className={styles.statusPill}>{messageCounts[task.id] || 0} zpráv</span>
                  </div>
                  <a className="button secondary" href={`/admin/tasks/${task.id}`}>Detail</a>
                </article>
              );
            }) : (
              <div className={styles.emptyState}><strong>Žádné objednávky</strong><p>Zkuste změnit hledaný text, stav nebo řazení.</p></div>
            )}
          </div>
          {hiddenCount ? <p className={styles.emptyState}><strong>Další výsledky jsou skryté</strong><span>Zúžte hledání nebo filtr. Skryto: {hiddenCount} objednávek.</span></p> : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
