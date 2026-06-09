"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const MAX_DISPUTE_REASON_LENGTH = 1200;
const disputableStatuses = new Set(["assigned", "in_progress", "awaiting_confirmation"]);

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

function revalidateTaskViews(taskId: string) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/tasks/${taskId}`);
}

export async function requestTaskDispute(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard?error=config");

  const taskId = requiredString(formData, "task_id");
  const reason = requiredString(formData, "reason");
  if (reason.length > MAX_DISPUTE_REASON_LENGTH) redirect(`/ukol/${taskId}?error=dispute_too_long`);

  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service
    .from("tasks")
    .select("id,status,client_auth_user_id,assigned_tasker_auth_user_id")
    .eq("id", taskId)
    .maybeSingle();

  if (taskError) throw new Error(taskError.message);
  if (!task) redirect("/tasks?error=task_missing");

  const isClientOwner = task.client_auth_user_id === user.id;
  const isAssignedTasker = task.assigned_tasker_auth_user_id === user.id;
  if (!isClientOwner && !isAssignedTasker) redirect(`/ukol/${taskId}?error=forbidden`);
  if (!disputableStatuses.has(task.status)) redirect(`/ukol/${taskId}?error=status`);

  const senderRole = isClientOwner ? "client" : "tasker";
  const senderName = user.user_metadata?.name || user.email || (senderRole === "client" ? "Klient Taskovo" : "Tasker Taskovo");
  const disputeBody = `Nahlasen problem pro administraci: ${reason}`;

  const { error: messageError } = await service.from("messages").insert({
    task_id: taskId,
    sender_auth_user_id: user.id,
    sender_role: senderRole,
    sender_name: senderName,
    body: disputeBody,
  });
  if (messageError) throw new Error(messageError.message);

  const { error: updateError } = await service.from("tasks").update({ status: "disputed" }).eq("id", taskId);
  if (updateError) throw new Error(updateError.message);

  revalidateTaskViews(taskId);
  redirect(`/ukol/${taskId}?updated=dispute_reported`);
}
