export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <a className="brand footer-brand" href="/">
          <span className="brand-mark">T</span>
          <span>Taskovo</span>
        </a>
        <p>Český marketplace pro úkoly, pomoc a malé služby v okolí.</p>
      </div>
      <div className="footer-links">
        <a href="/#request">Zadat úkol</a>
        <a href="/taskers">Pomocníci</a>
        <a href="/#safety">Bezpečnost</a>
        <a href="mailto:hello@taskovo.cz">hello@taskovo.cz</a>
      </div>
    </footer>
  );
}
