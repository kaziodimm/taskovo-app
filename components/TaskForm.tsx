import { createTask } from "@/app/actions";

const cities = ["Praha", "Brno", "Plzeň", "Olomouc", "Liberec", "České Budějovice"];
const categories = [
  "Doručení / vyzvednutí",
  "Montáž nábytku",
  "Úklid a pomoc doma",
  "Stěhování / odnos věcí",
  "Opravy v domácnosti",
  "Ostatní úkoly",
];

export function TaskForm() {
  return (
    <section className="request-card" id="request" aria-labelledby="request-title">
      <div className="card-heading">
        <p className="kicker">Nový úkol</p>
        <h2 id="request-title">Co potřebujete zařídit?</h2>
      </div>
      <form action={createTask} className="task-form">
        <label className="span-full">Popis úkolu<textarea name="description" rows={4} placeholder="Např. vyzvednout balík ze Zásilkovny a dovézt ho dnes po 17:00" required /></label>
        <label>Kategorie<select name="category" required>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        <label>Město<select name="city" required>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
        <label>Rozpočet<span className="money-field"><input name="budget_czk" type="number" min="100" step="50" defaultValue="300" required /><span>Kč</span></span></label>
        <label>Termín<select name="desired_time" required><option>Dnes</option><option>Zítra</option><option>Tento týden</option><option>Domluvou</option></select></label>
        <label>Jméno<input name="client_name" type="text" placeholder="Vyplňte jen bez účtu" /></label>
        <label>Kontakt<input name="client_contact" type="text" placeholder="+420 ... / email" /></label>
        <button className="button primary span-full" type="submit">Odeslat úkol</button>
        <p className="fine-print span-full">Pokud jste přihlášeni, úkol se uloží k vašemu účtu a kontakt se vezme z profilu. Přesná adresa se sdílí až po potvrzení taskera.</p>
      </form>
    </section>
  );
}
