"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const MAX_MESSAGE_LENGTH = 1200;

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

function revalidateTaskViews(taskId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/tasks/${taskId}`);
  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
}

export async function sendAdminTaskMessage(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/admin?error=config");
  if (!(await isAdminAuthenticated())) redirect("/prihlaseni?mode=login&error=login_required");

  const taskId = requiredString(formData, "task_id");
  const body = requiredString(formData, "body");
  if (body.length > MAX_MESSAGE_LENGTH) redirect(`/admin/tasks/${taskId}?error=message_too_long`);

  const service = createServiceSupabaseClient();
  const { data: task, error: taskError } = await service.from("tasks").select("id").eq("id", taskId).maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task) redirect("/admin?error=task_missing");

  const { error } = await service.from("messages").insert({
    task_id: taskId,
    sender_role: "admin",
    sender_name: "Taskovo",
    body,
  });
  if (error) throw new Error(error.message);

  revalidateTaskViews(taskId);
  redirect(`/admin/tasks/${taskId}?updated=admin_message_sent`);
}
