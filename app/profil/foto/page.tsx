import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfilePhotoStatus } from "@/components/ProfilePhotoStatus";
import { ProfilePhotoUploadForm } from "@/components/ProfilePhotoUploadForm";
import { getTaskerProfileForUser } from "@/lib/data";
import { getClientProfileForUser } from "@/lib/profile-data";
import { createServerSupabaseClient } from "@/lib/supabase";

const errorCopy: Record<string, string> = {
  bad_file: "Vyberte fotku ve formátu JPG, PNG nebo WebP.",
  file_too_large: "Fotka je příliš velká. Maximální velikost je 5 MB.",
  config: "Nahrávání fotek není správně nakonfigurované.",
};

export default async function ProfilePhotoPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const isTasker = user.user_metadata?.role === "tasker";
  const profile = isTasker ? await getTaskerProfileForUser(user.id) : await getClientProfileForUser(user.id);
  const dashboardHref = isTasker ? "/poskytovatel/dashboard" : "/dashboard";

  return (
    <>
      <Header />
      <main className="page-shell auth-shell">
        <section className="auth-panel">
          <div className="section-heading-row">
            <div className="section-title">
              <p className="kicker">Profil</p>
              <h1 className="page-title">Fotka profilu</h1>
              <p>Fotka se veřejně zobrazí až po kontrole administrátorem. Nahrajte JPG, PNG nebo WebP do velikosti 5 MB.</p>
            </div>
            <a className="button secondary" href={`${dashboardHref}#profil`}>Zpět do účtu</a>
          </div>

          {params.updated === "photo_pending" ? <p className="alert-box">Fotka byla odeslána ke kontrole.</p> : null}
          {params.error ? <p className="alert-box">{errorCopy[params.error] || "Fotku se nepodařilo zpracovat."}</p> : null}

          <ProfilePhotoStatus
            avatarUrl={profile?.avatar_url}
            pendingAvatarUrl={profile?.pending_avatar_url}
            status={profile?.avatar_review_status}
            note={profile?.avatar_review_note}
            roleLabel={isTasker ? "taskera" : "klienta"}
          />

          <ProfilePhotoUploadForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
