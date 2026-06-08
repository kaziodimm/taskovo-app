import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function SafetyPage() {
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Bezpecnost</p><h1 className="page-title">Duvěra je hlavni produktova funkce</h1><p>Taskovo musi kombinovat overeni, recenze, jasne ceny, moderaci rizikovych ukolu a pravni oddeleni platformy od poskytovatelu.</p></section><div className="trust-grid"><article><span className="trust-icon">ID</span><h3>Identita</h3><p>Telefon, email, profil, pozdeji doklady a IČO.</p></article><article><span className="trust-icon">PAY</span><h3>Platby</h3><p>Transparentni cena a potvrzeni dokonceni pred vyplatou.</p></article><article><span className="trust-icon">REP</span><h3>Reportovani</h3><p>Klient i poskytovatel mohou nahlasit problem, spor nebo nevhodny ukol.</p></article></div></main><Footer /></>
  );
}
