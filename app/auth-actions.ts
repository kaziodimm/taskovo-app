"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/admin-auth";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

type AccountRole = "client" | "tasker";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function appUrl(path: string) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const baseUrl = envUrl ? (envUrl.startsWith("http") ? envUrl : `https://${envUrl}`) : "https://taskovo.cz";
  return new URL(path, baseUrl).toString();
}

function authRedirect(role: string | undefined, email?: string | null) {
  if (isAdminEmail(email)) redirect("/admin");
  if (role === "tasker") redirect("/poskytovatel/dashboard");
  redirect("/dashboard");
}

function registrationRedirect(role: AccountRole, email: string) {
  const params = new URLSearchParams({
    mode: "login",
    registered: role,
    email,
  });
  redirect(`/prihlaseni?${params.toString()}`);
}

async function emailAlreadyRegistered(email: string) {
  const service = createServiceSupabaseClient();

  const { data: clientProfile, error: clientError } = await service
    .from("client_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (clientError) throw new Error(clientError.message);
  if (clientProfile) return true;

  const { data: taskerProfile, error: taskerError } = await service
    .from("tasker_profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (taskerError) throw new Error(taskerError.message);
  if (taskerProfile) return true;

  const { data: users, error: usersError } = await service.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) throw new Error(usersError.message);
  return users.users.some((user) => user.email?.toLowerCase() === email);
}

async function signUpWithEmailVerification(email: string, password: string, name: string, role: AccountRole) {
  const supabase = await createServerSupabaseClient();
  const nextPath = role === "tasker" ? "/poskytovatel/dashboard" : "/dashboard";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role },
      emailRedirectTo: appUrl(nextPath),
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already") || message.includes("registered")) redirect("/prihlaseni?error=duplicate");
    redirect("/prihlaseni?error=register");
  }

  return data.user?.id || null;
}

export async function registerClientAccount(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/prihlaseni?error=config");

  const name = requiredString(formData, "name");
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const phone = optionalString(formData, "phone");
  const city = optionalString(formData, "city");

  if (await emailAlreadyRegistered(email)) redirect("/prihlaseni?error=duplicate");

  const userId = await signUpWithEmailVerification(email, password, name, "client");
  const service = createServiceSupabaseClient();
  const { error: profileError } = await service.from("client_profiles").upsert(
    {
      auth_user_id: userId,
      name,
      email,
      phone,
      city,
      preferred_language: "cs",
      marketing_consent: formData.get("marketing_consent") === "on",
      password_auth_enabled: true,
    },
    { onConflict: "email" },
  );

  if (profileError) throw new Error(profileError.message);
  revalidatePath("/admin");
  registrationRedirect("client", email);
}

export async function registerTaskerAccount(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/prihlaseni?error=config");

  const name = requiredString(formData, "name");
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const city = requiredString(formData, "city");
  const categories = requiredString(formData, "categories");
  const contact = optionalString(formData, "contact") || email;
  const bio = optionalString(formData, "bio");

  if (await emailAlreadyRegistered(email)) redirect("/prihlaseni?error=duplicate");

  const userId = await signUpWithEmailVerification(email, password, name, "tasker");
  const service = createServiceSupabaseClient();
  const { error: profileError } = await service.from("tasker_profiles").insert({
    auth_user_id: userId,
    email,
    name,
    city,
    categories,
    contact,
    bio,
    password_auth_enabled: true,
  });

  if (profileError) throw new Error(profileError.message);
  revalidatePath("/admin");
  registrationRedirect("tasker", email);
}

export async function loginAccount(formData: FormData) {
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("email") && message.includes("confirm")) redirect("/prihlaseni?mode=login&error=email_not_confirmed");
    redirect("/prihlaseni?mode=login&error=login");
  }

  authRedirect(data.user?.user_metadata?.role, data.user?.email);
}

export async function requestPasswordReset(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/prihlaseni?mode=reset&error=config");

  const email = requiredString(formData, "email").toLowerCase();
  const exists = await emailAlreadyRegistered(email);

  if (exists) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: appUrl("/nove-heslo"),
    });
    if (error) redirect("/prihlaseni?mode=reset&error=reset");
  }

  redirect(`/prihlaseni?mode=reset&resetSent=1&email=${encodeURIComponent(email)}`);
}

export async function updateRecoveredPassword(formData: FormData) {
  const password = requiredString(formData, "password");
  const confirmPassword = requiredString(formData, "confirm_password");

  if (password !== confirmPassword) redirect("/nove-heslo?error=password_match");
  if (password.length < 8) redirect("/nove-heslo?error=password_length");

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) redirect("/nove-heslo?error=update_password");
  await supabase.auth.signOut();
  redirect("/prihlaseni?mode=login&passwordUpdated=1");
}
