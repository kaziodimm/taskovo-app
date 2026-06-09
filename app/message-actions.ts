"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

async function canAccessTaskMessages(taskId: string, authUserId: string) {
  const service = createServiceSupabaseClient();
  const { data: task, error } = await service
    .from("tasks")
    .select("id,client_auth_user_id,assigned_tasker_auth_user_id")
    .eq("id", taskId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(task && (task.client_auth_user_id === authUserId || task.assigned_tasker_auth_user_id === authUserId));
}

export async function markTaskMessagesRead(taskId: string) {
  if (!taskId || !hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user) return;

  const canAccess = await canAccessTaskMessages(taskId, user.id);
  if (!canAccess) return;

  const service = createServiceSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await service.from("message_reads").upsert({
    task_id: taskId,
    auth_user_id: user.id,
    last_read_at: now,
    updated_at: now,
  }, { onConflict: "task_id,auth_user_id" });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  revalidatePath(`/ukol/${taskId}`);
}
