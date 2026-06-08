import { createOffer } from "@/app/actions";
import type { Offer, Task } from "@/lib/types";

const statusLabels: Record<string, string> = {
  pending_review: "Kontrola",
  open: "Otevřeno",
  offers_received: "Nabídky",
  assigned: "Přiřazeno",
  in_progress: "Probíhá",
  completed: "Hotovo",
  cancelled: "Zrušeno",
  disputed: "Spor",
};

function money(value: number) {
  return value.toLocaleString("cs-CZ");
}

function platformFee(value: number) {
  return Math.max(50, Math.round(value * 0.12));
}

export function TaskCard({ task, offers }: { task: Task; offers: Offer[] }) {
  const fee = platformFee(task.budget_czk);
  const payout = task.budget_czk - fee;

  return (
    <article className="task-card">
      <header>
        <div>
          <span className="pill">{task.category}</span>
          <h3>{task.title}</h3>
        </div>
        <span className={`pill status-${task.status}`}>{statusLabels[task.status] ?? task.status}</span>
      </header>
      <p>{task.description}</p>
      <div className="task-meta">
        <span>{task.city}</span>
        <span>{task.desired_time}</span>
        {task.district ? <span>{task.district}</span> : null}
      </div>
      <div className="price-row" aria-label="Cena a provize">
        <div>
          <span>Rozpočet</span>
          <strong>{money(task.budget_czk)} Kč</strong>
        </div>
        <div>
          <span>Provize</span>
          <strong>{money(fee)} Kč</strong>
        </div>
        <div>
          <span>Pomocník</span>
          <strong>{money(payout)} Kč</strong>
        </div>
        <div>
          <span>Nabídky</span>
          <strong>{offers.length}</strong>
        </div>
      </div>
      <details>
        <summary>Nabídky</summary>
        <ul className="offer-list">
          {offers.length ? (
            offers.map((offer) => (
              <li key={offer.id}>
                <strong>{offer.tasker_name}</strong>
                <span>{money(offer.price_czk)} Kč</span>
                <p>{offer.message}</p>
              </li>
            ))
          ) : (
            <li className="muted-row">Zatím bez nabídek.</li>
          )}
        </ul>
        <p className="contact-note">Kontakt klienta se ukáže až po potvrzení vybraného pomocníka.</p>
      </details>
      <form className="offer-form" action={createOffer}>
        <input type="hidden" name="task_id" value={task.id} />
        <label>
          Jméno
          <input name="tasker_name" type="text" placeholder="Vaše jméno" required />
        </label>
        <label>
          Kontakt
          <input name="tasker_contact" type="text" placeholder="+420 ... / email" required />
        </label>
        <label>
          Cena
          <span className="money-field">
            <input name="price_czk" type="number" min="50" step="50" required />
            <span>Kč</span>
          </span>
        </label>
        <label>
          Zpráva
          <input name="message" type="text" placeholder="Můžu dnes po 18:00, mám auto." required />
        </label>
        <button className="button secondary span-full" type="submit">
          Poslat nabídku
        </button>
      </form>
    </article>
  );
}
