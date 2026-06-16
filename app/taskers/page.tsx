import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskerForm } from "@/components/TaskerForm";

export const metadata: Metadata = {
  title: "Vytvořit tasker profil | Taskovo",
  description: "Registrace taskera na Taskovo pro šikovné lidi, OSVČ a malé firmy, které chtějí získávat zákazníky a budovat reputaci.",
  alternates: { canonical: "/taskers" },
  robots: { index: false, follow: true },
};

export default function TaskersPage() {
  return (
    <>
      <Header />
      <main className="page-shell split">
        <section className="section-title">
          <p className="kicker">Tasker profil</p>
          <h1 className="page-title">Začněte získávat zákazníky přes Taskovo</h1>
          <p>
            Vyplňte město, služby, kontakt a krátké představení. Profil pomáhá klientům pochopit,
            co umíte, kde pracujete a proč si mohou vybrat právě vás.
          </p>
          <div className="trust-strip" aria-label="Principy Taskovo">
            <span>Vlastní ceny a nabídky</span>
            <span>Zakázky ve vašem okolí</span>
            <span>Budujete si reputaci</span>
          </div>
          <p className="muted-copy">
            Taskovo je zprostředkovatelská platforma. Tasker není zaměstnancem Taskovo a služby
            poskytuje samostatně jako OSVČ nebo firma.
          </p>
        </section>
        <TaskerForm />
      </main>
      <Footer />
    </>
  );
}
