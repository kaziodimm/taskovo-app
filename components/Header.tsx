import { logoutAccount } from "@/app/actions";
import { BrandMark } from "@/components/BrandMark";
import { isAdminEmail } from "@/lib/admin-auth";
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

function dashboardHref(role: unknown, email?: string | null) {
  if (isAdminEmail(email)) return "/admin";
  return role === "tasker" ? "/poskytovatel/dashboard" : "/dashboard";
}

const navDetailsStyle = { borderTop: 0, padding: 0, position: "relative" as const };
const navSummaryStyle = { listStyle: "none", cursor: "pointer", fontWeight: 780 };
const navDropdownStyle = {
  position: "absolute" as const,
  top: "calc(100% + 14px)",
  left: 0,
  zIndex: 40,
  display: "grid",
  gap: 8,
  minWidth: 220,
  padding: 12,
  color: "var(--navy)",
  background: "white",
  border: "1px solid var(--line)",
  borderRadius: 8,
  boxShadow: "0 18px 44px rgba(13,27,42,.14)",
};

export async function Header() {
  const user = await getSignedInUser();
  const role = user?.user_metadata?.role;
  const isAdmin = isAdminEmail(user?.email);
  const accountName = user?.user_metadata?.name || user?.email || "Můj účet";
  const accountHref = dashboardHref(role, user?.email);
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
        <details style={navDetailsStyle}>
          <summary style={navSummaryStyle}>Kategorie</summary>
          <div style={{ ...navDropdownStyle, minWidth: 260 }}>
            <a href="/kategorie/uklid">Úklid</a>
            <a href="/kategorie/stehovani">Stěhování</a>
            <a href="/kategorie/montaz-nabytku">Montáž nábytku</a>
            <a href="/kategorie/doruceni">Doručení</a>
            <a href="/kategorie/zahrada">Zahrada</a>
            <a href="/kategorie/opravy">Opravy</a>
            <a href="/kategorie">Všechny kategorie</a>
            <span style={{ height: 1, background: "var(--line)", margin: "4px 0" }} />
            <a href="/uklid-praha">Úklid Praha</a>
            <a href="/stehovani-praha">Stěhování Praha</a>
            <a href="/montaz-nabytku-praha">Montáž nábytku Praha</a>
            <a href="/doruceni-zasilek-praha">Doručení zásilek Praha</a>
            <a href="/pomoc-na-zahrade-praha">Pomoc na zahradě Praha</a>
          </div>
        </details>
        <details style={navDetailsStyle}>
          <summary style={navSummaryStyle}>Jak to funguje</summary>
          <div style={navDropdownStyle}>
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
        {user && role !== "tasker" && !isAdmin ? <a href="/dashboard">Moje objednávky</a> : null}
        {user ? <a href="/profil/foto">Foto profilu</a> : null}
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
