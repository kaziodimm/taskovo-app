import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { getOffers, getTasks } from "@/lib/data";

export default async function TasksPage() {
  const [tasks, offers] = await Promise.all([getTasks(), getOffers()]);

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title">
          <p className="kicker">Marketplace</p>
          <h1 className="page-title">Aktuální úkoly</h1>
          <p>Otevřené úkoly a nabídky pomocníků napříč pilotními městy.</p>
        </section>
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} offers={offers.filter((offer) => offer.task_id === task.id)} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
