import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function PaymentsPage() {
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Platby</p><h1 className="page-title">Transparentni platebni tok</h1><p>Produkcni verze muze pouzit Stripe: klient zaplati predem, castka se podrzi do dokonceni a pote se vyplati poskytovateli po odecteni provize.</p></section><div className="workflow-grid"><article><span>01</span><h3>Rezervace</h3><p>Klient potvrdi vybranou nabidku a platbu.</p></article><article><span>02</span><h3>Dokonceni</h3><p>Poskytovatel oznaci praci jako hotovou.</p></article><article><span>03</span><h3>Potvrzeni</h3><p>Klient potvrdi nebo otevre spor.</p></article><article><span>04</span><h3>Vyplata</h3><p>System spusti vyplatu poskytovateli.</p></article></div></main><Footer /></>
  );
}
