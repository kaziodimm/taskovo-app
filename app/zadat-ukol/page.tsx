import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";

const steps = [
  { title: "Popište úkol", text: "Krátce napište, co je potřeba udělat, kde a kdy." },
  { title: "Přidejte fotky", text: "Fotky pomůžou taskerům lépe odhadnout cenu a čas." },
  { title: "Dostanete nabídky", text: "Tasker pošle cenu, zprávu a vy si vyberete vhodného člověka." },
  { title: "Dokončení potvrdíte", text: "Po práci potvrdíte hotovo a objednávka se uzavře." },
];

export default function CreateTaskPage() {
  return (
    <>
      <Header />
      <main className="page-shell split">
        <section className="section-title">
          <p className="kicker">Zadat úkol</p>
          <h1 className="page-title">Popište práci, kterou chcete předat</h1>
          <p>Vytvořte poptávku pro lokální taskery. Čím přesnější popis a fotky přidáte, tím snáz dostanete použitelnou nabídku.</p>
          <div className="feature-list">
            {steps.map((step, index) => <div key={step.title}><strong>{index + 1}. {step.title}</strong><span>{step.text}</span></div>)}
          </div>
        </section>
        <TaskForm />
      </main>
      <Footer />
    </>
  );
}
