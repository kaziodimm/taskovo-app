"use server";

import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin-auth";
import { createServerSupabaseClient } from "@/lib/supabase";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

export async function loginAccount(formData: FormData) {
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/prihlaseni?error=login");
  if (isAdminEmail(data.user?.email)) redirect("/admin");
  if (data.user?.user_metadata?.role === "tasker") redirect("/poskytovatel/dashboard");
  redirect("/dashboard");
}
