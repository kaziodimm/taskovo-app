"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const CLIENT_EDITABLE_STATUSES = new Set(["open", "offers_received"]);

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

function revalidateTaskViews(taskId: string) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/admin");
}

async function requireClientTask(taskId: string) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard?error=config");

  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();
  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role === "tasker") redirect("/poskytovatel/dashboard");

  const service = createServiceSupabaseClient();
  const { data: task, error } = await service
    .from("tasks")
    .select("id,client_auth_user_id,status")
    .eq("id", taskId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!task || task.client_auth_user_id !== user.id) redirect("/dashboard?error=forbidden");

  return { service, task, user };
}

export async function updateClientTask(formData: FormData) {
  const taskId = requiredString(formData, "task_id");
  const { service, task } = await requireClientTask(taskId);

  if (!CLIENT_EDITABLE_STATUSES.has(task.status)) redirect(`/ukol/${taskId}?error=locked`);

  const description = requiredString(formData, "description");
  const budget = Number(requiredString(formData, "budget_czk"));
  if (!Number.isFinite(budget) || budget < 100) redirect(`/ukol/${taskId}?error=budget`);

  const { error } = await service
    .from("tasks")
    .update({
      title: titleFromDescription(description),
      description,
      category: requiredString(formData, "category"),
      city: requiredString(formData, "city"),
      district: optionalString(formData, "district"),
      budget_czk: budget,
      desired_time: requiredString(formData, "desired_time"),
    })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  revalidateTaskViews(taskId);
  redirect(`/ukol/${taskId}?updated=task`);
}

export async function cancelClientTask(formData: FormData) {
  const taskId = requiredString(formData, "task_id");
  const { service, task, user } = await requireClientTask(taskId);

  if (!CLIENT_EDITABLE_STATUSES.has(task.status)) redirect(`/ukol/${taskId}?error=locked`);

  const reason = optionalString(formData, "reason") || "Klient zrušil objednávku před výběrem taskera.";
  const senderName = user.user_metadata?.name || user.email || "Klient Taskovo";

  const { error: messageError } = await service.from("messages").insert({
    task_id: taskId,
    sender_auth_user_id: user.id,
    sender_role: "client",
    sender_name: senderName,
    body: `Objednávka byla zrušena klientem. Důvod: ${reason}`,
  });
  if (messageError) throw new Error(messageError.message);

  const { error } = await service.from("tasks").update({ status: "cancelled" }).eq("id", taskId);
  if (error) throw new Error(error.message);

  revalidateTaskViews(taskId);
  redirect("/dashboard?updated=task_cancelled");
}
