import { notFound } from "next/navigation";
import { addTaskAttachment } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { getOffersForTask, getTaskAttachments, getTaskById } from "@/lib/data";
import { createServerSupabaseClient } from "@/lib/supabase";
import styles from "./page.module.css";

const statusLabels: Record<string, string> = {
  open: "Otevřeno",
  offers_received: "Nabídky dorazily",
  assigned: "Tasker vybrán",
  in_progress: "Probíhá",
  completed: "Hotovo",
  cancelled: "Zrušeno",
  disputed: "Spor",
};

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [task, offers, attachments] = await Promise.all([getTaskById(id), getOffersForTask(id), getTaskAttachments(id)]);
  if (!task) notFound();

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isClientOwner = Boolean(user?.id && task.client_auth_user_id === user.id);
  const acceptedOffer = offers.find((offer) => offer.id === task.accepted_offer_id || offer.status === "accepted");

  return (
    <>
      <Header />
      <main className={`page-shell ${styles.detailShell}`}>
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

        <section className={styles.orderGrid}>
          <div className={styles.orderMain}>
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
              <TaskCard task={task} offers={offers} canSelectOffer={isClientOwner} showOfferForm={!isClientOwner && task.status !== "assigned" && task.status !== "completed"} />
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
            </section>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
