import { unstable_noStore as noStore } from "next/cache";
import { createServiceSupabaseClient, hasSupabaseEnv } from "./supabase";

type MessageRow = {
  task_id: string;
  created_at: string;
  sender_auth_user_id: string | null;
};

type MessageReadRow = {
  task_id: string;
  last_read_at: string;
};

export async function getUnreadTaskMessageCounts(taskIds: string[], authUserId: string): Promise<Record<string, number>> {
  noStore();

  if (!taskIds.length || !authUserId || !hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return {};

  const supabase = createServiceSupabaseClient();
  const [{ data: messages, error: messagesError }, { data: reads, error: readsError }] = await Promise.all([
    supabase.from("messages").select("task_id,created_at,sender_auth_user_id").in("task_id", taskIds),
    supabase.from("message_reads").select("task_id,last_read_at").eq("auth_user_id", authUserId).in("task_id", taskIds),
  ]);

  if (messagesError) {
    console.error(messagesError);
    return {};
  }

  if (readsError) {
    console.error(readsError);
    return {};
  }

  const readByTask = new Map((reads as MessageReadRow[] | null || []).map((read) => [read.task_id, new Date(read.last_read_at).getTime()]));

  return (messages as MessageRow[] | null || []).reduce<Record<string, number>>((counts, message) => {
    if (message.sender_auth_user_id === authUserId) return counts;

    const lastReadAt = readByTask.get(message.task_id) || 0;
    if (new Date(message.created_at).getTime() <= lastReadAt) return counts;

    counts[message.task_id] = (counts[message.task_id] || 0) + 1;
    return counts;
  }, {});
}
