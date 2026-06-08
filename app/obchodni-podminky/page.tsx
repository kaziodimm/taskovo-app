import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function TermsPage() {
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Legal</p><h1 className="page-title">Obchodni podminky</h1><p>Pracovni verze pro produktovou strukturu. Pred ostrym spustenim musi text projit ceskym pravnikem.</p></section><div className="legal-grid"><article className="legal-card"><h3>Role platformy</h3><p>Taskovo zprostredkovava poptavky, nabidky, komunikaci a platby mezi klientem a nezavislym poskytovatelem.</p></article><article className="legal-card"><h3>Vyber poskytovatele</h3><p>Klient sam porovnava nabidky a sam rozhoduje, komu ukol pridelí.</p></article><article className="legal-card"><h3>Odpovednost za sluzbu</h3><p>Poskytovatel odpovida za kvalitu, opravneni, dane a splneni zakonnych povinnosti.</p></article><article className="legal-card"><h3>Spor a reklamace</h3><p>Platforma muze pomahat se sporem, ale neni automaticky dodavatelem konkretni sluzby.</p></article></div></main><Footer /></>
  );
}
