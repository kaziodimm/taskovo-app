import { acceptOffer, createOffer } from "@/app/actions";
import type { Offer, Task } from "@/lib/types";

const statusLabels: Record<string, string> = {
  pending_review: "Kontrola",
  open: "Otevreno",
  offers_received: "Nabidky",
  assigned: "Prirazeno",
  in_progress: "Probiha",
  completed: "Hotovo",
  cancelled: "Zruseno",
  disputed: "Spor",
};

const offerStatusLabels: Record<string, string> = {
  pending: "Ceka",
  accepted: "Vybrano",
  declined: "Odmitnuto",
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
};

export function TaskCard({ task, offers, canSelectOffer = false, showOfferForm = true }: TaskCardProps) {
  const fee = platformFee(task.budget_czk);
  const payout = task.budget_czk - fee;
  const canChoose = canSelectOffer && task.status !== "assigned" && task.status !== "completed" && task.status !== "cancelled";

  return (
    <article className="task-card">
      <header>
        <div><span className="pill">{task.category}</span><h3>{task.title}</h3></div>
        <span className={`pill status-${task.status}`}>{statusLabels[task.status] ?? task.status}</span>
      </header>
      <p>{task.description}</p>
      <div className="task-meta"><span>{task.city}</span><span>{task.desired_time}</span>{task.district ? <span>{task.district}</span> : null}</div>
      <div className="price-row" aria-label="Cena a provize">
        <div><span>Rozpocet</span><strong>{money(task.budget_czk)} Kc</strong></div>
        <div><span>Provize</span><strong>{money(fee)} Kc</strong></div>
        <div><span>Tasker</span><strong>{money(payout)} Kc</strong></div>
        <div><span>Nabidky</span><strong>{offers.length}</strong></div>
      </div>
      <details>
        <summary>Nabidky</summary>
        <ul className="offer-list">
          {offers.length ? offers.map((offer) => {
            const isAccepted = task.accepted_offer_id === offer.id || offer.status === "accepted";

            return (
              <li key={offer.id} className={isAccepted ? "selected-offer" : undefined}>
                <strong>{offer.tasker_name}</strong>
                <span>{money(offer.price_czk)} Kc</span>
                <p>{offer.message}</p>
                <small>{offerStatusLabels[offer.status] ?? offer.status}</small>
                {canChoose ? (
                  <form action={acceptOffer} className="inline-action-form">
                    <input type="hidden" name="task_id" value={task.id} />
                    <input type="hidden" name="offer_id" value={offer.id} />
                    <button className="button secondary" type="submit">Vybrat taskera</button>
                  </form>
                ) : null}
                {isAccepted ? <span className="pill status-assigned">Vybrano</span> : null}
              </li>
            );
          }) : <li className="muted-row">Zatim bez nabidek.</li>}
        </ul>
        <p className="contact-note">Kontakt klienta se ukaze az po potvrzeni vybraneho taskera.</p>
      </details>
      {showOfferForm ? (
        <form className="offer-form" action={createOffer}>
          <input type="hidden" name="task_id" value={task.id} />
          <label>Jmeno<input name="tasker_name" type="text" placeholder="Jen bez uctu" /></label>
          <label>Kontakt<input name="tasker_contact" type="text" placeholder="+420 ... / email" /></label>
          <label>Cena<span className="money-field"><input name="price_czk" type="number" min="50" step="50" required /><span>Kc</span></span></label>
          <label>Zprava<input name="message" type="text" placeholder="Muzu dnes po 18:00, mam auto." required /></label>
          <button className="button secondary span-full" type="submit">Poslat nabidku</button>
          <p className="fine-print span-full">Prihlasenemu taskerovi se jmeno a kontakt doplni z profilu.</p>
        </form>
      ) : null}
    </article>
  );
}
