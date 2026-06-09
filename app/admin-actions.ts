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

export async function toggleTaskerVerification(formData: FormData) {
  const taskerId = requiredString(formData, "tasker_id");
  const verified = requiredString(formData, "verified") === "true";
  const service = await requireAdmin();
  const { error } = await service.from("tasker_profiles").update({ verified }).eq("id", taskerId);
  if (error) throw new Error(error.message);

  revalidateAdminViews();
  redirect("/admin");
}
