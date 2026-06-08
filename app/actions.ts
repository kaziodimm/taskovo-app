"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing field: ${key}`);
  }
  return value.trim();
}

function titleFromDescription(description: string) {
  return description.length > 64 ? `${description.slice(0, 61)}...` : description;
}

export async function createTask(formData: FormData) {
  const description = requiredString(formData, "description");

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Supabase env missing; createTask skipped.");
    redirect("/tasks");
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("tasks").insert({
    title: titleFromDescription(description),
    description,
    category: requiredString(formData, "category"),
    city: requiredString(formData, "city"),
    district: formData.get("district")?.toString().trim() || null,
    budget_czk: Number(requiredString(formData, "budget_czk")),
    desired_time: requiredString(formData, "desired_time"),
    client_name: requiredString(formData, "client_name"),
    client_contact: requiredString(formData, "client_contact"),
    status: "open",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function createOffer(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Supabase env missing; createOffer skipped.");
    redirect("/tasks");
  }

  const taskId = requiredString(formData, "task_id");
  const supabase = createServiceSupabaseClient();

  const { error } = await supabase.from("offers").insert({
    task_id: taskId,
    tasker_name: requiredString(formData, "tasker_name"),
    tasker_contact: requiredString(formData, "tasker_contact"),
    price_czk: Number(requiredString(formData, "price_czk")),
    message: requiredString(formData, "message"),
  });

  if (error) throw new Error(error.message);

  await supabase.from("tasks").update({ status: "offers_received" }).eq("id", taskId);
  revalidatePath("/");
  revalidatePath("/tasks");
  redirect("/tasks");
}

export async function createTaskerProfile(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Supabase env missing; createTaskerProfile skipped.");
    redirect("/taskers");
  }

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("tasker_profiles").insert({
    name: requiredString(formData, "name"),
    city: requiredString(formData, "city"),
    categories: requiredString(formData, "categories"),
    contact: requiredString(formData, "contact"),
    bio: formData.get("bio")?.toString().trim() || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/taskers");
  revalidatePath("/admin");
  redirect("/taskers");
}
