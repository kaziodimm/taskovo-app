import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default async function PaymentDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params;
  return (
    <><Header /><main className="page-shell"><section className="section-title"><p className="kicker">Platba</p><h1 className="page-title">Platba za ukol</h1><p>Platebni detail pro ukol {taskId}. Zde bude Stripe checkout, stav rezervace platby a potvrzeni dokonceni.</p></section><a className="button primary" href="/platby">Zpet na platby</a></main><Footer /></>
  );
}
