"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

function revalidateOfferViews(taskId: string) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/poskytovatel/dashboard");
  revalidatePath(`/ukol/${taskId}`);
  revalidatePath("/admin");
}

export async function withdrawTaskerOffer(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/poskytovatel/dashboard?error=config");

  const offerId = requiredString(formData, "offer_id");
  const authSupabase = await createServerSupabaseClient();
  const { data: { user } } = await authSupabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role !== "tasker") redirect("/dashboard");

  const service = createServiceSupabaseClient();
  const { data: offer, error: offerError } = await service
    .from("offers")
    .select("id,task_id,tasker_auth_user_id,status")
    .eq("id", offerId)
    .maybeSingle();

  if (offerError) throw new Error(offerError.message);
  if (!offer || offer.tasker_auth_user_id !== user.id) redirect("/poskytovatel/dashboard?error=forbidden");
  if (offer.status !== "pending") redirect("/poskytovatel/dashboard?error=offer_locked");

  const { data: task, error: taskError } = await service
    .from("tasks")
    .select("id,status,accepted_offer_id")
    .eq("id", offer.task_id)
    .maybeSingle();

  if (taskError) throw new Error(taskError.message);
  if (!task || task.accepted_offer_id === offer.id || ["assigned", "in_progress", "awaiting_confirmation", "completed"].includes(task.status)) {
    redirect("/poskytovatel/dashboard?error=offer_locked");
  }

  const { error: deleteError } = await service.from("offers").delete().eq("id", offer.id);
  if (deleteError) throw new Error(deleteError.message);

  const { count, error: countError } = await service
    .from("offers")
    .select("id", { count: "exact", head: true })
    .eq("task_id", offer.task_id)
    .eq("status", "pending");

  if (countError) throw new Error(countError.message);

  if (!count && task.status === "offers_received") {
    const { error: taskUpdateError } = await service.from("tasks").update({ status: "open" }).eq("id", task.id);
    if (taskUpdateError) throw new Error(taskUpdateError.message);
  }

  revalidateOfferViews(offer.task_id);
  redirect("/poskytovatel/dashboard?updated=offer_withdrawn");
}
