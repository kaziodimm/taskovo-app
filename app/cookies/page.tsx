import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function CookiesPage() {
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Cookies</p><h1 className="page-title">Nastaveni cookies</h1><p>Zakladni stranka pro budoucí cookie banner a spravu souhlasu. Technicke cookies budou nutne pro prihlaseni a bezpecnost.</p></section><div className="legal-grid"><article className="legal-card"><h3>Technicke</h3><p>Nutne pro fungovani uctu, formularu a zabezpeceni.</p></article><article className="legal-card"><h3>Analyticke</h3><p>Pomohou pochopit poptavku, konverze a problemy v toku zadani.</p></article><article className="legal-card"><h3>Marketingove</h3><p>Az po souhlasu a po spusteni kampani.</p></article><article className="legal-card"><h3>Sprava souhlasu</h3><p>Uzivatel musi mit moznost souhlas upravit nebo odvolat.</p></article></div></main><Footer /></>
  );
}
