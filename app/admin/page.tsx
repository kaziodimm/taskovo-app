import { redirect } from "next/navigation";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminTasks, getClients, getOffers, getTaskers } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import styles from "./page.module.css";

const statusLabels: Record<string, string> = {
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

const updateMessages: Record<string, string> = {
  tasker_verification: "Ověření taskera bylo uloženo.",
  profile_photo_approved: "Profilová fotka byla schválena.",
  profile_photo_rejected: "Profilová fotka byla odmítnuta.",
};

const errorMessages: Record<string, string> = {
  config: "Chybí konfigurace pro administraci.",
  bad_status: "Vybraný stav objednávky není platný.",
};

type AdminSearchParams = Promise<{ updated?: string; error?: string }>;

function money(value: number) {
  return `${value.toLocaleString("cs-CZ")} Kč`;
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" });
}

function newestFirst<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export default async function AdminPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const query = searchParams ? await searchParams : {};
  const updateMessage = query.updated ? updateMessages[query.updated] : null;
  const errorMessage = query.error ? errorMessages[query.error] : null;

  const [tasks, offers, taskers, clients] = await Promise.all([getAdminTasks(), getOffers(), getTaskers(), getClients()]);

  const visibleTasks = tasks.filter((task) => task.status !== "cancelled");
  const cancelledTasks = tasks.filter((task) => task.status === "cancelled");
  const activeTasks = visibleTasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));
  const openTasks = visibleTasks.filter((task) => ["open", "offers_received"].includes(task.status));
  const disputedTasks = visibleTasks.filter((task) => task.status === "disputed");
  const waitingClientTasks = visibleTasks.filter((task) => task.status === "awaiting_confirmation");
  const pendingClientPhotos = clients.filter((client) => client.pending_avatar_url);
  const pendingTaskerPhotos = taskers.filter((tasker) => tasker.pending_avatar_url);
  const pendingPhotoCount = pendingClientPhotos.length + pendingTaskerPhotos.length;
  const verifiedTaskers = taskers.filter((tasker) => tasker.verified).length;
  const unverifiedTaskers = taskers.filter((tasker) => !tasker.verified);
  const pendingOffers = offers.filter((offer) => offer.status === "pending");
  const recentTasks = newestFirst(visibleTasks).slice(0, 6);
  const recentTaskers = newestFirst(taskers).slice(0, 4);
  const recentClients = newestFirst(clients).slice(0, 4);

  return (
    <>
      <Header />
      <main className={`page-shell ${styles.adminShell}`}>
        <section className="page-hero">
          <div>
            <p className="kicker">Admin</p>
            <h1 className="page-title">Operační centrum Taskovo</h1>
            <p className="hero-lead">Krátký provozní přehled pro rozhodnutí, kontrolu front a rychlý přechod do specializovaných seznamů.</p>
          </div>
          <div className="page-hero-card"><strong>{visibleTasks.length}</strong><p>aktivních objednávek · {cancelledTasks.length} zrušených v archivu</p></div>
        </section>

        <form action={logoutAccount} className="admin-toolbar">
          <span>Přihlášený účet správce</span>
          <button className="button secondary" type="submit">Odhlásit se</button>
        </form>

        {(updateMessage || errorMessage) ? (
          <div className={styles.adminNoticeStack}>
            {updateMessage ? <div className={`${styles.adminNotice} ${styles.adminNoticeSuccess}`}>{updateMessage}</div> : null}
            {errorMessage ? <div className={`${styles.adminNotice} ${styles.adminNoticeError}`}>{errorMessage}</div> : null}
          </div>
        ) : null}

        <section className={styles.commandCenter} aria-label="Hlavní admin sekce">
          <a className={styles.commandCard} href="/admin/prehled"><strong>Přehled</strong><span>Hledat napříč marketplace</span><p>Objednávky, klienti, taskeři a nabídky v jednom filtru.</p></a>
          <a className={styles.commandCard} href="/admin/objednavky"><strong>Objednávky</strong><span>{tasks.length} celkem</span><p>Filtrovaný pracovní seznam, stavy, rozpočty a zprávy.</p></a>
          <a className={styles.commandCard} href="/admin/taskeri"><strong>Taskeři</strong><span>{unverifiedTaskers.length} čeká na kontrolu</span><p>Ověření, profily, kategorie a fotky taskerů.</p></a>
          <a className={styles.commandCard} href="/admin/klienti"><strong>Klienti</strong><span>{clients.length} účtů</span><p>Kontakty, fotky, souhlasy a zákaznická podpora.</p></a>
        </section>

        <section className="dashboard-grid" aria-label="Provozní metriky">
          <article className="dashboard-panel"><h3>Spory</h3><p>{disputedTasks.length} objednávek vyžaduje ruční zásah.</p></article>
          <article className="dashboard-panel"><h3>Čeká na klienta</h3><p>{waitingClientTasks.length} dokončení čeká na potvrzení klientem.</p></article>
          <article className="dashboard-panel"><h3>Otevřené</h3><p>{openTasks.length} objednávek hledá nabídky nebo výběr taskera.</p></article>
          <article className="dashboard-panel"><h3>Aktivní práce</h3><p>{activeTasks.length} objednávek je přiřazeno nebo probíhá.</p></article>
          <article className="dashboard-panel"><h3>Fotky ke kontrole</h3><p>{pendingPhotoCount} profilových fotek čeká na rozhodnutí.</p></article>
          <article className="dashboard-panel"><h3>Ověření taskeři</h3><p>{verifiedTaskers}/{taskers.length} profilů má ověřený status.</p></article>
        </section>

        <section id="fronty" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Priorita</p><h2>Fronty k ruční kontrole</h2><p>Sem patří věci, které mají největší dopad na důvěru a provoz marketplace.</p></div>
            <a className="button secondary" href="/admin/prehled">Otevřít celý přehled</a>
          </div>
          <div className={styles.queueGrid}>
            <a className={`${styles.queueCard} ${disputedTasks.length ? styles.queueCardDanger : ""}`} href="/admin/objednavky?status=disputed"><strong>{disputedTasks.length}</strong><span>Spory</span><p>Objednávky, kde je potřeba ruční zásah.</p></a>
            <a className={`${styles.queueCard} ${unverifiedTaskers.length ? styles.queueCardWarning : ""}`} href="/admin/taskeri?verification=unverified"><strong>{unverifiedTaskers.length}</strong><span>Taskeři k ověření</span><p>Nové profily před viditelným označením důvěry.</p></a>
            <a className={`${styles.queueCard} ${pendingPhotoCount ? styles.queueCardWarning : ""}`} href="/admin/prehled?verification=photo_pending"><strong>{pendingPhotoCount}</strong><span>Fotky ke kontrole</span><p>Profilové fotky čekající na schválení.</p></a>
            <a className={styles.queueCard} href="/admin/objednavky?status=awaiting_confirmation"><strong>{waitingClientTasks.length}</strong><span>Čeká na klienta</span><p>Dokončení, kde se čeká na potvrzení.</p></a>
            <a className={`${styles.queueCard} ${openTasks.length ? styles.queueCardWarning : ""}`} href="/admin/objednavky?status=open"><strong>{openTasks.length}</strong><span>Otevřené</span><p>Úkoly, které ještě hledají taskera.</p></a>
            <a className={styles.queueCard} href="/admin/objednavky?status=cancelled"><strong>{cancelledTasks.length}</strong><span>Archiv</span><p>Zrušené objednávky pro historii.</p></a>
          </div>
        </section>

        <div className="admin-grid section">
          <section className={styles.sectionCard}>
            <div className="section-heading-row"><div className="section-title"><p className="kicker">Objednávky</p><h2>Poslední pohyb</h2></div><a className="button secondary" href="/admin/objednavky">Všechny objednávky</a></div>
            <div className={styles.adminList}>
              {recentTasks.length ? recentTasks.map((task) => (
                <article className={`admin-item ${styles.adminItem}`} key={task.id}>
                  <div className={styles.taskItemHeader}><div><strong>{task.title}</strong><p>{task.city} · {money(task.budget_czk)} · {statusLabels[task.status] ?? task.status}</p></div>{task.status === "disputed" ? <span className={styles.alertPill}>Spor</span> : null}</div>
                  <p>{task.client_name} · vytvořeno {dateTime(task.created_at)}</p>
                  <div className="hero-actions"><a className="button primary" href={`/admin/tasks/${task.id}`}>Řídit objednávku</a><a className="button secondary" href={`/ukol/${task.id}`}>Veřejný detail</a></div>
                </article>
              )) : <div className={styles.emptyState}><strong>Zatím žádné objednávky.</strong><p>Nové úkoly se objeví v objednávkovém seznamu.</p></div>}
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className="section-heading-row"><div className="section-title"><p className="kicker">Nabídky</p><h2>Aktivní nabídky</h2></div><a className="button secondary" href="/admin/prehled#nabidky">Přehled nabídek</a></div>
            <div className={styles.adminList}>
              {pendingOffers.slice(0, 6).map((offer) => (
                <article className={`admin-item ${styles.adminItem}`} key={offer.id}>
                  <strong>{offer.tasker_name}</strong>
                  <p>{money(offer.price_czk)} · {offer.message}</p>
                  <div className="hero-actions"><a className="button secondary" href={`/admin/tasks/${offer.task_id}`}>Objednávka</a></div>
                </article>
              ))}
              {!pendingOffers.length ? <div className={styles.emptyState}><strong>Žádné čekající nabídky.</strong><p>Jakmile tasker odpoví na úkol, nabídka se objeví u objednávky.</p></div> : null}
            </div>
          </section>
        </div>

        <div className="admin-grid section">
          <section className={styles.sectionCard}>
            <div className="section-heading-row"><div className="section-title"><p className="kicker">Taskeři</p><h2>Nové profily</h2></div><a className="button secondary" href="/admin/taskeri">Správa taskerů</a></div>
            <div className={`${styles.adminList} ${styles.compactDirectoryList}`}>
              {recentTaskers.map((tasker) => (
                <article className={styles.miniProfile} key={tasker.id}>
                  <strong>{tasker.name}</strong>
                  <p>{tasker.city || "město neuvedeno"} · {tasker.categories || "kategorie neuvedeny"}</p>
                  <span className={tasker.verified ? styles.verifiedPill : styles.warningPill}>{tasker.verified ? "ověřen" : "čeká"}</span>
                  <a className="button secondary" href={`/admin/taskers/${tasker.id}`}>Detail</a>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.sectionCard}>
            <div className="section-heading-row"><div className="section-title"><p className="kicker">Klienti</p><h2>Nové účty</h2></div><a className="button secondary" href="/admin/klienti">Správa klientů</a></div>
            <div className={`${styles.adminList} ${styles.compactDirectoryList}`}>
              {recentClients.map((client) => (
                <article className={styles.miniProfile} key={client.id}>
                  <strong>{client.name}</strong>
                  <p>{client.email} · {client.city || "město neuvedeno"}</p>
                  {client.pending_avatar_url ? <span className={styles.warningPill}>fotka čeká</span> : <span className={styles.neutralPill}>profil</span>}
                  <a className="button secondary" href={`/admin/clients/${client.id}`}>Detail</a>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
