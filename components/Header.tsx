import { logoutAccount } from "@/app/actions";
import { BrandMark } from "@/components/BrandMark";
import { getAccountContext } from "@/lib/account";
import { createServerSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

async function getSignedInUser() {
  if (!hasSupabaseEnv()) return null;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

export async function Header() {
  const user = await getSignedInUser();
  const account = user ? await getAccountContext(user) : null;
  const role = account?.role;
  const isAdmin = account?.isAdmin ?? false;
  const accountName = account?.displayName || "Můj účet";
  const accountHref = account?.dashboardHref || "/dashboard";
  const primaryMarketplaceHref = role === "tasker" ? "/tasks" : "/poskytovatele";
  const primaryMarketplaceLabel = role === "tasker" ? "Úkoly" : "Taskeři";

  return (
    <header className="site-header">
      <a className="brand" href="/" aria-label="Domovská stránka Taskovo">
        <BrandMark />
        <span className="brand-copy">
          <strong>Taskovo</strong>
          <small>Pomoc. Rychle. Spolehlivě.</small>
        </span>
      </a>
      <nav className="site-nav nav-menu" aria-label="Hlavní navigace">
        <details className="nav-dropdown">
          <summary className="nav-summary">Kategorie</summary>
          <div className="nav-dropdown-panel nav-dropdown-panel-wide">
            <a href="/kategorie/uklid">Úklid</a>
            <a href="/kategorie/stehovani">Stěhování</a>
            <a href="/kategorie/montaz-nabytku">Montáž nábytku</a>
            <a href="/kategorie/doruceni">Doručení</a>
            <a href="/kategorie/zahrada">Zahrada</a>
            <a href="/kategorie/opravy">Opravy</a>
            <a href="/kategorie">Všechny kategorie</a>
            <span className="nav-dropdown-separator" aria-hidden="true" />
            <a href="/uklid-praha">Úklid Praha</a>
            <a href="/stehovani-praha">Stěhování Praha</a>
            <a href="/montaz-nabytku-praha">Montáž nábytku Praha</a>
            <a href="/doruceni-zasilek-praha">Doručení zásilek Praha</a>
            <a href="/pomoc-na-zahrade-praha">Pomoc na zahradě Praha</a>
          </div>
        </details>
        <details className="nav-dropdown">
          <summary className="nav-summary">Jak to funguje</summary>
          <div className="nav-dropdown-panel">
            <a href="/jak-to-funguje">Postup platformy</a>
            <a href="/pro-zakazniky">Pro zákazníky</a>
            <a href="/pro-taskery">Pro taskery</a>
            <a href="/platby">Platby</a>
            <a href="/vyplaty">Výplaty</a>
          </div>
        </details>
        <a href="/pro-zakazniky">Pro zákazníky</a>
        <a href="/pro-taskery">Pro taskery</a>
        {user ? <a href={primaryMarketplaceHref}>{primaryMarketplaceLabel}</a> : <a href="/poskytovatele">Taskeři</a>}
        {role === "tasker" ? <a href="/poskytovatel/dashboard">Moje práce</a> : null}
        {user && role === "client" ? <a href="/dashboard">Moje objednávky</a> : null}
        {user && !isAdmin ? <a href="/profil/foto">Foto profilu</a> : null}
        <a href="/bezpecnost">Bezpečnost</a>
        <a href="/faq">FAQ</a>
      </nav>
      <div className="header-actions">
        {user ? (
          <>
            <a className="login-link" href={accountHref} aria-label="Otevřít můj účet">{accountName}</a>
            <form action={logoutAccount}>
              <button className="button secondary" type="submit">Odhlásit</button>
            </form>
          </>
        ) : (
          <a className="login-link" href="/prihlaseni?mode=login">Přihlášení</a>
        )}
        <a className="header-action" href={role === "tasker" ? "/tasks" : "/zadat-ukol"}>{role === "tasker" ? "Najít úkol" : "Zadat úkol"}</a>
      </div>
    </header>
  );
}
