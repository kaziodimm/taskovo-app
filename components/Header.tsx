import { BrandMark } from "@/components/BrandMark";

export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Taskovo domovska stranka">
        <BrandMark />
        <span className="brand-copy">
          <strong>Taskovo</strong>
          <small>Pomoc. Rychle. Spolehlive.</small>
        </span>
      </a>
      <nav className="site-nav" aria-label="Hlavni navigace">
        <a href="/#jak-to-funguje">Jak to funguje</a>
        <a href="/kategorie">Kategorie</a>
        <a href="/poskytovatele">Poskytovatele</a>
        <a href="/registrace-poskytovatel">Pro poskytovatele</a>
        <a href="/bezpecnost">Bezpecnost</a>
      </nav>
      <div className="header-actions">
        <a className="login-link" href="/dashboard">Prihlasit se</a>
        <a className="header-action" href="/zadat-ukol">Zadam ukol</a>
      </div>
    </header>
  );
}
