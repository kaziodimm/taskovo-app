import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function PayoutsPage() {
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Vyplaty</p><h1 className="page-title">Vyplaty pro poskytovatele</h1><p>Stranka pro budoucí Stripe Connect onboarding, overeni identity, historii vyplat, danove dokumenty a stav zadrzenych plateb.</p></section><div className="dashboard-grid"><article className="dashboard-panel"><h3>Overeni uctu</h3><p>Bankovni ucet, identita a typ podnikani.</p></article><article className="dashboard-panel"><h3>Historie</h3><p>Vyplaty podle ukolu, provize a datum.</p></article><article className="dashboard-panel"><h3>Danove podklady</h3><p>Exporty pro OSVC a firmy.</p></article></div></main><Footer /></>
  );
}
