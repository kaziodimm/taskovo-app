export type TaskStatus =
  | "pending_review"
  | "open"
  | "offers_received"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "disputed";

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  district: string | null;
  budget_czk: number;
  desired_time: string;
  client_name: string;
  client_contact?: string;
  status: TaskStatus;
  created_at: string;
};

export type Offer = {
  id: string;
  task_id: string;
  tasker_name: string;
  tasker_contact?: string;
  price_czk: number;
  message: string;
  status: string;
  created_at: string;
};

export type TaskerProfile = {
  id: string;
  name: string;
  city: string;
  categories: string;
  contact?: string;
  bio: string | null;
  verified: boolean;
  created_at: string;
};
