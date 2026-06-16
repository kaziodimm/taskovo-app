import { redirect } from "next/navigation";
import {
  acceptAdminOffer,
  approveProfilePhoto,
  cancelAdminTask,
  declineAdminOffer,
  rejectProfilePhoto,
  reopenAdminTask,
  toggleTaskerVerification,
  updateAdminTaskStatus,
} from "@/app/admin-actions";
import { logoutAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminTasks, getClients, getOffers, getTaskMessageCounts, getTaskers } from "@/lib/data";
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

const adminStatusOptions = [
  "pending_review",
  "open",
  "offers_received",
  "assigned",
  "in_progress",
  "awaiting_confirmation",
  "completed",
  "cancelled",
  "disputed",
];

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

type ReviewProfile = {
  id: string;
  name: string;
  email?: string | null;
  city?: string | null;
  categories?: string | null;
  avatar_url?: string | null;
  pending_avatar_url?: string | null;
  avatar_review_status?: string | null;
};

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "T";
}

function directoryAvatar(profile: ReviewProfile, label: string) {
  if (profile.avatar_url) {
    return <img className={styles.directoryAvatar} src={profile.avatar_url} alt={`${label}: ${profile.name}`} />;
  }

  return <span className={styles.directoryAvatarFallback}>{initials(profile.name)}</span>;
}

function avatarStatus(profile: ReviewProfile) {
  if (profile.pending_avatar_url) return <span className={styles.warningPill}>fotka čeká</span>;
  if (profile.avatar_url) return <span className={styles.okPill}>fotka schválena</span>;
  return <span className={styles.neutralPill}>bez fotky</span>;
}

function taskCancelForm(taskId: string) {
  return (
    <details className={styles.dangerBox}>
      <summary>Zrušit objednávku</summary>
      <form className="compact-form" action={cancelAdminTask}>
        <input type="hidden" name="task_id" value={taskId} />
        <label className="span-full">
          Důvod zrušení
          <textarea name="reason" rows={3} placeholder="Například: nevhodný obsah, duplicitní úkol, porušení pravidel..." required />
        </label>
        <button className="button secondary span-full" type="submit">Potvrdit zrušení</button>
      </form>
    </details>
  );
}

function photoReviewItem(profile: ReviewProfile, role: "client" | "tasker") {
  const detailPath = role === "tasker" ? `/admin/taskers/${profile.id}` : `/admin/clients/${profile.id}`;
  const roleLabel = role === "tasker" ? "Tasker" : "Klient";

  return (
    <article className={styles.reviewItem} key={`${role}-${profile.id}`}>
      <img className={styles.reviewImage} src={profile.pending_avatar_url || ""} alt={`Fotka ke kontrole: ${profile.name}`} />
      <div className={styles.reviewBody}>
        <span className="pill">{roleLabel}</span>
        <strong>{profile.name}</strong>
        <p>{profile.email || profile.categories || "Kontakt není uveden"} · {profile.city || "město neuvedeno"}</p>
        <p>Stav: {profile.avatar_review_status === "pending" ? "čeká na kontrolu" : profile.avatar_review_status || "nová fotka"}</p>
        <div className="hero-actions">
          <a className="button secondary" href={detailPath}>Otevřít profil</a>
          <form action={approveProfilePhoto}>
            <input type="hidden" name="profile_id" value={profile.id} />
            <input type="hidden" name="role" value={role} />
            <button className="button primary" type="submit">Schválit</button>
          </form>
        </div>
        <form className={`compact-form ${styles.reviewRejectForm}`} action={rejectProfilePhoto}>
          <input type="hidden" name="profile_id" value={profile.id} />
          <input type="hidden" name="role" value={role} />
          <label>Důvod odmítnutí<input name="reason" type="text" placeholder="Nevhodná fotka, špatná kvalita..." /></label>
          <button className="button secondary" type="submit">Odmítnout</button>
        </form>
      </div>
    </article>
  );
}

export default async function AdminPage({ searchParams }: { searchParams?: AdminSearchParams }) {
  if (!(await isAdminAuthenticated())) {
    redirect("/prihlaseni?mode=login&error=login_required");
  }

  const query = searchParams ? await searchParams : {};
  const updateMessage = query.updated ? updateMessages[query.updated] : null;
  const errorMessage = query.error ? errorMessages[query.error] : null;

  const [tasks, offers, taskers, clients] = await Promise.all([getAdminTasks(), getOffers(), getTaskers(), getClients()]);
  const messageCounts = await getTaskMessageCounts(tasks.map((task) => task.id));
  const offersByTask = new Map<string, typeof offers>();
  offers.forEach((offer) => offersByTask.set(offer.task_id, [...(offersByTask.get(offer.task_id) || []), offer]));

  const visibleTasks = tasks.filter((task) => task.status !== "cancelled");
  const cancelledTasks = tasks.filter((task) => task.status === "cancelled");
  const activeTasks = visibleTasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));
  const waitingClientTasks = visibleTasks.filter((task) => task.status === "awaiting_confirmation");
  const openTasks = visibleTasks.filter((task) => ["open", "offers_received"].includes(task.status));
  const disputedTasks = visibleTasks.filter((task) => task.status === "disputed");
  const pendingClientPhotos = clients.filter((client) => client.pending_avatar_url);
  const pendingTaskerPhotos = taskers.filter((tasker) => tasker.pending_avatar_url);
  const pendingPhotoCount = pendingClientPhotos.length + pendingTaskerPhotos.length;
  const verifiedTaskers = taskers.filter((tasker) => tasker.verified).length;
  const unverifiedTaskers = taskers.filter((tasker) => !tasker.verified);

  const renderTaskItem = (task: (typeof tasks)[number], options: { archived?: boolean; compact?: boolean } = {}) => {
    const taskOffers = offersByTask.get(task.id) || [];
    const acceptedOffer = taskOffers.find((offer) => offer.id === task.accepted_offer_id || offer.status === "accepted");

    return (
      <article className={`admin-item ${styles.adminItem}`} key={task.id}>
        <div className={styles.taskItemHeader}>
          <div>
            <strong>{task.title}</strong>
            <p>{task.city} · {task.desired_time} · {money(task.budget_czk)} Kč · {statusLabels[task.status] ?? task.status}</p>
          </div>
          {task.status === "disputed" ? <span className={styles.alertPill}>Spor</span> : null}
          {task.status === "awaiting_confirmation" ? <span className={styles.warningPill}>čeká na klienta</span> : null}
        </div>
        <p>Klient: {task.client_name} · {task.client_contact || "kontakt není uveden"}</p>
        <p>Tasker: {acceptedOffer?.tasker_name || "zatím nevybrán"} · {taskOffers.length} nabídek · {messageCounts[task.id] || 0} zpráv</p>
        <div className="hero-actions">
          <a className="button primary" href={`/admin/tasks/${task.id}`}>Řídit objednávku</a>
          <a className="button secondary" href={`/ukol/${task.id}`}>Veřejný detail</a>
          {!options.archived ? (
            <form className="compact-form" action={updateAdminTaskStatus}>
              <input type="hidden" name="task_id" value={task.id} />
              <label>Stav<select name="status" defaultValue={task.status}>{adminStatusOptions.map((status) => <option key={status} value={status}>{statusLabels[status] ?? status}</option>)}</select></label>
              <button className="button secondary" type="submit">Uložit stav</button>
            </form>
          ) : null}
          {!options.archived && acceptedOffer ? (
            <form action={reopenAdminTask}>
              <input type="hidden" name="task_id" value={task.id} />
              <button className="button secondary" type="submit">Vrátit do hledání</button>
            </form>
          ) : null}
        </div>
        {!options.archived && !options.compact ? taskCancelForm(task.id) : null}
      </article>
    );
  };

  const renderTaskerCard = (tasker: (typeof taskers)[number], compact = false) => (
    <article className={styles.directoryCard} key={tasker.id}>
      <div className={styles.directoryHeader}>
        {directoryAvatar(tasker, "Tasker")}
        <div className={styles.directoryIdentity}>
          <strong>{tasker.name}</strong>
          <span>{tasker.city || "město neuvedeno"}</span>
        </div>
      </div>
      <div className={styles.directoryMeta}>
        <p>{tasker.categories || "kategorie neuvedeny"}</p>
        <p>{tasker.email || "email neuveden"}</p>
        <p>{tasker.contact || "kontakt neuveden"}</p>
      </div>
      <div className={styles.directoryStatusRow}>
        <span className={tasker.verified ? styles.verifiedPill : styles.warningPill}>{tasker.verified ? "ověřený tasker" : "čeká na ověření"}</span>
        {avatarStatus(tasker)}
      </div>
      <div className={styles.directoryActions}>
        <a className="button secondary" href={`/admin/taskers/${tasker.id}`}>Detail taskera</a>
        <form action={toggleTaskerVerification} className="inline-action-form">
          <input type="hidden" name="tasker_id" value={tasker.id} />
          <input type="hidden" name="verified" value={tasker.verified ? "false" : "true"} />
          <button className={tasker.verified || compact ? "button secondary" : "button primary"} type="submit">{tasker.verified ? "Odebrat ověření" : "Ověřit"}</button>
        </form>
      </div>
    </article>
  );

  return (
    <>
      <Header />
      <main className={`page-shell ${styles.adminShell}`}>
        <section className="page-hero">
          <div>
            <p className="kicker">Admin</p>
            <h1 className="page-title">Operační centrum Taskovo</h1>
            <p className="hero-lead">Kontrola objednávek, klientů, taskerů, nabídek a provozních rozhodnutí marketplace.</p>
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

        <nav className={styles.adminJumpNav} aria-label="Rychlá navigace administrace">
          <a href="#fronty">Fronty</a>
          <a href="#overeni">Ověření</a>
          <a href="#spory">Spory</a>
          <a href="#aktivni">Aktivní</a>
          <a href="#otevrene">Otevřené</a>
          <a href="#review">Fotky</a>
          <a href="#orders">Všechny</a>
          <a href="#zrusene">Archiv</a>
          <a href="#clients">Klienti</a>
          <a href="#taskers">Taskeři</a>
          <a href="#offers">Nabídky</a>
          <a href="/tasks">Marketplace</a>
        </nav>

        <div className="dashboard-grid">
          <article className="dashboard-panel"><h3>Fotky ke kontrole</h3><p>{pendingPhotoCount} profilových fotek čeká na rozhodnutí.</p></article>
          <article className="dashboard-panel"><h3>Taskeři k ověření</h3><p>{unverifiedTaskers.length} profilů čeká na ruční kontrolu.</p></article>
          <article className="dashboard-panel"><h3>Otevřené</h3><p>{openTasks.length} objednávek čeká na nabídky nebo výběr taskera.</p></article>
          <article className="dashboard-panel"><h3>Aktivní</h3><p>{activeTasks.length} objednávek je přiřazených, probíhá nebo čeká na potvrzení.</p></article>
          <article className="dashboard-panel"><h3>Spory</h3><p>{disputedTasks.length} objednávek čeká na zásah administrátora.</p></article>
          <article className="dashboard-panel"><h3>Účty</h3><p>{verifiedTaskers}/{taskers.length} ověřených taskerů · {clients.length} klientů.</p></article>
        </div>

        <section id="fronty" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Fronty</p><h2>Rychlé řízení marketplace</h2><p>Nejdůležitější provozní pohledy jsou oddělené, aby se u většího počtu objednávek a profilů dalo rychle najít, co vyžaduje zásah.</p></div>
          </div>
          <div className={styles.queueGrid}>
            <a className={`${styles.queueCard} ${disputedTasks.length ? styles.queueCardDanger : ""}`} href="#spory"><strong>{disputedTasks.length}</strong><span>Spory</span><p>Objednávky, kde je potřeba ruční zásah.</p></a>
            <a className={`${styles.queueCard} ${unverifiedTaskers.length ? styles.queueCardWarning : ""}`} href="#overeni"><strong>{unverifiedTaskers.length}</strong><span>Taskeři k ověření</span><p>Nové profily před viditelným označením důvěry.</p></a>
            <a className={`${styles.queueCard} ${pendingPhotoCount ? styles.queueCardWarning : ""}`} href="#review"><strong>{pendingPhotoCount}</strong><span>Fotky ke kontrole</span><p>Profilové fotky čekající na schválení.</p></a>
            <a className={styles.queueCard} href="#aktivni"><strong>{activeTasks.length}</strong><span>Aktivní práce</span><p>Přiřazeno, probíhá nebo čeká na potvrzení.</p></a>
            <a className={`${styles.queueCard} ${openTasks.length ? styles.queueCardWarning : ""}`} href="#otevrene"><strong>{openTasks.length}</strong><span>Otevřené</span><p>Úkoly, které ještě hledají taskera.</p></a>
            <a className={styles.queueCard} href="#zrusene"><strong>{cancelledTasks.length}</strong><span>Archiv</span><p>Zrušené objednávky jen pro historii.</p></a>
          </div>
        </section>

        <section id="overeni" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-title"><p className="kicker">Důvěra</p><h2>Taskeři čekající na ověření</h2><p>Ověření je ruční administrátorský krok. Taskovo tím jasně odlišuje profily, které prošly základní kontrolou identity, kontaktu a popisu služeb.</p></div>
          <div className={`${styles.adminList} ${styles.directoryList}`}>
            {unverifiedTaskers.length ? unverifiedTaskers.map((tasker) => renderTaskerCard(tasker)) : <div className={styles.emptyState}><strong>Žádný tasker nečeká na ověření.</strong><p>Nové registrace taskerů se po vytvoření profilu objeví v této frontě.</p></div>}
          </div>
        </section>

        <section id="spory" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-title"><p className="kicker">Priorita</p><h2>Spory a ruční zásahy</h2><p>Sem patří objednávky, které by admin měl řešit jako první.</p></div>
          <div className={styles.adminList}>
            {disputedTasks.length ? disputedTasks.map((task) => renderTaskItem(task)) : <div className={styles.emptyState}><strong>Žádné aktivní spory.</strong><p>Když objednávka přejde do stavu spor, objeví se tady.</p></div>}
          </div>
        </section>

        <section id="aktivni" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-title"><p className="kicker">Práce</p><h2>Aktivní objednávky</h2><p>Přiřazené zakázky, probíhající práce a dokončení čekající na klienta.</p></div>
          <div className={styles.adminList}>
            {activeTasks.length ? activeTasks.map((task) => renderTaskItem(task, { compact: true })) : <div className={styles.emptyState}><strong>Žádné aktivní objednávky.</strong><p>Jakmile klient vybere taskera, objednávka se přesune sem.</p></div>}
          </div>
        </section>

        <section id="otevrene" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-title"><p className="kicker">Marketplace</p><h2>Otevřené objednávky</h2><p>Úkoly, které čekají na nabídky nebo na výběr taskera.</p></div>
          <div className={styles.adminList}>
            {openTasks.length ? openTasks.map((task) => renderTaskItem(task, { compact: true })) : <div className={styles.emptyState}><strong>Žádné otevřené objednávky.</strong><p>Nové schválené úkoly se objeví v této frontě.</p></div>}
          </div>
        </section>

        <section id="review" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Ke kontrole</p><h2>Moderace profilových fotek</h2><p>Nové fotky se nezobrazují veřejně, dokud je administrátor neschválí. Tady jsou všechny čekající žádosti na jednom místě.</p></div>
          </div>
          {pendingPhotoCount > 0 ? (
            <div className={styles.reviewGrid}>
              {pendingClientPhotos.map((client) => photoReviewItem(client, "client"))}
              {pendingTaskerPhotos.map((tasker) => photoReviewItem(tasker, "tasker"))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <strong>Momentálně nic nečeká na kontrolu.</strong>
              <p>Až klient nebo tasker nahraje novou fotku, objeví se tady.</p>
            </div>
          )}
        </section>

        <section id="orders" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Objednávky</p><h2>Všechny aktivní zakázky</h2><p>Hlavní operativní seznam bez zrušených objednávek. Zrušené objednávky zůstávají jen v archivu kvůli historii.</p></div>
            <a className="button secondary" href="/tasks">Veřejný marketplace</a>
          </div>
          <div className={styles.adminList}>
            {visibleTasks.length ? visibleTasks.map((task) => renderTaskItem(task)) : <div className={styles.emptyState}><strong>Zatím nejsou žádné aktivní objednávky.</strong><p>Jakmile klient zadá úkol, uvidíš ho v této administraci.</p></div>}
          </div>
        </section>

        <section id="zrusene" className={`section ${styles.sectionCard} ${styles.queueSection}`}>
          <div className="section-title"><p className="kicker">Archiv</p><h2>Zrušené objednávky</h2><p>Archiv zůstává oddělený, aby nerušil každodenní provoz marketplace.</p></div>
          <div className={styles.adminList}>
            {cancelledTasks.length ? cancelledTasks.map((task) => renderTaskItem(task, { archived: true })) : <div className={styles.emptyState}><strong>Archiv je prázdný.</strong><p>Zrušené objednávky se budou ukládat sem.</p></div>}
          </div>
        </section>

        <div className="admin-grid section">
          <section id="clients" className={styles.sectionCard}>
            <div className="section-title"><p className="kicker">Klienti</p><h2>Klientské účty</h2></div>
            <div className={`${styles.adminList} ${styles.directoryList}`}>
              {clients.map((client) => (
                <article className={styles.directoryCard} key={client.id}>
                  <div className={styles.directoryHeader}>
                    {directoryAvatar(client, "Klient")}
                    <div className={styles.directoryIdentity}>
                      <strong>{client.name}</strong>
                      <span>{client.city || "město neuvedeno"}</span>
                    </div>
                  </div>
                  <div className={styles.directoryMeta}>
                    <p>{client.email}</p>
                    <p>{client.phone || "telefon neuveden"}</p>
                    <p>Jazyk: {client.preferred_language || "cs"}</p>
                  </div>
                  <div className={styles.directoryStatusRow}>{avatarStatus(client)}</div>
                  <a className={`button secondary ${styles.directoryButton}`} href={`/admin/clients/${client.id}`}>Detail klienta</a>
                </article>
              ))}
            </div>
          </section>
          <section id="taskers" className={styles.sectionCard}>
            <div className="section-title"><p className="kicker">Taskeři</p><h2>Profily taskerů</h2></div>
            <div className={`${styles.adminList} ${styles.directoryList}`}>
              {taskers.map((tasker) => renderTaskerCard(tasker, true))}
            </div>
          </section>
          <section id="offers" className={styles.sectionCard}>
            <div className="section-title"><p className="kicker">Nabídky</p><h2>Nabídky taskerů</h2></div>
            <div className={styles.adminList}>
              {offers.map((offer) => (
                <article className={`admin-item ${styles.adminItem}`} key={offer.id}>
                  <strong>{offer.tasker_name}</strong>
                  <p>{money(offer.price_czk)} Kč · {offer.status} · {offer.message}</p>
                  <div className="hero-actions">
                    <a className="button secondary" href={`/admin/tasks/${offer.task_id}`}>Objednávka</a>
                    {offer.status !== "accepted" ? (
                      <form action={acceptAdminOffer}>
                        <input type="hidden" name="task_id" value={offer.task_id} />
                        <input type="hidden" name="offer_id" value={offer.id} />
                        <button className="button secondary" type="submit">Vybrat taskera</button>
                      </form>
                    ) : null}
                    {offer.status !== "declined" ? (
                      <form action={declineAdminOffer}>
                        <input type="hidden" name="task_id" value={offer.task_id} />
                        <input type="hidden" name="offer_id" value={offer.id} />
                        <button className="button secondary" type="submit">Odmítnout nabídku</button>
                      </form>
                    ) : null}
                  </div>
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
