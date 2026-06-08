import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";

const steps = ["Vyberete kategorii", "Popisete misto a termin", "Dostanete nabidky", "Potvrdite poskytovatele"];

export default function CreateTaskPage() {
  return (
    <>
      <Header />
      <main className="page-shell split">
        <section className="section-title">
          <p className="kicker">Zadat ukol</p>
          <h1 className="page-title">Popiste praci, kterou chcete predat</h1>
          <p>Formular je prvni krok budouciho wizardu. Uz ted uklada realne poptavky do Supabase a presmeruje klienta na seznam ukolu.</p>
          <div className="feature-list">
            {steps.map((step, index) => <div key={step}><strong>{index + 1}. {step}</strong><span>Jasny tok bez zbytecne registrace na zacatku.</span></div>)}
          </div>
        </section>
        <TaskForm />
      </main>
      <Footer />
    </>
  );
}
