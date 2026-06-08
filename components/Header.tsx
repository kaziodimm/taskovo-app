import { BrandMark } from "@/components/BrandMark";

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Domovská stránka Taskovo">
        <BrandMark />
        <span className="brand-copy">
          <strong>Taskovo</strong>
          <small>Pomoc. Rychle. Spolehlivě.</small>
        </span>
      </a>
      <nav className="site-nav" aria-label="Hlavní navigace">
        <a href="/#jak-to-funguje">Jak to funguje</a>
        <a href="/kategorie">Kategorie</a>
        <a href="/poskytovatele">Taskeři</a>
        <a href="/registrace-poskytovatel">Chci být tasker</a>
        <a href="/bezpecnost">Bezpečnost</a>
      </nav>
      <div className="header-actions">
        <a className="login-link" href="/prihlaseni">Přihlásit se</a>
        <a className="header-action" href="/zadat-ukol">Zadám úkol</a>
      </div>
    </header>
  );
}
