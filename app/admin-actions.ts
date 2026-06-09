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
  if (taskId) revalidatePath(`/ukol/${taskId}`);
}

export async function updateAdminTaskStatus(formData: FormData) {
  const taskId = requiredString(formData, "task_id");
  const status = requiredString(formData, "status") as TaskStatus;

  if (!allowedTaskStatuses.has(status)) redirect("/admin?error=bad_status");

  const service = await requireAdmin();
  const { error } = await service.from("tasks").update({ status }).eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect("/admin");
}

export async function cancelAdminTask(formData: FormData) {
  const taskId = requiredString(formData, "task_id");
  const service = await requireAdmin();
  const { error } = await service.from("tasks").update({ status: "cancelled" }).eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect("/admin");
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
    })
    .eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect("/admin");
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
  if (!offer) redirect("/admin?error=offer_missing");

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
  redirect("/admin");
}

export async function declineAdminOffer(formData: FormData) {
  const offerId = requiredString(formData, "offer_id");
  const taskId = requiredString(formData, "task_id");
  const service = await requireAdmin();
  const { error } = await service.from("offers").update({ status: "declined" }).eq("id", offerId);
  if (error) throw new Error(error.message);

  revalidateAdminViews(taskId);
  redirect("/admin");
}

export async function toggleTaskerVerification(formData: FormData) {
  const taskerId = requiredString(formData, "tasker_id");
  const verified = requiredString(formData, "verified") === "true";
  const service = await requireAdmin();
  const { error } = await service.from("tasker_profiles").update({ verified }).eq("id", taskerId);
  if (error) throw new Error(error.message);

  revalidateAdminViews();
  redirect("/admin");
}
