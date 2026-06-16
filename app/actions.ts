"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  loginAccount as authLoginAccount,
  registerClientAccount as authRegisterClientAccount,
  registerTaskerAccount as authRegisterTaskerAccount,
} from "@/app/auth-actions";
import { getAccountContext } from "@/lib/account";
import { clearAdminSession, setAdminSession, validateAdminCredentials } from "@/lib/admin-auth";
import { appUrl, sendTaskovoEmail } from "@/lib/email";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const ATTACHMENT_BUCKET = "task-attachments";
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024;
const MAX_TASK_CREATE_ATTACHMENTS = 4;
const MAX_MESSAGE_LENGTH = 1200;
const DEFAULT_ADMIN_EMAIL = "kaziodimm@gmail.com";
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

function adminEmail() {
  return process.env.TASKOVO_ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}

function titleFromDescription(description: string) {
  return description.length > 64 ? `${description.slice(0, 61)}...` : description;
}

function revalidateTaskViews(taskId: string) {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/admin");
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

function optionalImageFiles(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => value instanceof File && value.size > 0)
    .filter((file) => ALLOWED_ATTACHMENT_TYPES.has(file.type) && file.size <= MAX_ATTACHMENT_BYTES)
    .slice(0, MAX_TASK_CREATE_ATTACHMENTS);
}

async function storeTaskAttachment(service: ReturnType<typeof createServiceSupabaseClient>, taskId: string, imageFile: File, createdByAuthUserId: string | null, caption: string | null = null) {
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
    created_by_auth_user_id: createdByAuthUserId,
  });

  if (error) throw new Error(error.message);
}

export async function registerClientAccount(formData: FormData) {
  return authRegisterClientAccount(formData);
}

export async function registerTaskerAccount(formData: FormData) {
  return authRegisterTaskerAccount(formData);
}

export async function loginAccount(formData: FormData) {
  return authLoginAccount(formData);
}

export async function logoutAccount() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/prihlaseni");
}

export async function createClientProfile(formData: FormData) {
  return authRegisterClientAccount(formData);
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

  if (user) {
    const account = await getAccountContext(user);
    if (account.role === "tasker") redirect("/poskytovatel/dashboard");
  }

  const category = requiredString(formData, "category");
  const city = requiredString(formData, "city");
  const desiredTime = requiredString(formData, "desired_time");
  const budget = Number(requiredString(formData, "budget_czk"));
  const clientName = optionalString(formData, "client_name") || user?.user_metadata?.name || user?.email || "Klient Taskovo";
  const clientContact = optionalString(formData, "client_contact") || user?.email || "kontakt po přihlášení";
  const attachments = optionalImageFiles(formData, "image_files");

  const { data: task, error } = await service.from("tasks").insert({
    client_auth_user_id: user?.id || null,
    title: titleFromDescription(description),
    description,
    category,
    city,
    district: optionalString(formData, "district"),
    budget_czk: budget,
    desired_time: desiredTime,
    client_name: clientName,
    client_contact: clientContact,
    status: "open",
  }).select("id,title").single();

  if (error) throw new Error(error.message);
  if (!task?.id) throw new Error("Task was not created");

  for (const imageFile of attachments) {
    await storeTaskAttachment(service, task.id, imageFile, user?.id || null);
  }

  await sendTaskovoEmail({
    to: [adminEmail()],
    subject: `Taskovo admin: nový úkol v ${city}`,
    heading: "Nový úkol čeká v marketplace",
    body: [
      `${clientName} zadal nový úkol “${task.title}”.`,
      `Kategorie: ${category}. Město: ${city}. Rozpočet: ${budget.toLocaleString("cs-CZ")} Kč. Termín: ${desiredTime}.`,
      `Kontakt klienta: ${clientContact}`,
    ],
    ctaHref: appUrl(`/admin/tasks/${task.id}`),
    ctaLabel: "Otevřít v administraci",
  });

  revalidateTaskViews(task.id);
  redirect(user ? `/ukol/${task.id}` : "/tasks");
}

export async function createOffer(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/tasks");

  const taskId = requiredString(formData, "task_id");
  const price = Number(requiredString(formData, "price_czk"));
  const message = requiredString(formData, "message");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const account = await getAccountContext(user);
  if (account.role === "admin") redirect("/admin");
  if (account.role === "client") redirect("/dashboard");
  if (account.role !== "tasker" || !account.taskerProfile) redirect("/prihlaseni?mode=login&error=account_profile");

  const service = createServiceSupabaseClient();
  const profile = account.taskerProfile;
  const taskerName = optionalString(formData, "tasker_name") || profile.name || account.displayName;
  const taskerContact = optionalString(formData, "tasker_contact") || profile.contact || profile.email || user.email || "kontakt po přihlášení";
  const { data: task, error: taskError } = await service.from("tasks").select("id,title,client_contact").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);

  const { error } = await service.from("offers").insert({
    task_id: taskId,
    tasker_auth_user_id: user.id,
    tasker_profile_id: profile.id,
    tasker_name: taskerName,
    tasker_contact: taskerContact,
    price_czk: price,
    message,
  });

  if (error) throw new Error(error.message);

  await service.from("tasks").update({ status: "offers_received" }).eq("id", taskId);
  if (task) {
    await sendTaskovoEmail({
      to: [task.client_contact],
      subject: `Taskovo: nová nabídka k objednávce ${task.title}`,
      heading: "Přišla nová nabídka",
      body: [`${taskerName} poslal nabídku k objednávce “${task.title}”.`, `Cena nabídky: ${price.toLocaleString("cs-CZ")} Kč.`, message],
      ctaHref: appUrl(`/ukol/${taskId}`),
      ctaLabel: "Zobrazit nabídku",
    });
  }
  revalidateTaskViews(taskId);
  redirect("/poskytovatel/dashboard?updated=offer_sent");
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

  const account = await getAccountContext(user);
  if (account.role === "tasker") redirect("/poskytovatel/dashboard");
  if (account.role === "unknown") redirect("/prihlaseni?mode=login&error=account_profile");

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service.from("tasks").select("id,client_auth_user_id").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task || task.client_auth_user_id !== user.id) redirect(`/ukol/${taskId}?error=forbidden`);

  await storeTaskAttachment(service, taskId, imageFile, user.id, caption);

  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/dashboard");
  redirect(`/ukol/${taskId}?updated=attachment_added`);
}

export async function acceptOffer(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard?error=config");

  const taskId = requiredString(formData, "task_id");
  const offerId = requiredString(formData, "offer_id");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const account = await getAccountContext(user);
  if (account.role === "tasker") redirect("/poskytovatel/dashboard");
  if (account.role === "unknown") redirect("/prihlaseni?mode=login&error=account_profile");

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service.from("tasks").select("id,title,client_auth_user_id,status").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task || task.client_auth_user_id !== user.id) redirect(`/ukol/${taskId}?error=forbidden`);

  const { data: offer, error: offerError } = await service.from("offers").select("id,task_id,tasker_auth_user_id,tasker_profile_id,tasker_name,tasker_contact,price_czk").eq("id", offerId).eq("task_id", taskId).maybeSingle();
  if (offerError) throw new Error(offerError.message);
  if (!offer) redirect(`/ukol/${taskId}?error=offer_missing`);

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

  await sendTaskovoEmail({
    to: [offer.tasker_contact],
    subject: `Taskovo: klient vybral vaši nabídku`,
    heading: "Vaše nabídka byla vybrána",
    body: [`Klient vybral vaši nabídku k objednávce “${task.title}”.`, `Dohodnutá cena: ${offer.price_czk.toLocaleString("cs-CZ")} Kč.`, "Otevřete detail objednávky a domluvte další kroky s klientem."],
    ctaHref: appUrl(`/ukol/${taskId}`),
    ctaLabel: "Otevřít objednávku",
  });

  revalidateTaskViews(taskId);
  redirect(`/ukol/${taskId}?updated=offer_accepted`);
}

export async function startTaskWork(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/poskytovatel/dashboard?error=config");

  const taskId = requiredString(formData, "task_id");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const account = await getAccountContext(user);
  if (account.role === "admin") redirect("/admin");
  if (account.role === "client") redirect("/dashboard");
  if (account.role !== "tasker") redirect("/prihlaseni?mode=login&error=account_profile");

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service.from("tasks").select("id,title,status,client_contact,assigned_tasker_auth_user_id").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task || task.assigned_tasker_auth_user_id !== user.id) redirect(`/ukol/${taskId}?error=forbidden`);
  if (task.status !== "assigned") redirect(`/ukol/${taskId}?error=status`);

  const { error } = await service.from("tasks").update({ status: "in_progress" }).eq("id", taskId);
  if (error) throw new Error(error.message);

  await sendTaskovoEmail({
    to: [task.client_contact],
    subject: `Taskovo: práce na objednávce začala`,
    heading: "Tasker začal pracovat",
    body: [`Tasker označil objednávku “${task.title}” jako zahájenou.`, "Další krok uvidíte v detailu objednávky."],
    ctaHref: appUrl(`/ukol/${taskId}`),
    ctaLabel: "Otevřít objednávku",
  });

  revalidateTaskViews(taskId);
  redirect(`/ukol/${taskId}?updated=task_started`);
}

export async function requestTaskCompletion(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/poskytovatel/dashboard?error=config");

  const taskId = requiredString(formData, "task_id");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const account = await getAccountContext(user);
  if (account.role === "admin") redirect("/admin");
  if (account.role === "client") redirect("/dashboard");
  if (account.role !== "tasker") redirect("/prihlaseni?mode=login&error=account_profile");

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service.from("tasks").select("id,title,status,client_contact,assigned_tasker_auth_user_id").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task || task.assigned_tasker_auth_user_id !== user.id) redirect(`/ukol/${taskId}?error=forbidden`);
  if (task.status !== "in_progress") redirect(`/ukol/${taskId}?error=status`);

  const { error } = await service.from("tasks").update({ status: "awaiting_confirmation" }).eq("id", taskId);
  if (error) throw new Error(error.message);

  await sendTaskovoEmail({
    to: [task.client_contact],
    subject: `Taskovo: objednávka čeká na potvrzení`,
    heading: "Tasker označil práci jako hotovou",
    body: [`Objednávka “${task.title}” čeká na vaše potvrzení dokončení.`, "Zkontrolujte výsledek a potvrďte dokončení v detailu objednávky."],
    ctaHref: appUrl(`/ukol/${taskId}`),
    ctaLabel: "Potvrdit dokončení",
  });

  revalidateTaskViews(taskId);
  redirect(`/ukol/${taskId}?updated=completion_requested`);
}

export async function confirmTaskCompletion(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard?error=config");

  const taskId = requiredString(formData, "task_id");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const account = await getAccountContext(user);
  if (account.role === "tasker") redirect("/poskytovatel/dashboard");
  if (account.role === "unknown") redirect("/prihlaseni?mode=login&error=account_profile");

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service.from("tasks").select("id,title,status,client_auth_user_id,accepted_offer_id").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task || task.client_auth_user_id !== user.id) redirect(`/ukol/${taskId}?error=forbidden`);
  if (task.status !== "awaiting_confirmation") redirect(`/ukol/${taskId}?error=status`);

  const { data: offer, error: offerError } = task.accepted_offer_id
    ? await service.from("offers").select("tasker_contact").eq("id", task.accepted_offer_id).maybeSingle()
    : { data: null, error: null };
  if (offerError) throw new Error(offerError.message);

  const { error } = await service.from("tasks").update({ status: "completed" }).eq("id", taskId);
  if (error) throw new Error(error.message);

  await sendTaskovoEmail({
    to: [offer?.tasker_contact],
    subject: `Taskovo: objednávka byla potvrzena jako dokončená`,
    heading: "Klient potvrdil dokončení",
    body: [`Klient potvrdil dokončení objednávky “${task.title}”.`, "Objednávka je nyní ve stavu Hotovo."],
    ctaHref: appUrl(`/ukol/${taskId}`),
    ctaLabel: "Otevřít objednávku",
  });

  revalidateTaskViews(taskId);
  redirect(`/ukol/${taskId}?updated=task_completed`);
}

export async function sendTaskMessage(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard?error=config");

  const taskId = requiredString(formData, "task_id");
  const body = requiredString(formData, "body");
  if (body.length > MAX_MESSAGE_LENGTH) redirect(`/ukol/${taskId}?error=message_too_long`);

  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const account = await getAccountContext(user);
  if (account.role === "unknown") redirect("/prihlaseni?mode=login&error=account_profile");

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service
    .from("tasks")
    .select("id,title,client_auth_user_id,client_contact,assigned_tasker_auth_user_id,accepted_offer_id,status")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError) throw new Error(taskError.message);
  if (!task) redirect("/tasks?error=task_missing");

  const isClientOwner = task.client_auth_user_id === user.id;
  const isAssignedTasker = task.assigned_tasker_auth_user_id === user.id;
  if (!isClientOwner && !isAssignedTasker) redirect(`/ukol/${taskId}?error=forbidden`);
  if (!task.assigned_tasker_auth_user_id) redirect(`/ukol/${taskId}?error=messages_closed`);

  const { data: offer, error: offerError } = task.accepted_offer_id
    ? await service.from("offers").select("tasker_contact").eq("id", task.accepted_offer_id).maybeSingle()
    : { data: null, error: null };
  if (offerError) throw new Error(offerError.message);

  const senderRole = isClientOwner ? "client" : "tasker";
  const fallbackName = senderRole === "client" ? "Klient Taskovo" : "Tasker Taskovo";
  const senderName = account.displayName || user.email || fallbackName;
  const { error } = await service.from("messages").insert({
    task_id: taskId,
    sender_auth_user_id: user.id,
    sender_role: senderRole,
    sender_name: senderName,
    body,
  });

  if (error) throw new Error(error.message);

  await sendTaskovoEmail({
    to: isClientOwner ? [offer?.tasker_contact] : [task.client_contact],
    subject: `Taskovo: nová zpráva k objednávce ${task.title}`,
    heading: "Přišla nová zpráva",
    body: [`${senderName} poslal zprávu k objednávce “${task.title}”.`, body],
    ctaHref: appUrl(`/ukol/${taskId}`),
    ctaLabel: "Otevřít zprávy",
  });

  revalidateTaskViews(taskId);
  redirect(`/ukol/${taskId}?updated=message_sent`);
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
