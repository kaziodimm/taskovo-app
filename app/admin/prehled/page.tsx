import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminTasks, getClients, getOffers, getTaskers } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { ClientProfile, Offer, Task, TaskStatus, TaskerProfile } from "@/lib/types";
import styles from "./page.module.css";

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

type AdminOverviewSearchParams = Promise<{
  q?: string;
  status?: string;
  profile?: string;
  verification?: string;
}>;

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesTerm(fields: Array<string | number | null | undefined>, term: string) {
  if (!term) return true;
  return fields.some((field) => normalize(String(field ?? "")).includes(term));
}

function money(value: number) {
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

function date(value: string) {
  return new Date(value).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isKnownStatus(status?: string): status is TaskStatus {
  return Boolean(status && status in statusLabels);
}

function matchTask(task: Task, term: string, status: string) {
  const statusMatch = status === "all" || task.status === status;
  return statusMatch && includesTerm([
    task.title,
    task.description,
    task.category,
    task.city,
    task.district,
    task.client_name,
    task.client_contact,
    task.budget_czk,
  ], term);
}

function matchTasker(tasker: TaskerProfile, term: string, profile: string, verification: string) {
  const profileMatch = profile === "all" || profile === "taskers";
  const verificationMatch = verification === "all"
    || (verification === "verified" && tasker.verified)
    || (verification === "unverified" && !tasker.verified)
    || (verification === "photo_pending" && Boolean(tasker.pending_avatar_url));

  return profileMatch && verificationMatch && includesTerm([
    tasker.name,
    tasker.email,
    tasker.city,
    tasker.categories,
    tasker.contact,
    tasker.bio,
  ], term);
}

function matchClient(client: ClientProfile, term: string, profile: string, verification: string) {
  const profileMatch = profile === "all" || profile === "clients";
  const verificationMatch = verification === "all"
    || (verification === "photo_pending" && Boolean(client.pending_avatar_url));

  return profileMatch && verificationMatch && includesTerm([
    client.name,
    client.email,
    client.phone,
    client.city,
    client.preferred_language,
  ], term);
}

function matchOffer(offer: Offer, term: string) {
  return includesTerm([offer.tasker_name, offer.tasker_contact, offer.message, offer.price_czk, offer.status], term);
}

function statusClass(status: string) {
  if (status === "disputed" || status === "cancelled") return styles.warningPill;
  if (status === "completed" || status === "accepted") return styles.successPill;
  return styles.statusPill;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className={styles.emptyState}><strong>{title}</strong><p>{body}</p></div>;
}

export default async function AdminOverviewPage({ searchParams }: { searchParams?: AdminOverviewSearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const params = searchParams ? await searchParams : {};
  const q = params.q || "";
  const term = normalize(q);
  const status = isKnownStatus(params.status) ? params.status : "all";
  const profile = ["clients", "taskers"].includes(params.profile || "") ? params.profile || "all" : "all";
  const verification = ["verified", "unverified", "photo_pending"].includes(params.verification || "") ? params.verification || "all" : "all";

  const [tasks, taskers, clients, offers] = await Promise.all([getAdminTasks(), getTaskers(), getClients(), getOffers()]);
  const filteredTasks = tasks.filter((task) => matchTask(task, term, status)).slice(0, 80);
  const filteredTaskers = taskers.filter((tasker) => matchTasker(tasker, term, profile, verification)).slice(0, 80);
  const filteredClients = clients.filter((client) => matchClient(client, term, profile, verification)).slice(0, 80);
  const filteredOffers = offers.filter((offer) => matchOffer(offer, term)).slice(0, 80);

  const openTaskCount = tasks.filter((task) => ["open", "offers_received"].includes(task.status)).length;
  const activeTaskCount = tasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status)).length;
  const pendingPhotoCount = taskers.filter((tasker) => tasker.pending_avatar_url).length + clients.filter((client) => client.pending_avatar_url).length;
  const unverifiedTaskerCount = taskers.filter((tasker) => !tasker.verified).length;

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin · přehled</p>
            <h1 className="page-title">Rychlé vyhledávání v marketplace</h1>
            <p className="hero-lead">Kompaktní pracovní pohled pro objednávky, klienty, taskery a nabídky. Slouží k rychlé orientaci, když začne růst počet záznamů.</p>
          </div>
          <div className="page-hero-card"><strong>{tasks.length + taskers.length + clients.length}</strong><p>záznamů v provozním přehledu</p></div>
        </section>

        <form className={styles.filterPanel} action="/admin/prehled">
          <div className={styles.filterGrid}>
            <label>Hledat
              <input name="q" type="search" defaultValue={q} placeholder="název, město, email, kontakt..." />
            </label>
            <label>Stav objednávky
              <select name="status" defaultValue={status}>
                <option value="all">Všechny stavy</option>
                {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>Profily
              <select name="profile" defaultValue={profile}>
                <option value="all">Klienti i taskeři</option>
                <option value="clients">Pouze klienti</option>
                <option value="taskers">Pouze taskeři</option>
              </select>
            </label>
            <label>Kontrola
              <select name="verification" defaultValue={verification}>
                <option value="all">Vše</option>
                <option value="verified">Ověření taskeři</option>
                <option value="unverified">Neověření taskeři</option>
                <option value="photo_pending">Fotka ke kontrole</option>
              </select>
            </label>
            <div className={styles.filterActions}>
              <button className="button primary" type="submit">Filtrovat</button>
              <a className="button secondary" href="/admin/prehled">Vyčistit</a>
            </div>
          </div>
          <div className={styles.resultTabs} aria-label="Sekce výsledků">
            <a href="#objednavky">Objednávky ({filteredTasks.length})</a>
            <a href="#taskeri">Taskeři ({filteredTaskers.length})</a>
            <a href="#klienti">Klienti ({filteredClients.length})</a>
            <a href="#nabidky">Nabídky ({filteredOffers.length})</a>
            <a href="/admin">Zpět do adminu</a>
          </div>
        </form>

        <section className={styles.summaryGrid} aria-label="Provozní souhrn">
          <article className={styles.summaryCard}><span>Otevřené</span><strong>{openTaskCount}</strong><p>Zakázky čekající na nabídky nebo výběr taskera.</p></article>
          <article className={styles.summaryCard}><span>Aktivní</span><strong>{activeTaskCount}</strong><p>Přiřazené, probíhající nebo čekající na potvrzení.</p></article>
          <article className={styles.summaryCard}><span>Ověření</span><strong>{unverifiedTaskerCount}</strong><p>Taskeři čekající na ruční kontrolu.</p></article>
          <article className={styles.summaryCard}><span>Fotky</span><strong>{pendingPhotoCount}</strong><p>Profilové fotky čekající na moderaci.</p></article>
        </section>

        <div className={styles.sectionStack}>
          <section id="objednavky" className={styles.resultSection}>
            <div className={styles.sectionHeader}><div><h2>Objednávky</h2><p>Rychlý provozní seznam s přechodem do detailu.</p></div><span className={styles.countPill}>{filteredTasks.length} výsledků</span></div>
            <div className={styles.resultList}>
              {filteredTasks.length ? filteredTasks.map((task) => (
                <article className={styles.resultRow} key={task.id}>
                  <div className={styles.resultMain}><strong>{task.title}</strong><p>{task.category} · {task.city}{task.district ? ` · ${task.district}` : ""}</p></div>
                  <div className={styles.resultMeta}><strong>{task.client_name}</strong><p>{task.client_contact || "kontakt neuveden"}</p></div>
                  <div className={styles.rowBadges}><span className={statusClass(task.status)}>{statusLabels[task.status]}</span><span className={styles.statusPill}>{money(task.budget_czk)}</span></div>
                  <a className="button secondary" href={`/admin/tasks/${task.id}`}>Detail</a>
                </article>
              )) : <EmptyState title="Žádné objednávky" body="Zkuste změnit hledaný text nebo vyčistit filtr stavu." />}
            </div>
          </section>

          <section id="taskeri" className={styles.resultSection}>
            <div className={styles.sectionHeader}><div><h2>Taskeři</h2><p>Profily, kontakty, kategorie a stav ověření.</p></div><span className={styles.countPill}>{filteredTaskers.length} výsledků</span></div>
            <div className={styles.resultList}>
              {filteredTaskers.length ? filteredTaskers.map((tasker) => (
                <article className={styles.resultRow} key={tasker.id}>
                  <div className={styles.resultMain}><strong>{tasker.name}</strong><p>{tasker.categories || "kategorie neuvedeny"}</p></div>
                  <div className={styles.resultMeta}><strong>{tasker.email || "email neuveden"}</strong><p>{tasker.city || "město neuvedeno"} · {tasker.contact || "kontakt neuveden"}</p></div>
                  <div className={styles.rowBadges}><span className={tasker.verified ? styles.successPill : styles.warningPill}>{tasker.verified ? "ověřen" : "čeká"}</span>{tasker.pending_avatar_url ? <span className={styles.warningPill}>fotka</span> : null}</div>
                  <a className="button secondary" href={`/admin/taskers/${tasker.id}`}>Detail</a>
                </article>
              )) : <EmptyState title="Žádní taskeři" body="Zkuste změnit filtr profilu nebo kontroly." />}
            </div>
          </section>

          <section id="klienti" className={styles.resultSection}>
            <div className={styles.sectionHeader}><div><h2>Klienti</h2><p>Kontakty klientů a jejich základní provozní údaje.</p></div><span className={styles.countPill}>{filteredClients.length} výsledků</span></div>
            <div className={styles.resultList}>
              {filteredClients.length ? filteredClients.map((client) => (
                <article className={styles.resultRow} key={client.id}>
                  <div className={styles.resultMain}><strong>{client.name}</strong><p>{client.city || "město neuvedeno"} · jazyk {client.preferred_language || "cs"}</p></div>
                  <div className={styles.resultMeta}><strong>{client.email}</strong><p>{client.phone || "telefon neuveden"}</p></div>
                  <div className={styles.rowBadges}>{client.pending_avatar_url ? <span className={styles.warningPill}>fotka ke kontrole</span> : <span className={styles.statusPill}>profil</span>}</div>
                  <a className="button secondary" href={`/admin/clients/${client.id}`}>Detail</a>
                </article>
              )) : <EmptyState title="Žádní klienti" body="Zkuste vyčistit profilový filtr nebo hledat podle emailu." />}
            </div>
          </section>

          <section id="nabidky" className={styles.resultSection}>
            <div className={styles.sectionHeader}><div><h2>Nabídky</h2><p>Rychlý přehled nabídek poslaných taskery.</p></div><span className={styles.countPill}>{filteredOffers.length} výsledků</span></div>
            <div className={styles.resultList}>
              {filteredOffers.length ? filteredOffers.map((offer) => (
                <article className={styles.resultRow} key={offer.id}>
                  <div className={styles.resultMain}><strong>{offer.tasker_name}</strong><p>{offer.message}</p></div>
                  <div className={styles.resultMeta}><strong>{money(offer.price_czk)}</strong><p>{offer.tasker_contact || "kontakt neuveden"} · {date(offer.created_at)}</p></div>
                  <div className={styles.rowBadges}><span className={statusClass(offer.status)}>{offer.status}</span></div>
                  <a className="button secondary" href={`/admin/tasks/${offer.task_id}`}>Objednávka</a>
                </article>
              )) : <EmptyState title="Žádné nabídky" body="Nabídky se zobrazí, jakmile tasker odpoví na úkol." />}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
