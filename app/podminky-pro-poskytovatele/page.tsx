import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ProviderTermsPage() {
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Legal</p><h1 className="page-title">Podminky pro poskytovatele</h1><p>Poskytovatel vystupuje jako nezavisla osoba, OSVC nebo firma. Taskovo neni zamestnavatel a neurcuje pracovni dobu ani zpusob provedeni sluzby.</p></section><div className="legal-grid"><article className="legal-card"><h3>Nezavislost</h3><p>Poskytovatel si vybira ukoly, cenu a dostupnost.</p></article><article className="legal-card"><h3>Opravneni</h3><p>Poskytovatel odpovida za potrebna povoleni a profesionalni kvalifikaci.</p></article><article className="legal-card"><h3>Dane</h3><p>Prijmy a danove povinnosti resi poskytovatel sam.</p></article><article className="legal-card"><h3>Kvalita</h3><p>Recenze, stiznosti a historie ovlivnuji viditelnost profilu.</p></article></div></main><Footer /></>
  );
}
