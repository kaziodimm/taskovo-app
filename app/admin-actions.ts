"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";
import type { TaskStatus } from "@/lib/types";

const allowedTaskStatuses = new Set<TaskStatus>([
  "pending_review",
  "open",
  "offers_received",
  "assigned",
  "in_progress",
  "awaiting_confirmation",
  "completed",
  "cancelled",
  "disputed",
]);

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function requireAdmin() {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/admin?error=config");
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");
  return createServiceSupabaseClient();
}

function revalidateAdminViews(taskId?: string) {
  revalidatePath("/admin");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  if (taskId) {
    revalidatePath(`/ukol/${taskId}`);
    revalidatePath(`/admin/tasks/${taskId}`);
  }
}

function revalidateProfileViews(profileId: string, role: "client" | "tasker") {
  revalidatePath("/admin");
  revalidatePath("/profil/foto");
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  revalidatePath("/poskytovatele");
  revalidatePath(role === "tasker" ? `/admin/taskers/${profileId}` : `/admin/clients/${profileId}`);
  if (role === "tasker") revalidatePath(`/poskytovatel/${profileId}`);
}

export async function updateAdminClientProfile(formData: FormData) {
  const clientId = requiredString(formData, "client_id");
  const service = await requireAdmin();
  const marketingConsent = formData.get("marketing_consent") === "on";

  const { error } = await service
    .from("client_profiles")
    .update({
      name: requiredString(formData, "name"),
      email: requiredString(formData, "email").toLowerCase(),
      phone: optionalString(formData, "phone"),
      city: optionalString(formData, "city"),
      preferred_language: optionalString(formData, "preferred_language") || "cs",
      marketing_consent: marketingConsent,
    })
    .eq("id", clientId);
  if (error) throw new Error(error.message);

  revalidateAdminViews();
  revalidatePath(`/admin/clients/${clientId}`);
  redirect(`/admin/clients/${clientId}?updated=profile_saved`);
}

export async function updateAdminTaskerProfile(formData: FormData) {
  const taskerId = requiredString(formData, "tasker_id");
  const service = await requireAdmin();
  const verified = formData.get("verified") === "on";

  const { error } = await service
    .from("tasker_profiles")
    .update({
      name: requiredString(formData, "name"),
      email: optionalString(formData, "email"),
      city: requiredString(formData, "city"),
      categories: requiredString(formData, "categories"),
      contact: optionalString(formData, "contact"),
      bio: optionalString(formData, "bio"),
      verified,
    })
    .eq("id", taskerId);
  if (error) throw new Error(error.message);

  revalidateAdminViews();
  revalidatePath(`/admin/taskers/${taskerId}`);
  redirect(`/admin/taskers/${taskerId}?updated=profile_saved`);
}

export async function approveProfilePhoto(formData: FormData) {
  const profileId = requiredString(formData, "profile_id");
  const role = requiredString(formData, "role") === "tasker" ? "tasker" : "client";
  const table = role === "tasker" ? "tasker_profiles" : "client_profiles";
  const detailPath = role === "tasker" ? `/admin/taskers/${profileId}` : `/admin/clients/${profileId}`;
  const service = await requireAdmin();

  const { data: profile, error: profileError } = await service.from(table).select("pending_avatar_url").eq("id", profileId).maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile?.pending_avatar_url) redirect(`${detailPath}?error=no_pending_photo`);

  const { error } = await service
    .from(table)
    .update({
      avatar_url: profile.pending_avatar_url,
      pending_avatar_url: null,
      avatar_review_status: "approved",
      avatar_review_note: null,
    })
    .eq("id", profileId);
  if (error) throw new Error(error.message);

  revalidateProfileViews(profileId, role);
  redirect(`${detailPath}?updated=photo_approved`);
}

export async function rejectProfilePhoto(formData: FormData) {
  const profileId = requiredString(formData, "profile_id");
  const role = requiredString(formData, "role") === "tasker" ? "tasker" : "client";
  const reason = optionalString(formData, "reason") || "Fotka nebyla schválena administrátorem.";
  const table = role === "tasker" ? "tasker_profiles" : "client_profiles";
  const detailPath = role === "tasker" ? `/admin/taskers/${profileId}` : `/admin/clients/${profileId}`;
  const service = await requireAdmin();

  const { error } = await service
    .from(table)
    .update({
      pending_avatar_url: null,
      avatar_review_status: "rejected",
      avatar_review_note: reason,
    })
    .eq("id", profileId);
  if (error) throw new Error(error.message);

  revalidateProfileViews(profileId, role);
  redirect(`${detailPath}?updated=photo_rejected`);
}

export async function updateAdminTaskStatus(formData: FormData) {
  const taskId = requiredString(formData, "task_id");
  const status = requiredString(formData, "status") as TaskStatus;

  if (!allowedTaskStatuses.has(status)) redirect("/admin?error=bad_status");

  const service = await requireAdmin();
  const resetCancellation = status !== "cancelled"
    ? { admin_cancel_reason: null, admin_cancelled_at: null, admin_cancelled_by: null }
    : {};
  const { error } = await service.from("tasks").update({ status, ...resetCancellation }).eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect(`/admin/tasks/${taskId}?updated=status_saved`);
}

export async function cancelAdminTask(formData: FormData) {
  const taskId = requiredString(formData, "task_id");
  const reason = requiredString(formData, "reason");
  const service = await requireAdmin();
  const body = `Objednávka byla zrušena administrátorem. Důvod: ${reason}`;

  const { error: messageError } = await service.from("messages").insert({
    task_id: taskId,
    sender_role: "admin",
    sender_name: "Taskovo",
    body,
  });
  if (messageError) throw new Error(messageError.message);

  const { error } = await service
    .from("tasks")
    .update({
      status: "cancelled",
      admin_cancel_reason: reason,
      admin_cancelled_at: new Date().toISOString(),
      admin_cancelled_by: "Taskovo admin",
    })
    .eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect(`/admin/tasks/${taskId}?updated=task_cancelled`);
}

export async function reopenAdminTask(formData: FormData) {
  const taskId = requiredString(formData, "task_id");
  const service = await requireAdmin();

  const { error: offersError } = await service.from("offers").update({ status: "pending" }).eq("task_id", taskId);
  if (offersError) throw new Error(offersError.message);

  const { error } = await service
    .from("tasks")
    .update({
      status: "open",
      accepted_offer_id: null,
      assigned_tasker_auth_user_id: null,
      assigned_tasker_profile_id: null,
      admin_cancel_reason: null,
      admin_cancelled_at: null,
      admin_cancelled_by: null,
    })
    .eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect(`/admin/tasks/${taskId}?updated=task_reopened`);
}

export async function acceptAdminOffer(formData: FormData) {
  const offerId = requiredString(formData, "offer_id");
  const taskId = requiredString(formData, "task_id");
  const service = await requireAdmin();

  const { data: offer, error: offerError } = await service
    .from("offers")
    .select("id,task_id,tasker_auth_user_id,tasker_profile_id")
    .eq("id", offerId)
    .eq("task_id", taskId)
    .maybeSingle();
  if (offerError) throw new Error(offerError.message);
  if (!offer) redirect(`/admin/tasks/${taskId}?error=offer_missing`);

  const { error: acceptError } = await service.from("offers").update({ status: "accepted" }).eq("id", offerId);
  if (acceptError) throw new Error(acceptError.message);

  const { error: declineError } = await service.from("offers").update({ status: "declined" }).eq("task_id", taskId).neq("id", offerId);
  if (declineError) throw new Error(declineError.message);

  const { error } = await service
    .from("tasks")
    .update({
      status: "assigned",
      accepted_offer_id: offer.id,
      assigned_tasker_auth_user_id: offer.tasker_auth_user_id || null,
      assigned_tasker_profile_id: offer.tasker_profile_id || null,
    })
    .eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect(`/admin/tasks/${taskId}?updated=offer_accepted`);
}

export async function declineAdminOffer(formData: FormData) {
  const offerId = requiredString(formData, "offer_id");
  const taskId = requiredString(formData, "task_id");
  const service = await requireAdmin();
  const { error } = await service.from("offers").update({ status: "declined" }).eq("id", offerId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect(`/admin/tasks/${taskId}?updated=offer_declined`);
}

export async function toggleTaskerVerification(formData: FormData) {
  const taskerId = requiredString(formData, "tasker_id");
  const verified = requiredString(formData, "verified") === "true";
  const service = await requireAdmin();
  const { error } = await service.from("tasker_profiles").update({ verified }).eq("id", taskerId);
  if (error) throw new Error(error.message);

  revalidateAdminViews();
  redirect("/admin?updated=tasker_verification");
}
