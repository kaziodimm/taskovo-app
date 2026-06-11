import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { addTaskAttachment, confirmTaskCompletion, requestTaskCompletion, sendTaskMessage, startTaskWork } from "@/app/actions";
import { requestTaskDispute } from "@/app/dispute-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MarkMessagesRead } from "@/components/MarkMessagesRead";
import { TaskCard } from "@/components/TaskCard";
import { getOffersForTask, getTaskAttachments, getTaskById, getTaskMessages } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Task } from "@/lib/types";
import styles from "./page.module.css";

const statusLabels: Record<string, string> = {
  open: "Otevřeno",
  offers_received: "Nabídky dorazily",
  assigned: "Tasker vybrán",
  in_progress: "Probíhá",
  awaiting_confirmation: "Čeká na potvrzení",
  completed: "Hotovo",
  cancelled: "Zrušeno",
  disputed: "Spor",
};

const roleLabels: Record<string, string> = {
  client: "Klient",
  tasker: "Tasker",
  admin: "Taskovo",
};

const workflowCopy: Record<string, string> = {
  open: "Čekáme na první nabídky od taskerů.",
  offers_received: "Klient si může vybrat nejlepší nabídku.",
  assigned: "Vybraný tasker může začít práci.",
  in_progress: "Tasker pracuje na objednávce.",
  awaiting_confirmation: "Tasker označil práci jako hotovou. Klient ji může potvrdit.",
  completed: "Objednávka je dokončená.",
  disputed: "Objednávka je pozastavená kvůli problému. Administrátor Taskovo může zkontrolovat zprávy a rozhodnout další krok.",
};

const timelineSteps = [
  { key: "open", label: "Zadání", statuses: ["open", "offers_received", "assigned", "in_progress", "awaiting_confirmation", "completed", "disputed"] },
  { key: "offers_received", label: "Nabídky", statuses: ["offers_received", "assigned", "in_progress", "awaiting_confirmation", "completed", "disputed"] },
  { key: "assigned", label: "Výběr taskera", statuses: ["assigned", "in_progress", "awaiting_confirmation", "completed", "disputed"] },
  { key: "in_progress", label: "Práce", statuses: ["in_progress", "awaiting_confirmation", "completed", "disputed"] },
  { key: "completed", label: "Dokončení", statuses: ["completed"] },
];

const updateMessages: Record<string, { title: string; body: string }> = {
  task_started: {
    title: "Práce byla zahájena",
    body: "Klient uvidí, že objednávka je ve stavu Probíhá. Další krok je dokončit práci a označit ji jako hotovou.",
  },
  completion_requested: {
    title: "Dokončení čeká na potvrzení",
    body: "Klient teď může zkontrolovat výsledek a potvrdit dokončení objednávky.",
  },
  task_completed: {
    title: "Objednávka je dokončená",
    body: "Stav zakázky byl změněn na Hotovo. Později sem napojíme recenze, platby a e-mailové upozornění.",
  },
  attachment_added: {
    title: "Fotka byla nahrána",
    body: "Nový podklad je viditelný jen na detailu této objednávky, aby seznam úkolů zůstal přehledný.",
  },
  message_sent: {
    title: "Zpráva byla odeslána",
    body: "Zpráva zůstává uložená u objednávky a vidí ji jen klient a vybraný tasker.",
  },
  dispute_reported: {
    title: "Problém byl nahlášen",
    body: "Objednávka je pozastavená a administrátor Taskovo uvidí důvod ve zprávách.",
  },
  offer_accepted: {
    title: "Tasker byl vybrán",
    body: "Zakázka je přiřazená vybranému taskerovi. Odteď se otevře soukromá domluva k objednávce.",
  },
};

const errorMessages: Record<string, { title: string; body: string }> = {
  config: {
    title: "Chybí konfigurace služby",
    body: "Akci teď nejde dokončit. Je potřeba zkontrolovat nastavení Supabase na serveru.",
  },
  forbidden: {
    title: "K této akci nemáte oprávnění",
    body: "Tuto objednávku může upravit jen klient, vybraný tasker nebo administrátor podle konkrétního kroku.",
  },
  status: {
    title: "Akci nejde provést v aktuálním stavu",
    body: "Objednávka se mezitím posunula do jiného stavu. Zkontrolujte další krok v pravém panelu.",
  },
  image_file: {
    title: "Fotku se nepodařilo nahrát",
    body: "Použijte JPG, PNG, WebP nebo GIF do velikosti 8 MB.",
  },
  message_too_long: {
    title: "Zpráva je příliš dlouhá",
    body: "Zkraťte zprávu na maximálně 1200 znaků a zkuste ji poslat znovu.",
  },
  messages_closed: {
    title: "Zprávy ještě nejsou otevřené",
    body: "Soukromá domluva se aktivuje až po výběru taskera klientem.",
  },
  own_task: {
    title: "Na vlastní úkol nelze poslat nabídku",
    body: "Tasker nemůže poslat nabídku na objednávku, kterou sám vytvořil jako klient.",
  },
  task_missing: {
    title: "Objednávka nebyla nalezena",
    body: "Úkol mohl být smazán, zrušen nebo není dostupný.",
  },
  dispute_too_long: {
    title: "Popis problému je příliš dlouhý",
    body: "Zkraťte důvod na maximálně 1200 znaků a odešlete ho znovu.",
  },
};

const disputableStatuses = new Set(["assigned", "in_progress", "awaiting_confirmation"]);

type TaskDetailSearchParams = Promise<{ updated?: string; error?: string }>;

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" });
}

function taskDescription(task: Task) {
  return `${task.title} v lokalitě ${task.city}. Kategorie ${task.category}, rozpočet ${money(task.budget_czk)} Kč. Taskovo je zprostředkovatelská platforma.`;
}

function taskSchema(task: Task, offerCount: number, attachmentCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: task.title,
    description: task.description,
    serviceType: task.category,
    areaServed: task.city,
    url: `https://taskovo.cz/ukol/${task.id}`,
    offers: {
      "@type": "Offer",
      price: task.budget_czk,
      priceCurrency: "CZK",
      availability: ["open", "offers_received"].includes(task.status) ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Stav", value: statusLabels[task.status] ?? task.status },
      { "@type": "PropertyValue", name: "Počet nabídek", value: offerCount },
      { "@type": "PropertyValue", name: "Počet fotek", value: attachmentCount },
    ],
    provider: {
      "@type": "Organization",
      name: "Taskovo",
      url: "https://taskovo.cz",
    },
  };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    return {
      title: "Úkol nenalezen | Taskovo",
      description: "Objednávka na Taskovo nebyla nalezena.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${task.title} | ${task.city} | Taskovo`;
  const description = taskDescription(task);

  return {
    title,
    description,
    alternates: { canonical: `/ukol/${task.id}` },
    openGraph: {
      title,
      description,
      url: `/ukol/${task.id}`,
      siteName: "Taskovo",
      type: "article",
      images: [{ url: "/taskovo-logo.svg", width: 512, height: 512, alt: "Taskovo logo" }],
    },
    robots: { index: true, follow: true },
  };
}

export default async function TaskDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: TaskDetailSearchParams }) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const updateMessage = query.updated ? updateMessages[query.updated] : null;
  const errorMessage = query.error ? errorMessages[query.error] : null;
  const [task, offers, attachments, messages] = await Promise.all([getTaskById(id), getOffersForTask(id), getTaskAttachments(id), getTaskMessages(id)]);
  if (!task) notFound();

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role;
  const isTasker = role === "tasker";
  const isClientOwner = Boolean(user?.id && task.client_auth_user_id === user.id);
  const isAssignedTasker = Boolean(user?.id && task.assigned_tasker_auth_user_id === user.id);
  const canMessage = Boolean(task.assigned_tasker_auth_user_id && (isClientOwner || isAssignedTasker));
  const canReportProblem = Boolean((isClientOwner || isAssignedTasker) && disputableStatuses.has(task.status));
  const acceptedOffer = offers.find((offer) => offer.id === task.accepted_offer_id || offer.status === "accepted");
  const canOffer = isTasker && !isAssignedTasker && !isClientOwner;
  const offerUnavailable = user ? (
    <>
      <p>Nabídku může poslat jen účet registrovaný jako tasker.</p>
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
      <MarkMessagesRead taskId={task.id} enabled={canMessage} />
      <Header />
      <main className={`page-shell ${styles.detailShell}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(taskSchema(task, offers.length, attachments.length)) }} />
        <section className={`page-hero ${styles.detailHero}`}>
          <div>
            <p className="kicker">Detail objednávky</p>
            <h1 className="page-title">{task.title}</h1>
            <p className="hero-lead">{task.description}</p>
            <div className={`task-meta ${styles.detailMeta}`}><span>{task.category}</span><span>{task.city}</span>{task.district ? <span>{task.district}</span> : null}<span>{task.desired_time}</span></div>
          </div>
          <div className={`page-hero-card ${styles.summaryCard}`}>
            <span>{statusLabels[task.status] ?? task.status}</span>
            <strong>{money(task.budget_czk)} Kč</strong>
            <p>Rozpočet klienta</p>
          </div>
        </section>

        <section className={styles.trustRail} aria-label="Důvěra a role platformy">
          <span>Taskovo zprostředkovává kontakt</span>
          <span>Klient vybírá taskera samostatně</span>
          <span>Tasker není zaměstnanec Taskovo</span>
          <span>Fotky jsou jen v detailu objednávky</span>
        </section>

        {(updateMessage || errorMessage) ? (
          <section className={styles.noticeStack} aria-live="polite">
            {updateMessage ? (
              <div className={`${styles.notice} ${styles.noticeSuccess}`}>
                <strong>{updateMessage.title}</strong>
                <p>{updateMessage.body}</p>
              </div>
            ) : null}
            {errorMessage ? (
              <div className={`${styles.notice} ${styles.noticeError}`}>
                <strong>{errorMessage.title}</strong>
                <p>{errorMessage.body}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className={styles.orderGrid}>
          <div className={styles.orderMain}>
            <section className={`${styles.orderPanel} ${styles.timelinePanel}`}>
              <div className={`section-heading-row ${styles.compactHeading}`}>
                <div>
                  <p className="kicker">Průběh objednávky</p>
                  <h2>Stav a další krok</h2>
                </div>
                <span className={`pill status-${task.status}`}>{statusLabels[task.status] ?? task.status}</span>
              </div>
              <div className={styles.timelineList}>
                {timelineSteps.map((step) => {
                  const isDone = step.statuses.includes(task.status);
                  const isCurrent = step.key === task.status || (task.status === "offers_received" && step.key === "offers_received") || (task.status === "awaiting_confirmation" && step.key === "in_progress");
                  return <span key={step.key} className={isCurrent ? styles.timelineCurrent : isDone ? styles.timelineDone : undefined}>{step.label}</span>;
                })}
              </div>
              <p>{workflowCopy[task.status] ?? "Objednávka čeká na další akci."}</p>
            </section>

            <section className={styles.orderPanel}>
              <div className={`section-heading-row ${styles.compactHeading}`}>
                <div>
                  <p className="kicker">Fotky k objednávce</p>
                  <h2>Vizuální podklady</h2>
                </div>
                <span className="pill">{attachments.length} fotek</span>
              </div>

              {attachments.length ? (
                <div className={styles.attachmentGrid}>
                  {attachments.map((attachment) => (
                    <figure key={attachment.id} className={styles.attachmentCard}>
                      <img src={attachment.image_url} alt={attachment.caption || "Fotka k objednávce"} />
                      {attachment.caption ? <figcaption>{attachment.caption}</figcaption> : null}
                    </figure>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <h3>Zatím bez fotek</h3>
                  <p>Fotky pomůžou taskerovi rychleji pochopit rozsah práce. V seznamu úkolů se nezobrazují, zůstanou jen na této stránce.</p>
                </div>
              )}

              {isClientOwner ? (
                <form className={`compact-form ${styles.attachmentForm}`} action={addTaskAttachment}>
                  <input type="hidden" name="task_id" value={task.id} />
                  <label className="span-full">Fotka<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required /></label>
                  <label className="span-full">Popis<input name="caption" type="text" placeholder="Například: chodba před stěhováním" /></label>
                  <p className="fine-print span-full">JPG, PNG, WebP nebo GIF. Maximálně 8 MB na fotku.</p>
                  <button className="button secondary span-full" type="submit">Nahrát fotku</button>
                </form>
              ) : null}
            </section>

            <section className={styles.orderPanel}>
              <div className={`section-heading-row ${styles.compactHeading}`}>
                <div>
                  <p className="kicker">Nabídky</p>
                  <h2>Výběr taskera</h2>
                </div>
                <span className="pill">{offers.length} nabídek</span>
              </div>
              <TaskCard
                task={task}
                offers={offers}
                canSelectOffer={isClientOwner}
                canManageTask={isClientOwner}
                showOfferForm={canOffer}
                authenticatedTasker={isTasker}
                offerUnavailable={isClientOwner ? null : offerUnavailable}
              />
            </section>

            <section className={styles.orderPanel}>
              <div className={`section-heading-row ${styles.compactHeading}`}>
                <div>
                  <p className="kicker">Zprávy</p>
                  <h2>Domluva k objednávce</h2>
                </div>
                <span className="pill">{messages.length} zpráv</span>
              </div>

              {!task.assigned_tasker_auth_user_id ? (
                <div className={styles.emptyState}>
                  <h3>Zprávy se otevřou po výběru taskera</h3>
                  <p>Klient nejdřív vybere nabídku. Potom se tady objeví soukromá domluva mezi klientem a vybraným taskerem.</p>
                </div>
              ) : !canMessage ? (
                <div className={styles.emptyState}>
                  <h3>Soukromá domluva</h3>
                  <p>Zprávy vidí jen klient a vybraný tasker této objednávky.</p>
                </div>
              ) : (
                <div className={styles.messageThread}>
                  {messages.length ? (
                    <div className={styles.messageList}>
                      {messages.map((message) => (
                        <article key={message.id} className={`${styles.messageBubble} ${message.sender_auth_user_id === user?.id ? styles.ownMessage : ""}`}>
                          <div className={styles.messageHeader}>
                            <strong>{message.sender_name}</strong>
                            <span>{roleLabels[message.sender_role] ?? message.sender_role} · {dateTime(message.created_at)}</span>
                          </div>
                          <p>{message.body}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <h3>Zatím bez zpráv</h3>
                      <p>Napište první zprávu a domluvte termín, adresu nebo detaily práce.</p>
                    </div>
                  )}

                  <form className={`compact-form ${styles.messageForm}`} action={sendTaskMessage}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <label className="span-full">Zpráva<textarea name="body" rows={4} maxLength={1200} placeholder="Napište krátkou zprávu k objednávce..." required /></label>
                    <div className={styles.messageActions}>
                      <p className="fine-print">Maximálně 1200 znaků. Zpráva zůstane u této objednávky.</p>
                      <button className="button primary" type="submit">Poslat zprávu</button>
                    </div>
                  </form>
                </div>
              )}
            </section>
          </div>

          <aside className={styles.orderSidebar}>
            <section className={`${styles.orderPanel} ${styles.stickyPanel}`}>
              <p className="kicker">Stav zakázky</p>
              <h2>{statusLabels[task.status] ?? task.status}</h2>
              <dl className={styles.orderFacts}>
                <div><dt>Město</dt><dd>{task.city}</dd></div>
                <div><dt>Termín</dt><dd>{task.desired_time}</dd></div>
                <div><dt>Rozpočet</dt><dd>{money(task.budget_czk)} Kč</dd></div>
                <div><dt>Nabídky</dt><dd>{offers.length}</dd></div>
              </dl>
              <div className={styles.workflowBox}>
                <span className="pill">Další krok</span>
                <p>{workflowCopy[task.status] ?? "Objednávka čeká na další akci."}</p>
                {isAssignedTasker && task.status === "assigned" ? (
                  <form action={startTaskWork}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <button className="button primary" type="submit">Začít práci</button>
                  </form>
                ) : null}
                {isAssignedTasker && task.status === "in_progress" ? (
                  <form action={requestTaskCompletion}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <button className="button primary" type="submit">Označit jako hotové</button>
                  </form>
                ) : null}
                {isClientOwner && task.status === "awaiting_confirmation" ? (
                  <form action={confirmTaskCompletion}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <button className="button primary" type="submit">Potvrdit dokončení</button>
                  </form>
                ) : null}
              </div>
              {acceptedOffer ? (
                <div className={styles.selectedTaskerBox}>
                  <span className="pill status-assigned">Vybráno</span>
                  <strong>{acceptedOffer.tasker_name}</strong>
                  <p>{money(acceptedOffer.price_czk)} Kč</p>
                  <small>{acceptedOffer.tasker_contact || "Kontakt bude doplněn po potvrzení."}</small>
                </div>
              ) : (
                <p className="fine-print">Jakmile klient vybere nabídku, objednávka se přesune do stavu “Tasker vybrán”.</p>
              )}
              <div className={styles.safetyBox}>
                <strong>Bezpečná domluva</strong>
                <p>Kontakt a zprávy držíme u objednávky. Platby a recenze napojíme v další fázi pilotu.</p>
              </div>
              {canReportProblem ? (
                <form className={styles.disputeForm} action={requestTaskDispute}>
                  <input type="hidden" name="task_id" value={task.id} />
                  <label>Nahlásit problém<textarea name="reason" rows={4} maxLength={1200} placeholder="Stručně popište, co se stalo..." required /></label>
                  <p className="fine-print">Objednávka se pozastaví a administrátor uvidí váš popis ve zprávách.</p>
                  <button className="button secondary" type="submit">Nahlásit problém</button>
                </form>
              ) : null}
            </section>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
