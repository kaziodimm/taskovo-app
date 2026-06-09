import { approveProfilePhoto, rejectProfilePhoto } from "@/app/admin-actions";

type ProfilePhotoModerationProps = {
  profileId: string;
  role: "client" | "tasker";
  approvedUrl?: string | null;
  pendingUrl?: string | null;
  status?: string | null;
  note?: string | null;
};

const statusLabels: Record<string, string> = {
  none: "Bez fotky ke kontrole",
  pending: "Čeká na schválení",
  approved: "Schváleno",
  rejected: "Odmítnuto",
};

export function ProfilePhotoModeration({ profileId, role, approvedUrl, pendingUrl, status, note }: ProfilePhotoModerationProps) {
  const reviewStatus = status || "none";

  return (
    <section className="section-action">
      <div className="section-title">
        <p className="kicker">Foto profilu</p>
        <h2>Kontrola fotky</h2>
        <p>Veřejně se zobrazí jen schválená fotka. Nové nahrané odkazy zůstávají skryté, dokud je administrátor nepotvrdí.</p>
      </div>
      <div className="dashboard-grid">
        <article className="dashboard-panel">
          <h3>Schválená</h3>
          {approvedUrl ? <img className="avatar brand-mark-large" src={approvedUrl} alt="Schválená profilová fotka" /> : <p>Zatím není nastavená.</p>}
        </article>
        <article className="dashboard-panel">
          <h3>Ke kontrole</h3>
          {pendingUrl ? <img className="avatar brand-mark-large" src={pendingUrl} alt="Fotka čekající na kontrolu" /> : <p>Žádná fotka nečeká.</p>}
        </article>
        <article className="dashboard-panel">
          <h3>Stav</h3>
          <p>{statusLabels[reviewStatus] || reviewStatus}</p>
          {note ? <p>{note}</p> : null}
        </article>
      </div>

      {pendingUrl ? (
        <div className="hero-actions">
          <form action={approveProfilePhoto}>
            <input type="hidden" name="profile_id" value={profileId} />
            <input type="hidden" name="role" value={role} />
            <button className="button primary" type="submit">Schválit fotku</button>
          </form>
          <form className="compact-form" action={rejectProfilePhoto}>
            <input type="hidden" name="profile_id" value={profileId} />
            <input type="hidden" name="role" value={role} />
            <label>Důvod odmítnutí<input name="reason" type="text" placeholder="Nevhodná fotka, špatná kvalita..." /></label>
            <button className="button secondary" type="submit">Odmítnout</button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
