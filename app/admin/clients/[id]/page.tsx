import { notFound, redirect } from "next/navigation";
import { updateAdminClientProfile } from "@/app/admin-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import detailListStyles from "@/components/AdminDetailList.module.css";
import { ProfilePhotoModeration } from "@/components/ProfilePhotoModeration";
import { getAdminTasks, getClientById, getOffers } from "@/lib/data";
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

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("cs-CZ", { dateStyle: "short", timeStyle: "short" });
}

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const { id } = await params;
  const [client, tasks, offers] = await Promise.all([getClientById(id), getAdminTasks(), getOffers()]);
  if (!client) notFound();

  const clientTasks = tasks.filter((task) => task.client_auth_user_id === client.auth_user_id || task.client_contact === client.email || task.client_name === client.name);
  const clientTaskIds = new Set(clientTasks.map((task) => task.id));
  const clientOffers = offers.filter((offer) => clientTaskIds.has(offer.task_id));
  const activeTasks = clientTasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));
  const completedTasks = clientTasks.filter((task) => task.status === "completed");

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin · klient</p>
            <h1 className="page-title">{client.name}</h1>
            <p className="hero-lead">Detail klienta, kontakty, historie objednávek a provozní kontext pro podporu.</p>
          </div>
          <div className="page-hero-card"><strong>{clientTasks.length}</strong><p>objednávek · {activeTasks.length} aktivních</p></div>
        </section>

        <section className="admin-panel">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Profil</p><h2>Kontaktní údaje</h2></div>
            <a className="button secondary" href="/admin">Zpět do adminu</a>
          </div>
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Email</h3><p>{client.email}</p></article>
            <article className="dashboard-panel"><h3>Telefon</h3><p>{client.phone || "bez telefonu"}</p></article>
            <article className="dashboard-panel"><h3>Město</h3><p>{client.city || "město neuvedeno"}</p></article>
            <article className="dashboard-panel"><h3>Jazyk</h3><p>{client.preferred_language || "cs"}</p></article>
            <article className="dashboard-panel"><h3>Marketing</h3><p>{client.marketing_consent ? "souhlas" : "bez souhlasu"}</p></article>
            <article className="dashboard-panel"><h3>Registrace</h3><p>{dateTime(client.created_at)}</p></article>
          </div>

          <ProfilePhotoModeration
            profileId={client.id}
            role="client"
            approvedUrl={client.avatar_url}
            pendingUrl={client.pending_avatar_url}
            status={client.avatar_review_status}
            note={client.avatar_review_note}
          />

          <form className="compact-form section-action" action={updateAdminClientProfile}>
            <input type="hidden" name="client_id" value={client.id} />
            <label>Jméno<input name="name" type="text" defaultValue={client.name} required /></label>
            <label>Email<input name="email" type="email" defaultValue={client.email} required /></label>
            <label>Telefon<input name="phone" type="text" defaultValue={client.phone || ""} /></label>
            <label>Město<input name="city" type="text" defaultValue={client.city || ""} /></label>
            <label>Jazyk<input name="preferred_language" type="text" defaultValue={client.preferred_language || "cs"} /></label>
            <label className="checkbox-row"><input name="marketing_consent" type="checkbox" defaultChecked={client.marketing_consent} /> Souhlas s marketingem</label>
            <button className="button primary span-full" type="submit">Uložit profil klienta</button>
          </form>
        </section>

        <section className="section admin-panel">
          <div className="section-title"><p className="kicker">Objednávky</p><h2>Historie klienta</h2></div>
          <div className={detailListStyles.list}>
            {clientTasks.length ? clientTasks.map((task) => (
              <article className={detailListStyles.item} key={task.id}>
                <strong className={detailListStyles.title}>{task.title}</strong>
                <p className={detailListStyles.text}>{task.city} · {task.desired_time} · {money(task.budget_czk)} Kč · {statusLabels[task.status] ?? task.status} · {offers.filter((offer) => offer.task_id === task.id).length} nabídek</p>
                <div className={detailListStyles.actions}>
                  <a className="button primary" href={`/admin/tasks/${task.id}`}>Řídit objednávku</a>
                  <a className="button secondary" href={`/ukol/${task.id}`}>Veřejný detail</a>
                </div>
              </article>
            )) : <article className={`${detailListStyles.item} ${detailListStyles.empty}`}><strong className={detailListStyles.title}>Bez objednávek</strong><p className={detailListStyles.text}>Klient zatím nemá žádnou navázanou objednávku.</p></article>}
          </div>
        </section>

        <section className="section admin-panel">
          <div className="section-title"><p className="kicker">Souhrn</p><h2>Aktivita</h2></div>
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Aktivní</h3><p>{activeTasks.length} objednávek</p></article>
            <article className="dashboard-panel"><h3>Dokončeno</h3><p>{completedTasks.length} objednávek</p></article>
            <article className="dashboard-panel"><h3>Nabídky celkem</h3><p>{clientOffers.length} nabídek na jeho objednávky</p></article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
