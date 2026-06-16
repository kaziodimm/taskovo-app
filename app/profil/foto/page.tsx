import { redirect } from "next/navigation";
import { getAccountContext } from "@/lib/account";
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function ProfilePhotoPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const account = await getAccountContext(user);

  if (account.role === "admin") redirect("/admin");
  if (account.role === "tasker") redirect("/poskytovatel/dashboard#profil");
  redirect("/dashboard#profil");
}
