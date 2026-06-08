import { unstable_noStore as noStore } from "next/cache";
import { demoOffers, demoTaskers, demoTasks } from "./demo-data";
import { createServiceSupabaseClient, hasSupabaseEnv } from "./supabase";
import type { ClientProfile, Offer, Task, TaskerProfile } from "./types";

const visibleStatuses = ["open", "offers_received", "assigned", "in_progress", "completed"];
const taskerVisibleStatuses = ["open", "offers_received"];

export async function getTasks(): Promise<Task[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoTasks;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").in("status", visibleStatuses).order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return demoTasks;
  }

  return data as Task[];
}

export async function getOpenTasksForTaskers(): Promise<Task[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoTasks;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").in("status", taskerVisibleStatuses).order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Task[];
}

export async function getTasksForClient(clientAuthUserId: string): Promise<Task[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").eq("client_auth_user_id", clientAuthUserId).order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Task[];
}

export async function getOffers(): Promise<Offer[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoOffers;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("offers").select("*").order("created_at");

  if (error) {
    console.error(error);
    return demoOffers;
  }

  return data as Offer[];
}

export async function getOffersForTasker(taskerAuthUserId: string): Promise<Offer[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("offers").select("*").eq("tasker_auth_user_id", taskerAuthUserId).order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Offer[];
}

export async function getTaskers(): Promise<TaskerProfile[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoTaskers;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasker_profiles").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return demoTaskers;
  }

  return data as TaskerProfile[];
}

export async function getTaskerProfileForUser(authUserId: string): Promise<TaskerProfile | null> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasker_profiles").select("*").eq("auth_user_id", authUserId).order("created_at", { ascending: false }).limit(1).maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as TaskerProfile | null;
}

export async function getClients(): Promise<ClientProfile[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("client_profiles").select("*").order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as ClientProfile[];
}
