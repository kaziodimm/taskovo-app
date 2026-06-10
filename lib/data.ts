import { unstable_noStore as noStore } from "next/cache";
import { demoOffers, demoTaskers, demoTasks } from "./demo-data";
import { createServiceSupabaseClient, hasSupabaseEnv } from "./supabase";
import type { ClientProfile, Offer, Task, TaskAttachment, TaskerProfile, TaskMessage } from "./types";

const listVisibleStatuses = ["open", "offers_received", "assigned", "in_progress", "awaiting_confirmation", "completed"];
const detailVisibleStatuses = ["open", "offers_received", "assigned", "in_progress", "awaiting_confirmation", "completed", "cancelled", "disputed"];
const adminVisibleStatuses = ["pending_review", "open", "offers_received", "assigned", "in_progress", "awaiting_confirmation", "completed", "cancelled", "disputed"];
const taskerVisibleStatuses = ["open", "offers_received"];
const activeAssignedStatuses = ["assigned", "in_progress", "awaiting_confirmation", "completed", "disputed", "cancelled"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getTasks(): Promise<Task[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoTasks;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").in("status", listVisibleStatuses).order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return demoTasks;
  }

  return data as Task[];
}

export async function getAdminTasks(): Promise<Task[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoTasks;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").in("status", adminVisibleStatuses).order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return demoTasks;
  }

  return data as Task[];
}

export async function getTaskById(taskId: string): Promise<Task | null> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoTasks.find((task) => task.id === taskId) || null;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).in("status", detailVisibleStatuses).maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Task | null;
}

export async function getAdminTaskById(taskId: string): Promise<Task | null> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoTasks.find((task) => task.id === taskId) || null;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).in("status", adminVisibleStatuses).maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Task | null;
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

export async function getAssignedTasksForTasker(taskerAuthUserId: string): Promise<Task[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasks").select("*").eq("assigned_tasker_auth_user_id", taskerAuthUserId).in("status", activeAssignedStatuses).order("created_at", { ascending: false });

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

export async function getOffersForTask(taskId: string): Promise<Offer[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoOffers.filter((offer) => offer.task_id === taskId);

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("offers").select("*").eq("task_id", taskId).order("created_at");

  if (error) {
    console.error(error);
    return [];
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

export async function getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("task_attachments").select("*").eq("task_id", taskId).order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data as TaskAttachment[];
}

export async function getTaskMessages(taskId: string): Promise<TaskMessage[]> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("messages").select("*").eq("task_id", taskId).order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data as TaskMessage[];
}

export async function getTaskMessageCounts(taskIds: string[]): Promise<Record<string, number>> {
  noStore();

  if (!taskIds.length || !hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return {};

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("messages").select("task_id").in("task_id", taskIds);

  if (error) {
    console.error(error);
    return {};
  }

  return (data || []).reduce<Record<string, number>>((counts, message) => {
    counts[message.task_id] = (counts[message.task_id] || 0) + 1;
    return counts;
  }, {});
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

export async function getTaskerById(taskerId: string): Promise<TaskerProfile | null> {
  noStore();

  const demoTasker = demoTaskers.find((tasker) => tasker.id === taskerId) || null;
  if (demoTasker || !uuidPattern.test(taskerId)) return demoTasker;
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("tasker_profiles").select("*").eq("id", taskerId).maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as TaskerProfile | null;
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

export async function getClientById(clientId: string): Promise<ClientProfile | null> {
  noStore();

  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("client_profiles").select("*").eq("id", clientId).maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data as ClientProfile | null;
}
