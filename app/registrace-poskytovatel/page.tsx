import type { Metadata } from "next";
import { registerTaskerAccount } from "@/app/actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/registrace-poskytovatel";

export const metadata: Metadata = {
  title: "Registrace taskera | Taskovo",
  description: "Založte si profil taskera a nabízejte služby jako nezávislý OSVČ nebo firma. Vy rozhodujete, na které úkoly odpovíte.",
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Registrace taskera | Taskovo",
    description: "Taskovo propojuje klienty s nezávislými taskery. Registrace profilu pro úklid, montáž, doručení, zahradu a další služby.",
    url: pageUrl,
    siteName: "Taskovo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Registrace taskera | Taskovo",
    description: "Nabízejte služby přes český marketplace Taskovo.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RegisterAction",
  name: "Registrace taskera na Taskovo",
  target: pageUrl,
  object: { "@type": "Service", name: "Marketplace pro lokální služby" },
};

export default function ProviderRegistrationPage() {
  return (
    <>
      <Header />
      <main className="page-shell split">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <section className="section-title">
          <p className="kicker">Chci být tasker</p>
          <h1 className="page-title">Nabízejte služby jako nezávislý tasker</h1>
          <p>Taskovo je marketplace. Tasker není zaměstnanec Taskovo, sám odpovídá za oprávnění, daně, kvalitu služby a komunikaci s klientem.</p>
          <div className="feature-list">
            <div><strong>Účet a profil</strong><span>Email, heslo, město, kategorie a kontakt.</span></div>
            <div><strong>Vlastní nabídky</strong><span>Vy rozhodujete, na který úkol odpovíte a za jakou cenu.</span></div>
            <div><strong>Recenze a historie</strong><span>Dokončené úkoly budou budovat reputaci.</span></div>
          </div>
        </section>
        <form className="tasker-card" action={registerTaskerAccount}>
          <label>Jméno<input name="name" type="text" placeholder="Petra Svobodová" required /></label>
          <label>Email<input name="email" type="email" placeholder="tasker@email.cz" required /></label>
          <label>Heslo<input name="password" type="password" placeholder="min. 8 znaků" minLength={8} required /></label>
          <label>Město<input name="city" type="text" placeholder="Praha" required /></label>
          <label>Kategorie<input name="categories" type="text" placeholder="Doručení, montáž, stěhování" required /></label>
          <label>Kontakt<input name="contact" type="text" placeholder="+420 ... / Telegram / email" /></label>
          <label>Krátký profil<textarea name="bio" rows={4} placeholder="Mám auto, večer volno a umím montovat nábytek." /></label>
          <button className="button primary" type="submit">Vytvořit účet taskera</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
