import type { User } from "@supabase/supabase-js";
import { isAdminEmail } from "@/lib/admin-auth";
import { createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type { ClientProfile, TaskerProfile } from "@/lib/types";

export type AccountRole = "admin" | "client" | "tasker" | "unknown";

export type AccountContext = {
  user: User;
  role: AccountRole;
  displayName: string;
  dashboardHref: string;
  isAdmin: boolean;
  clientProfile: ClientProfile | null;
  taskerProfile: TaskerProfile | null;
};

export function dashboardHrefForRole(role: AccountRole) {
  if (role === "admin") return "/admin";
  if (role === "tasker") return "/poskytovatel/dashboard";
  return "/dashboard";
}

export async function getAccountContext(user: User): Promise<AccountContext> {
  const isAdmin = isAdminEmail(user.email);
  let clientProfile: ClientProfile | null = null;
  let taskerProfile: TaskerProfile | null = null;

  if (hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const service = createServiceSupabaseClient();
    const [clientResult, taskerResult] = await Promise.all([
      service.from("client_profiles").select("*").eq("auth_user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      service.from("tasker_profiles").select("*").eq("auth_user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (!clientResult.error) clientProfile = clientResult.data as ClientProfile | null;
    if (!taskerResult.error) taskerProfile = taskerResult.data as TaskerProfile | null;
  }

  const role: AccountRole = isAdmin ? "admin" : taskerProfile ? "tasker" : clientProfile ? "client" : "unknown";
  const profileName = taskerProfile?.name || clientProfile?.name;
  const displayName = profileName || (typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null) || user.email || "Můj účet";

  return {
    user,
    role,
    displayName,
    dashboardHref: dashboardHrefForRole(role),
    isAdmin,
    clientProfile,
    taskerProfile,
  };
}

export function isClientAccount(account: AccountContext) {
  return account.role === "client";
}

export function isTaskerAccount(account: AccountContext) {
  return account.role === "tasker";
}
