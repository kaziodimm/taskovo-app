import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/podminky-pro-poskytovatele";

export const metadata: Metadata = {
  title: "Podmínky pro taskery | Taskovo",
  description: "Pravidla pro nezávislé taskery na Taskovo: vlastní ceny, vlastní dostupnost, oprávnění, daně, kvalita služeb a recenze.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Podmínky pro taskery | Taskovo",
    description: "Taskeři na Taskovo působí jako nezávislí OSVČ nebo firmy, ne jako zaměstnanci platformy.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "article",
  },
};

const points = [
  { title: "Nezávislost", text: "Tasker si sám vybírá úkoly, nastavuje cenu, dostupnost a způsob provedení služby." },
  { title: "Oprávnění", text: "Tasker odpovídá za potřebná povolení, kvalifikaci, pojištění a dodržení právních povinností." },
  { title: "Daně", text: "Příjmy z úkolů a související daňové povinnosti řeší tasker samostatně jako OSVČ nebo firma." },
  { title: "Kvalita", text: "Recenze, stížnosti, dokončené úkoly a ověření ovlivňují důvěryhodnost profilu na platformě." },
];

export default function ProviderTermsPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="section-title">
          <p className="kicker">Legal</p>
          <h1 className="page-title">Podmínky pro taskery</h1>
          <p>Tasker vystupuje jako nezávislá osoba, OSVČ nebo firma. Taskovo není zaměstnavatel a neurčuje pracovní dobu ani způsob provedení služby.</p>
        </section>
        <div className="legal-grid">
          {points.map((point) => (
            <article className="legal-card" key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
