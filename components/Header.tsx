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

export async function Header() {
  const user = await getSignedInUser();
  const role = user?.user_metadata?.role;
  const accountName = user?.user_metadata?.name || user?.email || "Můj účet";
  const accountHref = dashboardHref(role, user?.email);

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
        <a href="/prihlaseni?mode=tasker">Chci být tasker</a>
        <a href="/bezpecnost">Bezpečnost</a>
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
          <a className="login-link" href="/prihlaseni?mode=login">Přihlásit se</a>
        )}
        <a className="header-action" href={role === "tasker" ? "/tasks" : "/zadat-ukol"}>{role === "tasker" ? "Najít úkol" : "Zadám úkol"}</a>
      </div>
    </header>
  );
}
