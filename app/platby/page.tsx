import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const stripePaymentLink = process.env.NEXT_PUBLIC_STRIPE_TEST_PAYMENT_LINK;

export default function PaymentsPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Platby</p>
            <h1 className="page-title">Testovací platby přes Stripe</h1>
            <p className="hero-lead">Pro první test použijeme Stripe Payment Link. Finální marketplace model bude později řešit rezervaci platby, potvrzení dokončení, spory a výplaty taskerům přes Stripe Connect.</p>
          </div>
          <div className="payment-test-card">
            <strong>Stripe test</strong>
            {stripePaymentLink ? <a className="button primary" href={stripePaymentLink}>Otevřít testovací platbu</a> : <p>Vložte do Vercel env proměnnou NEXT_PUBLIC_STRIPE_TEST_PAYMENT_LINK.</p>}
            <code>NEXT_PUBLIC_STRIPE_TEST_PAYMENT_LINK=https://buy.stripe.com/test_...</code>
          </div>
        </section>
        <div className="workflow-grid">
          <article><span>01</span><h3>Rezervace</h3><p>Klient potvrdí vybranou nabídku a platbu.</p></article>
          <article><span>02</span><h3>Dokončení</h3><p>Tasker označí práci jako hotovou.</p></article>
          <article><span>03</span><h3>Potvrzení</h3><p>Klient potvrdí dokončení, nebo otevře spor.</p></article>
          <article><span>04</span><h3>Výplata</h3><p>Systém spustí výplatu taskerovi po odečtení provize.</p></article>
        </div>
      </main>
      <Footer />
    </>
  );
}
