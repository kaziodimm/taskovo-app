import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TaskForm } from "@/components/TaskForm";

const pageUrl = "https://taskovo.cz/zadat-ukol";

export const metadata: Metadata = {
  title: "Zadat úkol | Taskovo",
  description: "Vytvořte poptávku na úklid, stěhování, montáž, doručení nebo jinou pomoc. Taskovo propojuje klienty s nezávislými taskery v Česku.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Zadat úkol | Taskovo",
    description: "Popište práci, přidejte fotky a vyberte si vhodnou nabídku od nezávislého taskera.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zadat úkol | Taskovo",
    description: "Rychlé zadání poptávky pro lokální taskery.",
  },
};

const steps = [
  { title: "Popište úkol", text: "Krátce napište, co je potřeba udělat, kde a kdy." },
  { title: "Přidejte fotky", text: "Fotky pomůžou taskerům lépe odhadnout cenu a čas." },
  { title: "Dostanete nabídky", text: "Tasker pošle cenu, zprávu a vy si vyberete vhodného člověka." },
  { title: "Dokončení potvrdíte", text: "Po práci potvrdíte hotovo a objednávka se uzavře." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Zadat úkol",
  url: pageUrl,
  description: metadata.description,
  isPartOf: { "@type": "WebSite", name: "Taskovo", url: "https://taskovo.cz" },
};

export default function CreateTaskPage() {
  return (
    <>
      <Header />
      <main className="page-shell split">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
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
