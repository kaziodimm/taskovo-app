import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskerForm } from "@/components/TaskerForm";

export default function TaskersPage() {
  return (
    <>
      <Header />
      <main className="page-shell split">
        <section className="section-title">
          <p className="kicker">Pomocníci</p>
          <h1 className="page-title">Registrace pomocníka</h1>
          <p>
            Vyplňte město, kategorie a kontakt. V pilotu budeme profily kontrolovat ručně, aby se
            služba stavěla na důvěře.
          </p>
        </section>
        <TaskerForm />
      </main>
      <Footer />
    </>
  );
}
