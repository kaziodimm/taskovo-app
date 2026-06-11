import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import type { SeoLandingPage as SeoLandingPageData } from "@/lib/seo-landing-pages";

function faqSchema(page: SeoLandingPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function serviceSchema(page: SeoLandingPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    serviceType: page.category,
    areaServed: page.city,
    provider: {
      "@type": "Organization",
      name: "Taskovo",
      url: "https://taskovo.cz",
    },
    description: page.lead,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "CZK",
      availability: "https://schema.org/InStock",
    },
  };
}

export function SeoLandingPage({ page }: { page: SeoLandingPageData }) {
  return (
    <>
      <Header />
      <main className="page-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema(page)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(page)) }} />

        <section className="page-hero">
          <div>
            <p className="kicker">{page.city} marketplace</p>
            <h1 className="page-title">{page.h1}</h1>
            <p className="hero-lead">{page.lead}</p>
            <div className="hero-actions">
              <a className="button primary" href="/zadat-ukol">{page.clientCta}</a>
              <a className="button secondary" href="/prihlaseni?mode=tasker">{page.taskerCta}</a>
            </div>
          </div>
          <aside className="page-hero-card">
            <p>{page.category}</p>
            <strong>{page.averageBudget}</strong>
            <p>Orientacni rozpocet podle rozsahu ukolu. Konecna cena je na dohode klienta a taskera.</p>
          </aside>
        </section>

        <section className="trust-grid" aria-label="Dulezite informace">
          <article><span className="trust-icon">01</span><h3>Taskovo je prostrednik</h3><p>Platforma propojuje klienty a taskery. Taskovo praci primo neposkytuje.</p></article>
          <article><span className="trust-icon">02</span><h3>Tasker je nezavisly</h3><p>Taskeri jsou samostatni OSVC, firmy nebo nezavisli poskytovatele sluzeb.</p></article>
          <article><span className="trust-icon">03</span><h3>Vyber je na klientovi</h3><p>Klient porovna nabidky, profil, cenu a zpravu a rozhoduje samostatne.</p></article>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Typicke ukoly</p>
            <h2>Co muzete zadat</h2>
            <p>Stranka je postavena pro konkretni poptavky v Praze, ne jako obecny katalog bez kontextu.</p>
          </div>
          <div className="category-grid">
            {page.examples.map((example) => <article className="category-card" key={example}><span className="category-icon">T</span><div><strong>{example}</strong><small>{page.city} · {page.category}</small></div><em>Zadat podobny ukol</em></article>)}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <p className="kicker">Jak to funguje</p>
            <h2>Jednoduchy postup od zadani po vyber</h2>
          </div>
          <div className="workflow-grid">
            {page.steps.map((step, index) => <article key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}
            <article><span>04</span><h3>Dokonceni a recenze</h3><p>Po ukolu se pripravi prostor pro potvrzeni, platby a recenzi v dalsi fazi pilotu.</p></article>
          </div>
        </section>

        <section className="section split">
          <div className="section-title">
            <p className="kicker">Lokalita</p>
            <h2>Kde v Praze muze mit poptavka smysl</h2>
            <p>Dostupnost se bude v pilotu ridit tim, kolik taskeru v dane casti mesta aktivne prijima ukoly.</p>
          </div>
          <div className="admin-grid">
            {page.districts.map((district) => <article className="admin-item" key={district}><strong>{district}</strong><p>{page.category} · {page.responseTime}</p></article>)}
          </div>
        </section>

        <section className="section">
          <div className="section-title">
            <p className="kicker">Duvěra</p>
            <h2>Co hlidame v marketplace procesu</h2>
          </div>
          <div className="trust-grid">
            {page.trust.map((item) => <article key={item}><span className="trust-icon">✓</span><h3>{item}</h3><p>Proces budujeme tak, aby byl prehledny pro klienta, taskera i administratora.</p></article>)}
          </div>
        </section>

        <section className="section faq-section">
          <div className="section-title">
            <p className="kicker">FAQ</p>
            <h2>Caste otazky</h2>
          </div>
          <div className="faq-list">
            {page.faq.map((item) => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
          </div>
        </section>

        <section className="section dark-band">
          <div className="section-title">
            <p className="kicker">Taskovo pilot</p>
            <h2>Chceme nahradit chaos ve skupinach jednou jasnou platformou</h2>
            <p>Nezamestnavame taskery a nejsme primy poskytovatel sluzby. Stavime misto, kde jde zadat ukol, porovnat nabidky a drzet domluvu pohromade.</p>
          </div>
          <div className="hero-actions"><a className="button primary" href="/zadat-ukol">Zadat ukol</a><a className="button secondary" href="/pro-taskery">Chci byt tasker</a></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
