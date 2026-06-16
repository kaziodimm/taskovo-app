import type { Metadata } from "next";
import { registerTaskerAccount } from "@/app/auth-actions";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

const pageUrl = "https://taskovo.cz/registrace-poskytovatel";

export const metadata: Metadata = {
  title: "Registrace taskera | Taskovo",
  description: "Založte si ověřený účet taskera, získejte zákazníky a posílejte vlastní nabídky jako nezávislý OSVČ nebo firma.",
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
    description: "Vytvořte účet taskera a začněte získávat zákazníky přes český marketplace Taskovo.",
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
          <h1 className="page-title">Vytvořte účet a začněte získávat zákazníky</h1>
          <p>Taskovo pomáhá šikovným lidem, OSVČ a malým firmám najít lokální zakázky, posílat vlastní nabídky a budovat reputaci bez chaosu ve skupinách.</p>
          <div className="feature-list">
            <div><strong>1. Ověřený účet</strong><span>Jeden email může mít jen jeden účet. Po registraci potvrdíte email.</span></div>
            <div><strong>2. Profil taskera</strong><span>Doplníte město, služby, kontakt, bio a později profilovou fotku ke kontrole.</span></div>
            <div><strong>3. První nabídka</strong><span>Vyberete vhodný úkol, nastavíte vlastní cenu a klient se rozhodne samostatně.</span></div>
          </div>
          <p className="muted-copy">Taskovo je zprostředkovatelská platforma. Tasker není zaměstnancem Taskovo a služby poskytuje samostatně jako OSVČ nebo firma.</p>
        </section>
        <form className="tasker-card" action={registerTaskerAccount}>
          <div className="card-heading">
            <h2>Registrace taskera</h2>
            <p>Po potvrzení emailu vás Taskovo pošle do tasker dashboardu, kde dokončíte profil a najdete dostupné úkoly.</p>
          </div>
          <label>Jméno<input name="name" type="text" placeholder="Petra Svobodová" required /></label>
          <label>Email<input name="email" type="email" placeholder="tasker@email.cz" required /></label>
          <label>Heslo<input name="password" type="password" placeholder="min. 8 znaků" minLength={8} required /></label>
          <label>Město<input name="city" type="text" placeholder="Praha" required /></label>
          <label>Kategorie<input name="categories" type="text" placeholder="Doručení, montáž, stěhování" required /></label>
          <label>Kontakt<input name="contact" type="text" placeholder="+420 ... / Telegram / email" /></label>
          <label>Krátký profil<textarea name="bio" rows={4} placeholder="Co umíte, kdy pracujete a proč si vás má klient vybrat?" /></label>
          <div className="trust-strip" aria-label="Výhody tasker účtu">
            <span>Zakázky ve vašem okolí</span>
            <span>Vlastní ceny</span>
            <span>Reputace po dokončení</span>
          </div>
          <button className="button primary" type="submit">Vytvořit účet taskera</button>
          <p className="fine-print">Už máte účet? <a href="/prihlaseni?mode=login">Přihlaste se</a>.</p>
        </form>
      </main>
      <Footer />
    </>
  );
}
