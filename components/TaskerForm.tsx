import { createTaskerProfile } from "@/app/actions";

const cities = ["Praha", "Brno", "Plzeň", "Olomouc", "Liberec", "České Budějovice"];

export function TaskerForm() {
  return (
    <form className="tasker-card" action={createTaskerProfile}>
      <label>
        Jméno
        <input name="name" type="text" placeholder="Petra Svobodová" required />
      </label>
      <label>
        Město
        <select name="city" required>
          {cities.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </label>
      <label>
        Kategorie
        <input name="categories" type="text" placeholder="Doručení, montáž, stěhování" required />
      </label>
      <label>
        Kontakt
        <input name="contact" type="text" placeholder="+420 ... / Telegram / email" required />
      </label>
      <label>
        Krátký profil
        <textarea name="bio" rows={4} placeholder="Mám auto, večer volno, umím montovat nábytek." />
      </label>
      <button className="button primary" type="submit">
        Odeslat registraci
      </button>
    </form>
  );
}
