import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskCard } from "@/components/TaskCard";
import { getOffers, getTasks } from "@/lib/data";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [tasks, offers] = await Promise.all([getTasks(), getOffers()]);
  const task = tasks.find((item) => item.id === id);
  if (!task) notFound();
  const taskOffers = offers.filter((offer) => offer.task_id === task.id);

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div><p className="kicker">Detail ukolu</p><h1 className="page-title">{task.title}</h1><p className="hero-lead">{task.description}</p></div>
          <div className="page-hero-card"><strong>{task.budget_czk.toLocaleString("cs-CZ")} Kc</strong><p>{task.city} · {task.desired_time} · {task.status}</p></div>
        </section>
        <TaskCard task={task} offers={taskOffers} />
      </main>
      <Footer />
    </>
  );
}
