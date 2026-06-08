import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function PrivacyPage() {
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Soukromi</p><h1 className="page-title">Ochrana osobnich udaju</h1><p>Pracovni struktura GDPR stranky: kontaktni udaje, profily, zpravy, platby, recenze, logy a prava uzivatelu.</p></section><div className="legal-grid"><article className="legal-card"><h3>Ucet a kontakt</h3><p>Jmeno, email, telefon, mesto a komunikace.</p></article><article className="legal-card"><h3>Ukoly a nabidky</h3><p>Popisy ukolu, ceny, stav poptavky a historie.</p></article><article className="legal-card"><h3>Platby</h3><p>Platebni data se budou zpracovavat pres Stripe nebo podobneho poskytovatele.</p></article><article className="legal-card"><h3>Prava uzivatele</h3><p>Pristup, oprava, vymaz, omezeni a namitka proti zpracovani.</p></article></div></main><Footer /></>
  );
}
