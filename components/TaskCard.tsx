import type { ReactNode } from "react";
import { acceptOffer, createOffer } from "@/app/actions";
import { cancelClientTask, updateClientTask } from "@/app/client-task-actions";
import type { Offer, Task } from "@/lib/types";
import styles from "./TaskCard.module.css";

const statusLabels: Record<string, string> = {
  pending_review: "Kontrola",
  open: "Otevřeno",
  offers_received: "Nabídky",
  assigned: "Přiřazeno",
  in_progress: "Probíhá",
  awaiting_confirmation: "Čeká na potvrzení",
  completed: "Hotovo",
  cancelled: "Zrušeno",
  disputed: "Spor",
};

const offerStatusLabels: Record<string, string> = {
  pending: "Čeká",
  accepted: "Vybráno",
  declined: "Odmítnuto",
};

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

function platformFee(value: number) {
  return Math.max(50, Math.round(value * 0.12));
}

type TaskCardProps = {
  task: Task;
  offers: Offer[];
  canSelectOffer?: boolean;
  showOfferForm?: boolean;
  canManageTask?: boolean;
  authenticatedTasker?: boolean;
  offerUnavailable?: ReactNode;
};

export function TaskCard({
  task,
  offers,
  canSelectOffer = false,
  showOfferForm = true,
  canManageTask = false,
  authenticatedTasker = false,
  offerUnavailable,
}: TaskCardProps) {
  const fee = platformFee(task.budget_czk);
  const payout = task.budget_czk - fee;
  const canChoose = canSelectOffer && ["open", "offers_received"].includes(task.status);
  const canEdit = canManageTask && ["open", "offers_received"].includes(task.status);
  const canCancel = canEdit;
  const isLockedForClient = canManageTask && !["open", "offers_received", "completed", "cancelled"].includes(task.status);
  const isAvailableForOffer = ["open", "offers_received"].includes(task.status);
  const canSendOffer = showOfferForm && isAvailableForOffer;

  return (
    <article className={`task-card ${styles.card}`}>
      <header className={styles.header}>
        <div className={styles.titleBlock}><span className="pill">{task.category}</span><h3>{task.title}</h3></div>
        <span className={`pill status-${task.status} ${styles.status}`}>{statusLabels[task.status] ?? task.status}</span>
      </header>
      <p className={styles.description}>{task.description}</p>
      <div className={`task-meta ${styles.meta}`}><span>{task.city}</span><span>{task.desired_time}</span>{task.district ? <span>{task.district}</span> : null}</div>
      <div className={`price-row ${styles.price}`} aria-label="Cena a provize">
        <div><span>Rozpočet</span><strong>{money(task.budget_czk)} Kč</strong></div>
        <div><span>Provize</span><strong>{money(fee)} Kč</strong></div>
        <div><span>Tasker</span><strong>{money(payout)} Kč</strong></div>
        <div><span>Nabídky</span><strong>{offers.length}</strong></div>
      </div>
      <a className={`button secondary ${styles.detailAction}`} href={`/ukol/${task.id}`}>Detail objednávky</a>

      {canEdit || canCancel || isLockedForClient ? (
        <details className={styles.manageBox}>
          <summary>Správa objednávky</summary>
          {canEdit ? (
            <form className="offer-form" action={updateClientTask}>
              <input type="hidden" name="task_id" value={task.id} />
              <label className="span-full">Popis<textarea name="description" rows={3} defaultValue={task.description} required /></label>
              <label>Kategorie<input name="category" type="text" defaultValue={task.category} required /></label>
              <label>Město<input name="city" type="text" defaultValue={task.city} required /></label>
              <label>Část města<input name="district" type="text" defaultValue={task.district || ""} /></label>
              <label>Termín<input name="desired_time" type="text" defaultValue={task.desired_time} required /></label>
              <label>Rozpočet<span className="money-field"><input name="budget_czk" type="number" min="100" step="50" defaultValue={task.budget_czk} required /><span>Kč</span></span></label>
              <button className="button secondary span-full" type="submit">Uložit změny</button>
            </form>
          ) : null}
          {canCancel ? (
            <form action={cancelClientTask} className={`compact-form ${styles.cancelForm}`}>
              <input type="hidden" name="task_id" value={task.id} />
              <label className="span-full">Důvod zrušení<textarea name="reason" rows={3} placeholder="Například: úkol už není potřeba, změnil se termín..." /></label>
              <button className="button secondary span-full" type="submit">Zrušit objednávku</button>
            </form>
          ) : null}
          {isLockedForClient ? (
            <p className="fine-print">Objednávku už nelze upravit ani zrušit přímo, protože tasker byl vybrán. Pokud nastal problém, otevřete detail a použijte “Nahlásit problém”.</p>
          ) : null}
        </details>
      ) : null}

      <details>
        <summary>Nabídky</summary>
        <ul className="offer-list">
          {offers.length ? offers.map((offer) => {
            const isAccepted = task.accepted_offer_id === offer.id || offer.status === "accepted";

            return (
              <li key={offer.id} className={isAccepted ? "selected-offer" : undefined}>
                <strong>{offer.tasker_name}</strong>
                <span>{money(offer.price_czk)} Kč</span>
                <p>{offer.message}</p>
                <small>{offerStatusLabels[offer.status] ?? offer.status}</small>
                {canChoose ? (
                  <form action={acceptOffer} className="inline-action-form">
                    <input type="hidden" name="task_id" value={task.id} />
                    <input type="hidden" name="offer_id" value={offer.id} />
                    <button className="button secondary" type="submit">Vybrat taskera</button>
                  </form>
                ) : null}
                {isAccepted ? <span className="pill status-assigned">Vybráno</span> : null}
              </li>
            );
          }) : <li className="muted-row">Zatím bez nabídek.</li>}
        </ul>
        <p className="contact-note">Kontakt klienta se ukáže až po potvrzení vybraného taskera.</p>
      </details>
      {canSendOffer ? (
        <form className="offer-form" action={createOffer}>
          <input type="hidden" name="task_id" value={task.id} />
          {!authenticatedTasker ? (
            <>
              <label>Jméno<input name="tasker_name" type="text" placeholder="Jen bez účtu" /></label>
              <label>Kontakt<input name="tasker_contact" type="text" placeholder="+420 ... / email" /></label>
            </>
          ) : null}
          <label>Cena<span className="money-field"><input name="price_czk" type="number" min="50" step="50" required /><span>Kč</span></span></label>
          <label>Zpráva<input name="message" type="text" placeholder="Můžu dnes po 18:00, mám auto." required /></label>
          <button className="button secondary span-full" type="submit">Poslat nabídku</button>
          <p className="fine-print span-full">{authenticatedTasker ? "Jméno a kontakt se doplní z vašeho tasker profilu." : "Nabídku může poslat jen přihlášený tasker."}</p>
        </form>
      ) : isAvailableForOffer && offerUnavailable ? (
        <div className={styles.offerCta}>{offerUnavailable}</div>
      ) : null}
    </article>
  );
}
