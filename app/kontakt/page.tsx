import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ContactPage() {
  return (
    <><Header /><main className="page-shell split"><section className="section-title"><p className="kicker">Kontakt</p><h1 className="page-title">Pojdme stavet pilot Taskovo</h1><p>Pro prvni fazi bude kontakt slouzit pro podporu klientu, rucni schvalovani poskytovatelu a sběr feedbacku.</p><div className="feature-list"><div><strong>Email</strong><span>hello@taskovo.cz</span></div><div><strong>Podpora</strong><span>Reklamace, bezpecnost, overeni poskytovatelu.</span></div></div></section><form className="search-panel"><label>Jmeno<input placeholder="Jan Novak" /></label><label>Email<input placeholder="jan@email.cz" /></label><label>Zprava<textarea rows={5} placeholder="Napisete nam..." /></label><button className="button primary" type="button">Odeslat zpravu</button></form></main><Footer /></>
  );
}
