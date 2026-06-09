import { notFound, redirect } from "next/navigation";
import { acceptAdminOffer, cancelAdminTask, declineAdminOffer, reopenAdminTask, updateAdminTaskStatus } from "@/app/admin-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getAdminTaskById, getOffersForTask, getTaskAttachments, getTaskMessages } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";

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

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const { id } = await params;
  const [task, offers, attachments, messages] = await Promise.all([
    getAdminTaskById(id),
    getOffersForTask(id),
    getTaskAttachments(id),
    getTaskMessages(id),
  ]);

  if (!task) notFound();

  const acceptedOffer = offers.find((offer) => offer.id === task.accepted_offer_id || offer.status === "accepted");

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin · objednávka</p>
            <h1 className="page-title">{task.title}</h1>
            <p className="hero-lead">{task.description}</p>
          </div>
          <div className="page-hero-card"><strong>{money(task.budget_czk)} Kč</strong><p>{statusLabels[task.status] ?? task.status}</p></div>
        </section>

        <section className="admin-panel">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Řízení</p><h2>Stav a zásahy</h2></div>
            <a className="button secondary" href="/admin">Zpět do adminu</a>
          </div>
          <div className="admin-list">
            <article className="admin-item">
              <strong>Zakázka</strong>
              <p>{task.city} · {task.district || "bez části města"} · {task.desired_time} · {task.category}</p>
              <p>Klient: {task.client_name} · {task.client_contact || "kontakt neuveden"}</p>
              <p>Vybraný tasker: {acceptedOffer?.tasker_name || "zatím nevybrán"}</p>
              <div className="hero-actions">
                <a className="button secondary" href={`/ukol/${task.id}`}>Veřejný detail</a>
                <form className="compact-form" action={updateAdminTaskStatus}>
                  <input type="hidden" name="task_id" value={task.id} />
                  <label>Stav<select name="status" defaultValue={task.status}>{adminStatusOptions.map((status) => <option key={status} value={status}>{statusLabels[status] ?? status}</option>)}</select></label>
                  <button className="button secondary" type="submit">Uložit stav</button>
                </form>
                {task.status !== "cancelled" ? (
                  <form action={cancelAdminTask}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <button className="button secondary" type="submit">Zrušit</button>
                  </form>
                ) : null}
                {acceptedOffer ? (
                  <form action={reopenAdminTask}>
                    <input type="hidden" name="task_id" value={task.id} />
                    <button className="button secondary" type="submit">Vrátit do hledání</button>
                  </form>
                ) : null}
              </div>
            </article>
          </div>
        </section>

        <div className="admin-grid section">
          <section className="admin-panel">
            <h2>Nabídky</h2>
            <div className="admin-list">
              {offers.length ? offers.map((offer) => (
                <article className="admin-item" key={offer.id}>
                  <strong>{offer.tasker_name}</strong>
                  <p>{money(offer.price_czk)} Kč · {offer.status}</p>
                  <p>{offer.message}</p>
                  <p>{offer.tasker_contact || "kontakt neuveden"}</p>
                  <div className="hero-actions">
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
              )) : <article className="admin-item"><strong>Bez nabídek</strong><p>Na zakázku zatím nikdo nereagoval.</p></article>}
            </div>
          </section>

          <section className="admin-panel">
            <h2>Zprávy</h2>
            <div className="admin-list">
              {messages.length ? messages.map((message) => (
                <article className="admin-item" key={message.id}>
                  <strong>{message.sender_name}</strong>
                  <p>{message.sender_role} · {dateTime(message.created_at)}</p>
                  <p>{message.body}</p>
                </article>
              )) : <article className="admin-item"><strong>Bez zpráv</strong><p>Soukromá domluva zatím nezačala.</p></article>}
            </div>
          </section>

          <section className="admin-panel">
            <h2>Fotky</h2>
            <div className="admin-list">
              {attachments.length ? attachments.map((attachment) => (
                <article className="admin-item" key={attachment.id}>
                  <strong>{attachment.caption || "Fotka bez popisu"}</strong>
                  <p>{dateTime(attachment.created_at)}</p>
                  <a className="button secondary" href={attachment.image_url}>Otevřít fotku</a>
                </article>
              )) : <article className="admin-item"><strong>Bez fotek</strong><p>Klient zatím nepřidal žádné podklady.</p></article>}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
