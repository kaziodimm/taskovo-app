"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient, createServiceSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) throw new Error(`Missing field: ${key}`);
  return value.trim();
}

function optionalString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalImageUrl(formData: FormData) {
  const value = optionalString(formData, "avatar_url");
  if (!value) return null;

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function avatarReviewPayload(avatarUrl: string | null) {
  if (!avatarUrl) return {};

  return {
    pending_avatar_url: avatarUrl,
    avatar_review_status: "pending",
    avatar_review_note: null,
  };
}

export async function updateClientOwnProfile(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/dashboard?error=config");

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role === "tasker") redirect("/poskytovatel/dashboard");

  const name = requiredString(formData, "name");
  const phone = optionalString(formData, "phone");
  const city = optionalString(formData, "city");
  const preferredLanguage = optionalString(formData, "preferred_language") || "cs";
  const marketingConsent = formData.get("marketing_consent") === "on";
  const avatarUrl = optionalImageUrl(formData);
  const service = createServiceSupabaseClient();

  const payload = {
    auth_user_id: user.id,
    name,
    email: user.email || "",
    phone,
    city,
    preferred_language: preferredLanguage,
    marketing_consent: marketingConsent,
    password_auth_enabled: true,
    ...avatarReviewPayload(avatarUrl),
  };

  const { data: existing, error: existingError } = await service.from("client_profiles").select("id").eq("auth_user_id", user.id).maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const { error } = existing
    ? await service.from("client_profiles").update(payload).eq("id", existing.id)
    : await service.from("client_profiles").insert(payload);

  if (error) throw new Error(error.message);

  const metadata = { ...(user.user_metadata || {}), name, role: "client" };
  await service.auth.admin.updateUserById(user.id, { user_metadata: metadata });

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  redirect("/dashboard?updated=profile");
}

export async function updateTaskerOwnProfile(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/poskytovatel/dashboard?error=config");

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/prihlaseni?error=login_required");
  if (user.user_metadata?.role !== "tasker") redirect("/dashboard");

  const name = requiredString(formData, "name");
  const city = requiredString(formData, "city");
  const categories = requiredString(formData, "categories");
  const contact = optionalString(formData, "contact") || user.email || null;
  const bio = optionalString(formData, "bio");
  const avatarUrl = optionalImageUrl(formData);
  const service = createServiceSupabaseClient();

  const payload = {
    auth_user_id: user.id,
    email: user.email || null,
    name,
    city,
    categories,
    contact,
    bio,
    password_auth_enabled: true,
    ...avatarReviewPayload(avatarUrl),
  };

  const { data: existing, error: existingError } = await service.from("tasker_profiles").select("id").eq("auth_user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existingError) throw new Error(existingError.message);

  const { error } = existing
    ? await service.from("tasker_profiles").update(payload).eq("id", existing.id)
    : await service.from("tasker_profiles").insert(payload);

  if (error) throw new Error(error.message);

  const metadata = { ...(user.user_metadata || {}), name, role: "tasker" };
  await service.auth.admin.updateUserById(user.id, { user_metadata: metadata });

  revalidatePath("/poskytovatel/dashboard");
  revalidatePath("/taskeri");
  revalidatePath("/taskers");
  revalidatePath("/poskytovatele");
  revalidatePath("/admin");
  redirect("/poskytovatel/dashboard?updated=profile");
}

export async function submitProfilePhotoForReview(formData: FormData) {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) redirect("/profil/foto?error=config");

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/prihlaseni?error=login_required");

  const avatarUrl = optionalImageUrl(formData);
  if (!avatarUrl) redirect("/profil/foto?error=bad_url");

  const service = createServiceSupabaseClient();
  const table = user.user_metadata?.role === "tasker" ? "tasker_profiles" : "client_profiles";
  const { data: profile, error: profileError } = await service.from(table).select("id").eq("auth_user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (profileError) throw new Error(profileError.message);
  if (!profile) redirect(user.user_metadata?.role === "tasker" ? "/poskytovatel/dashboard?error=profile_missing" : "/dashboard?error=profile_missing");

  const { error } = await service
    .from(table)
    .update({
      pending_avatar_url: avatarUrl,
      avatar_review_status: "pending",
      avatar_review_note: null,
    })
    .eq("id", profile.id);
  if (error) throw new Error(error.message);

  revalidatePath("/profil/foto");
  revalidatePath("/admin");
  redirect("/profil/foto?updated=photo_pending");
}
