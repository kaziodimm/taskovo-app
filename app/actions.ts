"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function titleFromDescription(description: string) {
  return description.length > 64 ? `${description.slice(0, 61)}...` : description;
}

function authRedirect(role: string | undefined) {
  if (role === "tasker") redirect("/poskytovatel/dashboard");
  redirect("/dashboard");
}

export async function registerClientAccount(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/prihlaseni?error=config");

  const name = requiredString(formData, "name");
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const phone = optionalString(formData, "phone");
  const city = optionalString(formData, "city");
  const service = createServiceSupabaseClient();
  const { data: created, error: createError } = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, role: "client" } });

  if (createError && !createError.message.toLowerCase().includes("already")) redirect("/prihlaseni?error=register");

  let userId = created.user?.id;
  if (!userId) {
    const { data } = await service.auth.admin.listUsers();
    userId = data.users.find((user) => user.email?.toLowerCase() === email)?.id;
  }

  const { error: profileError } = await service.from("client_profiles").upsert({ auth_user_id: userId || null, name, email, phone, city, preferred_language: "cs", marketing_consent: formData.get("marketing_consent") === "on", password_auth_enabled: true }, { onConflict: "email" });
  if (profileError) throw new Error(profileError.message);

  const supabase = await createServerSupabaseClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) redirect("/prihlaseni?registered=client");

  revalidatePath("/admin");
  redirect("/dashboard");
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
  const service = createServiceSupabaseClient();
  const { data: created, error: createError } = await service.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name, role: "tasker" } });

  if (createError && !createError.message.toLowerCase().includes("already")) redirect("/prihlaseni?error=register");

  let userId = created.user?.id;
  if (!userId) {
    const { data } = await service.auth.admin.listUsers();
    userId = data.users.find((user) => user.email?.toLowerCase() === email)?.id;
  }

  const { error: profileError } = await service.from("tasker_profiles").insert({ auth_user_id: userId || null, email, name, city, categories, contact, bio, password_auth_enabled: true });
  if (profileError) throw new Error(profileError.message);

  const supabase = await createServerSupabaseClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) redirect("/prihlaseni?registered=tasker");

  revalidatePath("/admin");
  redirect("/poskytovatel/dashboard");
}

export async function loginAccount(formData: FormData) {
  const email = requiredString(formData, "email").toLowerCase();
  const password = requiredString(formData, "password");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect("/prihlaseni?error=login");
  authRedirect(data.user?.user_metadata?.role);
}

export async function logoutAccount() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/prihlaseni");
}

export async function createClientProfile(formData: FormData) {
  return registerClientAccount(formData);
}

export async function adminLogin(formData: FormData) {
  const email = requiredString(formData, "email");
  const password = requiredString(formData, "password");

  if (!validateAdminCredentials(email, password)) redirect("/admin/prihlaseni?error=invalid");

  await setAdminSession(email);
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin/prihlaseni");
}

export async function createTask(formData: FormData) {
  const description = requiredString(formData, "description");

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/tasks");

  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  const service = createServiceSupabaseClient();
  const clientName = optionalString(formData, "client_name") || user?.user_metadata?.name || user?.email || "Klient Taskovo";
  const clientContact = optionalString(formData, "client_contact") || user?.email || "kontakt po přihlášení";

  const { error } = await service.from("tasks").insert({
    client_auth_user_id: user?.id || null,
    title: titleFromDescription(description),
    description,
    category: requiredString(formData, "category"),
    city: requiredString(formData, "city"),
    district: optionalString(formData, "district"),
    budget_czk: Number(requiredString(formData, "budget_czk")),
    desired_time: requiredString(formData, "desired_time"),
    client_name: clientName,
    client_contact: clientContact,
    status: "open",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect(user ? "/dashboard" : "/tasks");
}

export async function createOffer(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/tasks");

  const taskId = requiredString(formData, "task_id");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  const service = createServiceSupabaseClient();

  let profile: { id: string; name: string; contact?: string | null; email?: string | null } | null = null;
  if (user?.id) {
    const { data } = await service.from("tasker_profiles").select("id,name,contact,email").eq("auth_user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    profile = data;
  }

  const taskerName = optionalString(formData, "tasker_name") || profile?.name || user?.user_metadata?.name || user?.email || "Tasker Taskovo";
  const taskerContact = optionalString(formData, "tasker_contact") || profile?.contact || profile?.email || user?.email || "kontakt po přihlášení";

  const { error } = await service.from("offers").insert({
    task_id: taskId,
    tasker_auth_user_id: user?.id || null,
    tasker_profile_id: profile?.id || null,
    tasker_name: taskerName,
    tasker_contact: taskerContact,
    price_czk: Number(requiredString(formData, "price_czk")),
    message: requiredString(formData, "message"),
  });

  if (error) throw new Error(error.message);

  await service.from("tasks").update({ status: "offers_received" }).eq("id", taskId);
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  redirect(user?.user_metadata?.role === "tasker" ? "/poskytovatel/dashboard" : "/tasks");
}

export async function createTaskerProfile(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/taskers");

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("tasker_profiles").insert({
    name: requiredString(formData, "name"),
    city: requiredString(formData, "city"),
    categories: requiredString(formData, "categories"),
    contact: requiredString(formData, "contact"),
    bio: optionalString(formData, "bio"),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/taskers");
  revalidatePath("/admin");
  redirect("/taskers");
}
