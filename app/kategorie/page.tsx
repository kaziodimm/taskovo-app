import type { Metadata } from "next";
import { CategoryCard } from "@/components/CategoryCard";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { marketplaceCategories } from "@/lib/marketplace-data";

export const metadata: Metadata = {
  title: "Kategorie sluzeb | Taskovo",
  description:
    "Prehled kategorii na Taskovo: uklid, stehovani, montaz nabytku, doruceni, zahrada, opravy a lokalni pomoc v Cesku.",
  alternates: { canonical: "/kategorie" },
  openGraph: {
    title: "Kategorie sluzeb | Taskovo",
    description: "Vyberte typ pomoci, zadejte ukol a porovnejte nabidky nezavislych taskeru v okoli.",
    url: "https://taskovo-app.vercel.app/kategorie",
    siteName: "Taskovo",
    type: "website",
  },
};

const seoLandingLinks = [
  { title: "Uklid Praha", href: "/sluzby/uklid-praha", text: "Jednorazovy i pravidelny uklid bytu, domu nebo kancelare." },
  { title: "Stehovani Praha", href: "/sluzby/stehovani-praha", text: "Mensi stehovani, odnos veci, krabice a prevoz po meste." },
  { title: "Montaz nabytku Praha", href: "/sluzby/montaz-nabytku-praha", text: "Skrine, postele, police, stoly a drobne domaci instalace." },
  { title: "Doruceni zasilek Praha", href: "/sluzby/doruceni-zasilek-praha", text: "Vyzvednuti baliku, nakupu, dokumentu nebo leku." },
  { title: "Pomoc na zahrade Praha", href: "/sluzby/pomoc-na-zahrade-praha", text: "Sekani travy, uklid terasy, hrabani listi a sezonni prace." },
];

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Kategorie</p>
            <h1 className="page-title">Vyberte typ pomoci</h1>
            <p className="hero-lead">
              Taskovo zacina u kategorii s jasnou poptavkou, rychlym porovnanim nabidek a lokalni dostupnosti napric Ceskem.
            </p>
          </div>
          <div className="page-hero-card">
            <strong>{marketplaceCategories.length} kategorii pro pilot</strong>
            <p>Uklid, stehovani, montaz, doruceni, zahrada, opravy a dalsi rozsireni podle realne poptavky.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 26 }}>
          <div className="section-title">
            <p className="kicker">Hlavni kategorie</p>
            <h2>Sluzby, ktere lide hledaji nejcasteji</h2>
          </div>
          <div className="category-grid">
            {marketplaceCategories.map((category) => <CategoryCard key={category.slug} category={category} />)}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <p className="kicker">Praha</p>
            <h2>Prvni SEO stranky podle poptavky</h2>
            <p>
              Tyto stranky pomahaji vyhledavacum pochopit konkretni sluzby v konkretnim meste. Pozdeji stejnou strukturu rozsirim pro Brno, Ostravu, Plzen a mensi mesta.
            </p>
          </div>
          <div className="legal-grid">
            {seoLandingLinks.map((item) => (
              <a className="legal-card" href={item.href} key={item.href}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="section split">
          <div>
            <p className="kicker">Role platformy</p>
            <h2>Taskovo propojuje, klient si vybira</h2>
            <p className="hero-lead">
              Taskovo je zprostredkovatelska platforma. Taskeri jsou nezavisle osoby, OSVC nebo firmy. Taskovo neni zamestnavatel taskeru a sluzby primo neposkytuje.
            </p>
          </div>
          <div className="feature-list">
            <div><strong>Lepsi orientace</strong><span>Kazda kategorie ma vlastni detail, typicke ukoly, ceny a FAQ.</span></div>
            <div><strong>Skalovani podle mest</strong><span>SEO struktura muze rust podle realne poptavky v Cesku.</span></div>
            <div><strong>Marketplace logika</strong><span>Zakaznik porovnava nabidky, tasker sam rozhoduje, na ktere ukoly reaguje.</span></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
