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
  client_auth_user_id?: string | null;
  accepted_offer_id?: string | null;
  assigned_tasker_auth_user_id?: string | null;
  assigned_tasker_profile_id?: string | null;
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
  tasker_auth_user_id?: string | null;
  tasker_profile_id?: string | null;
  tasker_name: string;
  tasker_contact?: string;
  price_czk: number;
  message: string;
  status: string;
  created_at: string;
};

export type TaskAttachment = {
  id: string;
  task_id: string;
  image_url: string;
  storage_path?: string | null;
  caption: string | null;
  created_by_auth_user_id?: string | null;
  created_at: string;
};

export type TaskerProfile = {
  id: string;
  auth_user_id?: string | null;
  email?: string | null;
  name: string;
  city: string;
  categories: string;
  contact?: string;
  bio: string | null;
  verified: boolean;
  password_auth_enabled?: boolean;
  created_at: string;
};

export type ClientProfile = {
  id: string;
  auth_user_id?: string | null;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  preferred_language: string;
  marketing_consent: boolean;
  password_auth_enabled?: boolean;
  created_at: string;
};
