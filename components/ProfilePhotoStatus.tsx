import type { AvatarReviewStatus } from "@/lib/types";
import styles from "./ProfilePhotoStatus.module.css";

type ProfilePhotoStatusProps = {
  avatarUrl?: string | null;
  pendingAvatarUrl?: string | null;
  status?: AvatarReviewStatus | string | null;
  note?: string | null;
  roleLabel?: "klienta" | "taskera";
};

const statusCopy: Record<string, { label: string; body: string; tone: "neutral" | "success" | "warning" | "danger" }> = {
  none: {
    label: "Bez fotky",
    body: "Profilová fotka zatím není odeslaná ke kontrole.",
    tone: "neutral",
  },
  pending: {
    label: "Čeká na kontrolu",
    body: "Nová fotka je uložená a čeká na schválení administrátorem.",
    tone: "warning",
  },
  approved: {
    label: "Schváleno",
    body: "Fotka je schválená a může se zobrazovat v profilu.",
    tone: "success",
  },
  rejected: {
    label: "Odmítnuto",
    body: "Fotka byla odmítnuta. Můžete poslat novou verzi.",
    tone: "danger",
  },
};

function fallbackInitial(roleLabel: string) {
  return roleLabel === "taskera" ? "T" : "K";
}

function statusClass(tone: string) {
  if (tone === "success") return styles.success;
  if (tone === "warning") return styles.warning;
  if (tone === "danger") return styles.danger;
  return styles.neutral;
}

export function ProfilePhotoStatus({ avatarUrl, pendingAvatarUrl, status, note, roleLabel = "klienta" }: ProfilePhotoStatusProps) {
  const normalizedStatus = status || (pendingAvatarUrl ? "pending" : avatarUrl ? "approved" : "none");
  const copy = statusCopy[normalizedStatus] || statusCopy.none;

  return (
    <div className={styles.statusGrid}>
      <article className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <h3>Schválená fotka</h3>
          <span className={`${styles.statusPill} ${avatarUrl ? styles.success : styles.neutral}`}>{avatarUrl ? "aktivní" : "není"}</span>
        </div>
        <div className={styles.imageFrame}>
          {avatarUrl ? <img src={avatarUrl} alt={`Schválená profilová fotka ${roleLabel}`} /> : <span>{fallbackInitial(roleLabel)}</span>}
        </div>
        <p>{avatarUrl ? "Tato fotka se může zobrazovat v profilu." : "Po schválení se tady ukáže aktivní profilová fotka."}</p>
      </article>

      <article className={styles.previewCard}>
        <div className={styles.previewHeader}>
          <h3>Ke kontrole</h3>
          <span className={`${styles.statusPill} ${pendingAvatarUrl ? styles.warning : styles.neutral}`}>{pendingAvatarUrl ? "čeká" : "prázdné"}</span>
        </div>
        <div className={styles.imageFrame}>
          {pendingAvatarUrl ? <img src={pendingAvatarUrl} alt={`Profilová fotka ${roleLabel} čekající na kontrolu`} /> : <span>+</span>}
        </div>
        <p>{pendingAvatarUrl ? "Admin ji musí schválit, než se začne zobrazovat veřejně." : "Nově nahraná fotka se objeví v této frontě."}</p>
      </article>

      <article className={`${styles.statusCard} ${statusClass(copy.tone)}`}>
        <span className={styles.statusEyebrow}>Stav moderace</span>
        <strong>{copy.label}</strong>
        <p>{copy.body}</p>
        {note ? <p className={styles.note}>{note}</p> : null}
      </article>
    </div>
  );
}
