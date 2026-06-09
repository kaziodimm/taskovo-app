import { notFound, redirect } from "next/navigation";
import { toggleTaskerVerification, updateAdminTaskerProfile } from "@/app/admin-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfilePhotoModeration } from "@/components/ProfilePhotoModeration";
import { getAdminTasks, getOffersForTasker, getTaskerById } from "@/lib/data";
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

export default async function AdminTaskerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const { id } = await params;
  const tasker = await getTaskerById(id);
  if (!tasker) notFound();

  const [tasks, offers] = await Promise.all([
    getAdminTasks(),
    tasker.auth_user_id ? getOffersForTasker(tasker.auth_user_id) : Promise.resolve([]),
  ]);

  const assignedTasks = tasks.filter((task) => task.assigned_tasker_profile_id === tasker.id || task.assigned_tasker_auth_user_id === tasker.auth_user_id);
  const completedTasks = assignedTasks.filter((task) => task.status === "completed");
  const activeTasks = assignedTasks.filter((task) => ["assigned", "in_progress", "awaiting_confirmation"].includes(task.status));

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin · tasker</p>
            <h1 className="page-title">{tasker.name}</h1>
            <p className="hero-lead">Detail taskera, ověření, nabídky a aktivní práce.</p>
          </div>
          <div className="page-hero-card"><strong>{tasker.verified ? "Ověřen" : "Čeká"}</strong><p>{assignedTasks.length} přiřazených zakázek</p></div>
        </section>

        <section className="admin-panel">
          <div className="section-heading-row">
            <div className="section-title"><p className="kicker">Profil</p><h2>Údaje taskera</h2></div>
            <a className="button secondary" href="/admin">Zpět do adminu</a>
          </div>
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Email</h3><p>{tasker.email || "email neuveden"}</p></article>
            <article className="dashboard-panel"><h3>Kontakt</h3><p>{tasker.contact || "kontakt neuveden"}</p></article>
            <article className="dashboard-panel"><h3>Město</h3><p>{tasker.city}</p></article>
            <article className="dashboard-panel"><h3>Kategorie</h3><p>{tasker.categories}</p></article>
            <article className="dashboard-panel"><h3>Registrace</h3><p>{dateTime(tasker.created_at)}</p></article>
            <article className="dashboard-panel"><h3>Stav</h3><p>{tasker.verified ? "ověřen" : "čeká na ověření"}</p></article>
          </div>

          <ProfilePhotoModeration
            profileId={tasker.id}
            role="tasker"
            approvedUrl={tasker.avatar_url}
            pendingUrl={tasker.pending_avatar_url}
            status={tasker.avatar_review_status}
            note={tasker.avatar_review_note}
          />

          <form className="compact-form section-action" action={updateAdminTaskerProfile}>
            <input type="hidden" name="tasker_id" value={tasker.id} />
            <label>Jméno<input name="name" type="text" defaultValue={tasker.name} required /></label>
            <label>Email<input name="email" type="email" defaultValue={tasker.email || ""} /></label>
            <label>Město<input name="city" type="text" defaultValue={tasker.city} required /></label>
            <label>Kategorie<input name="categories" type="text" defaultValue={tasker.categories} required /></label>
            <label>Kontakt<input name="contact" type="text" defaultValue={tasker.contact || ""} /></label>
            <label className="checkbox-row"><input name="verified" type="checkbox" defaultChecked={tasker.verified} /> Ověřený tasker</label>
            <label className="span-full">Bio<textarea name="bio" rows={4} defaultValue={tasker.bio || ""} /></label>
            <button className="button primary span-full" type="submit">Uložit profil taskera</button>
          </form>

          <form action={toggleTaskerVerification} className="section-action">
            <input type="hidden" name="tasker_id" value={tasker.id} />
            <input type="hidden" name="verified" value={tasker.verified ? "false" : "true"} />
            <button className="button secondary" type="submit">{tasker.verified ? "Odebrat ověření" : "Ověřit taskera"}</button>
          </form>
        </section>

        <section className="section admin-panel">
          <div className="section-title"><p className="kicker">Zakázky</p><h2>Přiřazené práce</h2></div>
          <div className="admin-list">
            {assignedTasks.length ? assignedTasks.map((task) => (
              <article className="admin-item" key={task.id}>
                <strong>{task.title}</strong>
                <p>{task.city} · {task.desired_time} · {money(task.budget_czk)} Kč · {statusLabels[task.status] ?? task.status}</p>
                <div className="hero-actions">
                  <a className="button primary" href={`/admin/tasks/${task.id}`}>Řídit objednávku</a>
                  <a className="button secondary" href={`/ukol/${task.id}`}>Veřejný detail</a>
                </div>
              </article>
            )) : <article className="admin-item"><strong>Bez přiřazených prací</strong><p>Tasker zatím nemá vybranou zakázku.</p></article>}
          </div>
        </section>

        <section className="section admin-panel">
          <div className="section-title"><p className="kicker">Nabídky</p><h2>Historie nabídek</h2></div>
          <div className="admin-list">
            {offers.length ? offers.map((offer) => (
              <article className="admin-item" key={offer.id}>
                <strong>{money(offer.price_czk)} Kč · {offer.status}</strong>
                <p>{offer.message}</p>
                <a className="button secondary" href={`/admin/tasks/${offer.task_id}`}>Objednávka</a>
              </article>
            )) : <article className="admin-item"><strong>Bez nabídek</strong><p>Tasker zatím neposlal žádnou nabídku z účtu.</p></article>}
          </div>
        </section>

        <section className="section admin-panel">
          <div className="section-title"><p className="kicker">Souhrn</p><h2>Výkon</h2></div>
          <div className="dashboard-grid">
            <article className="dashboard-panel"><h3>Aktivní</h3><p>{activeTasks.length} zakázek</p></article>
            <article className="dashboard-panel"><h3>Dokončeno</h3><p>{completedTasks.length} zakázek</p></article>
            <article className="dashboard-panel"><h3>Nabídky</h3><p>{offers.length} nabídek</p></article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
