import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getOffers, getTaskers } from "@/lib/data";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import type { TaskerProfile } from "@/lib/types";
import styles from "../prehled/page.module.css";

type AdminTaskersSearchParams = Promise<{
  q?: string;
  verification?: string;
  sort?: string;
}>;

function normalize(value?: string | null) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function includesTerm(tasker: TaskerProfile, term: string) {
  if (!term) return true;
  const haystack = [
    tasker.name,
    tasker.email,
    tasker.city,
    tasker.categories,
    tasker.contact,
    tasker.bio,
  ].map((value) => normalize(String(value ?? ""))).join(" ");

  return haystack.includes(term);
}

function matchVerification(tasker: TaskerProfile, verification: string) {
  if (verification === "verified") return tasker.verified;
  if (verification === "unverified") return !tasker.verified;
  if (verification === "photo_pending") return Boolean(tasker.pending_avatar_url);
  if (verification === "photo_approved") return Boolean(tasker.avatar_url);
  return true;
}

function sortTaskers(taskers: TaskerProfile[], sort: string) {
  const sorted = [...taskers];
  if (sort === "name") return sorted.sort((a, b) => a.name.localeCompare(b.name, "cs"));
  if (sort === "city") return sorted.sort((a, b) => (a.city || "").localeCompare(b.city || "", "cs"));
  if (sort === "oldest") return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function date(value: string) {
  return new Date(value).toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function AdminTaskersPage({ searchParams }: { searchParams?: AdminTaskersSearchParams }) {
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const params = searchParams ? await searchParams : {};
  const q = params.q || "";
  const term = normalize(q);
  const verification = ["verified", "unverified", "photo_pending", "photo_approved"].includes(params.verification || "") ? params.verification || "all" : "all";
  const sort = ["newest", "oldest", "name", "city"].includes(params.sort || "") ? params.sort || "newest" : "newest";

  const [taskers, offers] = await Promise.all([getTaskers(), getOffers()]);
  const offersByTasker = new Map<string, number>();
  offers.forEach((offer) => {
    const key = offer.tasker_profile_id || offer.tasker_auth_user_id || offer.tasker_name;
    offersByTasker.set(key, (offersByTasker.get(key) || 0) + 1);
  });

  const filteredTaskers = sortTaskers(
    taskers.filter((tasker) => includesTerm(tasker, term) && matchVerification(tasker, verification)),
    sort,
  );
  const visibleTaskers = filteredTaskers.slice(0, 100);
  const hiddenCount = Math.max(filteredTaskers.length - visibleTaskers.length, 0);

  const verifiedCount = taskers.filter((tasker) => tasker.verified).length;
  const unverifiedCount = taskers.filter((tasker) => !tasker.verified).length;
  const pendingPhotoCount = taskers.filter((tasker) => tasker.pending_avatar_url).length;
  const withPhotoCount = taskers.filter((tasker) => tasker.avatar_url).length;

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-hero">
          <div>
            <p className="kicker">Admin · taskeři</p>
            <h1 className="page-title">Správa taskerů</h1>
            <p className="hero-lead">Samostatný seznam pro kontrolu profilů, ověření, fotek a pracovních údajů taskerů.</p>
          </div>
          <div className="page-hero-card"><strong>{taskers.length}</strong><p>taskerů celkem</p></div>
        </section>

        <form className={styles.filterPanel} action="/admin/taskeri">
          <div className={styles.filterGrid}>
            <label>Hledat
              <input name="q" type="search" defaultValue={q} placeholder="jméno, email, město, kategorie..." />
            </label>
            <label>Kontrola
              <select name="verification" defaultValue={verification}>
                <option value="all">Všichni taskeři</option>
                <option value="verified">Ověření</option>
                <option value="unverified">Neověření</option>
                <option value="photo_pending">Fotka ke kontrole</option>
                <option value="photo_approved">Schválená fotka</option>
              </select>
            </label>
            <label>Řazení
              <select name="sort" defaultValue={sort}>
                <option value="newest">Nejnovější</option>
                <option value="oldest">Nejstarší</option>
                <option value="name">Jméno A-Z</option>
                <option value="city">Město A-Z</option>
              </select>
            </label>
            <div className={styles.filterActions}>
              <button className="button primary" type="submit">Filtrovat</button>
              <a className="button secondary" href="/admin/taskeri">Vyčistit</a>
            </div>
          </div>
          <div className={styles.resultTabs} aria-label="Rychlé odkazy taskerů">
            <a href="/admin/prehled">Přehled</a>
            <a href="/admin/objednavky">Objednávky</a>
            <a href="/admin">Operační centrum</a>
          </div>
        </form>

        <section className={styles.summaryGrid} aria-label="Souhrn taskerů">
          <article className={styles.summaryCard}><span>Ověření</span><strong>{verifiedCount}</strong><p>Taskeři se zvýrazněným důvěryhodným statusem.</p></article>
          <article className={styles.summaryCard}><span>Ke kontrole</span><strong>{unverifiedCount}</strong><p>Profily čekající na ruční ověření.</p></article>
          <article className={styles.summaryCard}><span>Fotky</span><strong>{pendingPhotoCount}</strong><p>Profilové fotky čekající na moderaci.</p></article>
          <article className={styles.summaryCard}><span>S fotkou</span><strong>{withPhotoCount}</strong><p>Profily s již schválenou fotkou.</p></article>
        </section>

        <section className={styles.resultSection}>
          <div className={styles.sectionHeader}>
            <div><h2>Výsledky</h2><p>Zobrazuje se maximálně 100 taskerů, aby stránka zůstala rychlá.</p></div>
            <span className={styles.countPill}>{filteredTaskers.length} výsledků</span>
          </div>
          <div className={styles.resultList}>
            {visibleTaskers.length ? visibleTaskers.map((tasker) => {
              const offerCount = offersByTasker.get(tasker.id) || offersByTasker.get(tasker.auth_user_id || "") || offersByTasker.get(tasker.name) || 0;
              return (
                <article className={styles.resultRow} key={tasker.id}>
                  <div className={styles.resultMain}>
                    <strong>{tasker.name}</strong>
                    <p>{tasker.categories || "kategorie neuvedeny"} · registrace {date(tasker.created_at)}</p>
                  </div>
                  <div className={styles.resultMeta}>
                    <strong>{tasker.email || "email neuveden"}</strong>
                    <p>{tasker.city || "město neuvedeno"} · {tasker.contact || "kontakt neuveden"}</p>
                  </div>
                  <div className={styles.rowBadges}>
                    <span className={tasker.verified ? styles.successPill : styles.warningPill}>{tasker.verified ? "ověřen" : "čeká"}</span>
                    {tasker.pending_avatar_url ? <span className={styles.warningPill}>fotka ke kontrole</span> : null}
                    {tasker.avatar_url ? <span className={styles.statusPill}>fotka</span> : null}
                    <span className={styles.statusPill}>{offerCount} nabídek</span>
                  </div>
                  <a className="button secondary" href={`/admin/taskers/${tasker.id}`}>Detail</a>
                </article>
              );
            }) : (
              <div className={styles.emptyState}><strong>Žádní taskeři</strong><p>Zkuste změnit hledání, stav kontroly nebo řazení.</p></div>
            )}
          </div>
          {hiddenCount ? <p className={styles.emptyState}><strong>Další výsledky jsou skryté</strong><span>Zúžte hledání nebo filtr. Skryto: {hiddenCount} taskerů.</span></p> : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
