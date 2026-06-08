export function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="/">
        <span className="brand-mark">T</span>
        <span>Taskovo</span>
      </a>
      <nav className="site-nav" aria-label="Hlavní navigace">
        <a href="/#request">Zadat úkol</a>
        <a href="/tasks">Úkoly</a>
        <a href="/taskers">Pomocníci</a>
        <a href="/#safety">Bezpečnost</a>
      </nav>
      <a className="header-action" href="/#request">
        Začít
      </a>
    </header>
  );
}
