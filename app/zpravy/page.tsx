import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function MessagesPage() {
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Zpravy</p><h1 className="page-title">Komunikace k ukolum</h1><p>Zde bude chat mezi klientem a poskytovatelem s vazbou na konkretni ukol, nabidku a platebni stav.</p></section><div className="dashboard-grid"><article className="dashboard-panel"><h3>Pred vyberem</h3><p>Dotazy k rozsahu, mistu a terminu.</p></article><article className="dashboard-panel"><h3>Po potvrzeni</h3><p>Bezpecne sdileni detailni adresy a instrukci.</p></article><article className="dashboard-panel"><h3>Historie</h3><p>Zaznam komunikace pro reklamace a podporu.</p></article></div></main><Footer /></>
  );
}
