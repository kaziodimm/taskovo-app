import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminTasks, getClients } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { ClientProfile } from "@/lib/types";
import styles from "../prehled/page.module.css";

type AdminClientsSearchParams = Promise<{
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

function includesTerm(client: ClientProfile, term: string) {
  if (!term) return true;
  const haystack = [
    client.name,
    client.email,
    client.phone,
    client.city,
    client.preferred_language,
  ].map((value) => normalize(String(value ?? ""))).join(" ");

  return haystack.includes(term);
}

function matchStatus(client: ClientProfile, status: string) {
  if (status === "photo_pending") return Boolean(client.pending_avatar_url);
  if (status === "photo_approved") return Boolean(client.avatar_url);
  if (status === "marketing") return client.marketing_consent;
  if (status === "no_phone") return !client.phone;
  return true;
}

function sortClients(clients: ClientProfile[], sort: string) {
  const sorted = [...clients];
  if (sort === "name") return sorted.sort((a, b) => a.name.localeCompare(b.name, "cs"));
  if (sort === "city") return sorted.sort((a, b) => (a.city || "").localeCompare(b.city || "", "cs"));
  if (sort === "oldest") return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function date(value: string) {
  return new Date(value).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminClientsPage({ searchParams }: { searchParams?: AdminClientsSearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const params = searchParams ? await searchParams : {};
  const q = params.q || "";
  const term = normalize(q);
  const status = ["photo_pending", "photo_approved", "marketing", "no_phone"].includes(params.status || "") ? params.status || "all" : "all";
  const sort = ["newest", "oldest", "name", "city"].includes(params.sort || "") ? params.sort || "newest" : "newest";

  const [clients, tasks] = await Promise.all([getClients(), getAdminTasks()]);
  const tasksByClient = new Map<string, number>();
  tasks.forEach((task) => {
    const keys = [task.client_auth_user_id, task.client_contact, task.client_name].filter(Boolean) as string[];
    keys.forEach((key) => tasksByClient.set(key, (tasksByClient.get(key) || 0) + 1));
  });

  const filteredClients = sortClients(
    clients.filter((client) => includesTerm(client, term) && matchStatus(client, status)),
    sort,
  );
  const visibleClients = filteredClients.slice(0, 100);
  const hiddenCount = Math.max(filteredClients.length - visibleClients.length, 0);

  const pendingPhotoCount = clients.filter((client) => client.pending_avatar_url).length;
  const withPhotoCount = clients.filter((client) => client.avatar_url).length;
  const marketingCount = clients.filter((client) => client.marketing_consent).length;
  const missingPhoneCount = clients.filter((client) => !client.phone).length;

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin · klienti</p>
            <h1 className="page-title">Správa klientů</h1>
            <p className="hero-lead">Samostatný seznam pro podporu klientů, kontrolu kontaktů, fotek a základní provozní orientaci.</p>
          </div>
          <div className="page-hero-card"><strong>{clients.length}</strong><p>klientů celkem</p></div>
        </section>

        <form className={styles.filterPanel} action="/admin/klienti">
          <div className={styles.filterGrid}>
            <label>Hledat
              <input name="q" type="search" defaultValue={q} placeholder="jméno, email, telefon, město..." />
            </label>
            <label>Stav
              <select name="status" defaultValue={status}>
                <option value="all">Všichni klienti</option>
                <option value="photo_pending">Fotka ke kontrole</option>
                <option value="photo_approved">Schválená fotka</option>
                <option value="marketing">Marketing souhlas</option>
                <option value="no_phone">Bez telefonu</option>
              </select>
            </label>
            <label>Řazení
              <select name="sort" defaultValue={sort}>
                <option value="newest">Nejnovější</option>
                <option value="oldest">Nejstarší</option>
                <option value="name">Jméno A-Z</option>
                <option value="city">Město A-Z</option>
              </select>
            </label>
            <div className={styles.filterActions}>
              <button className="button primary" type="submit">Filtrovat</button>
              <a className="button secondary" href="/admin/klienti">Vyčistit</a>
            </div>
          </div>
          <div className={styles.resultTabs} aria-label="Rychlé odkazy klientů">
            <a href="/admin/prehled">Přehled</a>
            <a href="/admin/objednavky">Objednávky</a>
            <a href="/admin/taskeri">Taskeři</a>
            <a href="/admin">Operační centrum</a>
          </div>
        </form>

        <section className={styles.summaryGrid} aria-label="Souhrn klientů">
          <article className={styles.summaryCard}><span>Fotky</span><strong>{pendingPhotoCount}</strong><p>Profilové fotky klientů čekající na moderaci.</p></article>
          <article className={styles.summaryCard}><span>S fotkou</span><strong>{withPhotoCount}</strong><p>Klientské profily se schválenou fotkou.</p></article>
          <article className={styles.summaryCard}><span>Souhlas</span><strong>{marketingCount}</strong><p>Klienti se souhlasem k novinkám a tipům.</p></article>
          <article className={styles.summaryCard}><span>Bez telefonu</span><strong>{missingPhoneCount}</strong><p>Profily, kde může chybět důležitý kontakt.</p></article>
        </section>

        <section className={styles.resultSection}>
          <div className={styles.sectionHeader}>
            <div><h2>Výsledky</h2><p>Zobrazuje se maximálně 100 klientů, aby stránka zůstala rychlá.</p></div>
            <span className={styles.countPill}>{filteredClients.length} výsledků</span>
          </div>
          <div className={styles.resultList}>
            {visibleClients.length ? visibleClients.map((client) => {
              const taskCount = tasksByClient.get(client.auth_user_id || "") || tasksByClient.get(client.email) || tasksByClient.get(client.name) || 0;
              return (
                <article className={styles.resultRow} key={client.id}>
                  <div className={styles.resultMain}>
                    <strong>{client.name}</strong>
                    <p>{client.city || "město neuvedeno"} · jazyk {client.preferred_language || "cs"} · registrace {date(client.created_at)}</p>
                  </div>
                  <div className={styles.resultMeta}>
                    <strong>{client.email}</strong>
                    <p>{client.phone || "telefon neuveden"}</p>
                  </div>
                  <div className={styles.rowBadges}>
                    {client.pending_avatar_url ? <span className={styles.warningPill}>fotka ke kontrole</span> : null}
                    {client.avatar_url ? <span className={styles.statusPill}>fotka</span> : null}
                    {client.marketing_consent ? <span className={styles.successPill}>marketing</span> : null}
                    <span className={styles.statusPill}>{taskCount} objednávek</span>
                  </div>
                  <a className="button secondary" href={`/admin/clients/${client.id}`}>Detail</a>
                </article>
              );
            }) : (
              <div className={styles.emptyState}><strong>Žádní klienti</strong><p>Zkuste změnit hledání, stav nebo řazení.</p></div>
            )}
          </div>
          {hiddenCount ? <p className={styles.emptyState}><strong>Další výsledky jsou skryté</strong><span>Zúžte hledání nebo filtr. Skryto: {hiddenCount} klientů.</span></p> : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
