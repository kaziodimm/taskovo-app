"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const ATTACHMENT_BUCKET = "task-attachments";
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

function fileExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (extension) return extension;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

function requiredImageFile(formData: FormData, key: string) {
  const value = formData.get(key);
  if (!(value instanceof File) || value.size === 0) return null;
  if (!ALLOWED_ATTACHMENT_TYPES.has(value.type)) return null;
  if (value.size > MAX_ATTACHMENT_BYTES) return null;
  return value;
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
  revalidatePath(`/ukol/${taskId}`);
  redirect(user?.user_metadata?.role === "tasker" ? "/poskytovatel/dashboard" : "/tasks");
}

export async function addTaskAttachment(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard?error=config");

  const taskId = requiredString(formData, "task_id");
  const imageFile = requiredImageFile(formData, "image_file");
  const caption = optionalString(formData, "caption");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (!imageFile) redirect(`/ukol/${taskId}?error=image_file`);

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service.from("tasks").select("id,client_auth_user_id").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task || task.client_auth_user_id !== user.id) redirect(`/ukol/${taskId}?error=forbidden`);

  const storagePath = `${taskId}/${randomUUID()}.${fileExtension(imageFile)}`;
  const { error: uploadError } = await service.storage.from(ATTACHMENT_BUCKET).upload(storagePath, imageFile, {
    cacheControl: "31536000",
    contentType: imageFile.type,
    upsert: false,
  });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = service.storage.from(ATTACHMENT_BUCKET).getPublicUrl(storagePath);
  const { error } = await service.from("task_attachments").insert({
    task_id: taskId,
    image_url: publicUrl.publicUrl,
    storage_path: storagePath,
    caption,
    created_by_auth_user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/dashboard");
  redirect(`/ukol/${taskId}`);
}

export async function acceptOffer(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard?error=config");

  const taskId = requiredString(formData, "task_id");
  const offerId = requiredString(formData, "offer_id");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role === "tasker") redirect("/poskytovatel/dashboard");

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service.from("tasks").select("id,client_auth_user_id,status").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task || task.client_auth_user_id !== user.id) redirect("/dashboard?error=forbidden");

  const { data: offer, error: offerError } = await service.from("offers").select("id,task_id,tasker_auth_user_id,tasker_profile_id").eq("id", offerId).eq("task_id", taskId).maybeSingle();
  if (offerError) throw new Error(offerError.message);
  if (!offer) redirect("/dashboard?error=offer_missing");

  const { error: acceptError } = await service.from("offers").update({ status: "accepted" }).eq("id", offerId);
  if (acceptError) throw new Error(acceptError.message);

  const { error: declineError } = await service.from("offers").update({ status: "declined" }).eq("task_id", taskId).neq("id", offerId);
  if (declineError) throw new Error(declineError.message);

  const { error: taskUpdateError } = await service.from("tasks").update({
    status: "assigned",
    accepted_offer_id: offer.id,
    assigned_tasker_auth_user_id: offer.tasker_auth_user_id || null,
    assigned_tasker_profile_id: offer.tasker_profile_id || null,
  }).eq("id", taskId);
  if (taskUpdateError) throw new Error(taskUpdateError.message);

  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/admin");
  redirect("/dashboard");
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
