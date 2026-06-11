"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

function revalidateTaskViews(taskId: string) {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/admin");
}

export async function createTaskerOffer(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/tasks?error=config");

  const taskId = requiredString(formData, "task_id");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?mode=tasker&error=login_required");
  if (user.user_metadata?.role !== "tasker") redirect("/tasks?error=tasker_required");

  const service = createServiceSupabaseClient();
  const [{ data: task, error: taskError }, { data: profile, error: profileError }] = await Promise.all([
    service.from("tasks").select("id,status,client_auth_user_id").eq("id", taskId).maybeSingle(),
    service.from("tasker_profiles").select("id,name,contact,email").eq("auth_user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  if (taskError) throw new Error(taskError.message);
  if (profileError) throw new Error(profileError.message);
  if (!task) redirect("/tasks?error=task_missing");
  if (!["open", "offers_received"].includes(task.status)) redirect(`/ukol/${taskId}?error=status`);
  if (task.client_auth_user_id === user.id) redirect(`/ukol/${taskId}?error=own_task`);
  if (!profile) redirect("/poskytovatel/dashboard?error=profile_required");

  const { error } = await service.from("offers").insert({
    task_id: taskId,
    tasker_auth_user_id: user.id,
    tasker_profile_id: profile.id,
    tasker_name: profile.name || user.user_metadata?.name || user.email || "Tasker Taskovo",
    tasker_contact: profile.contact || profile.email || user.email || "kontakt po přihlášení",
    price_czk: Number(requiredString(formData, "price_czk")),
    message: requiredString(formData, "message"),
  });

  if (error) throw new Error(error.message);

  await service.from("tasks").update({ status: "offers_received" }).eq("id", taskId);
  revalidateTaskViews(taskId);
  redirect("/poskytovatel/dashboard");
}
