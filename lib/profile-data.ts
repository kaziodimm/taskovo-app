import { unstable_noStore as noStore } from "next/cache";
import { createServiceSupabaseClient, hasSupabaseEnv } from "./supabase";
import type { ClientProfile } from "./types";

export async function getClientProfileForUser(authUserId: string): Promise<ClientProfile | null> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("client_profiles").select("*").eq("auth_user_id", authUserId).order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as ClientProfile | null;
}
