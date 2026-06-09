import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createServerSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

const ADMIN_COOKIE = "taskovo_admin";

export function adminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export function hasAdminConfig() {
  return Boolean(adminEmail());
}

export function isAdminEmail(email?: string | null) {
  return Boolean(email && adminEmail() && email.trim().toLowerCase() === adminEmail());
}

function hasLegacyAdminPassword() {
  return Boolean(adminEmail() && adminPassword());
}

function signature(email: string) {
  return createHmac("sha256", adminPassword()).update(email).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function validateAdminCredentials(email: string, password: string) {
  return hasLegacyAdminPassword() && isAdminEmail(email) && safeEqual(password, adminPassword());
}

export async function setAdminSession(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const token = Buffer.from(`${normalizedEmail}:${signature(normalizedEmail)}`).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

async function hasLegacyAdminSession() {
  if (!hasLegacyAdminPassword()) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  if (!token) return false;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const separatorIndex = decoded.lastIndexOf(":");
    if (separatorIndex === -1) return false;
    const email = decoded.slice(0, separatorIndex);
    const tokenSignature = decoded.slice(separatorIndex + 1);
    return isAdminEmail(email) && safeEqual(tokenSignature, signature(email));
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  if (!hasAdminConfig()) return false;

  if (hasSupabaseEnv()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (isAdminEmail(user?.email)) return true;
    } catch {
      // Fall back to the legacy admin cookie if Supabase auth cannot be read.
    }
  }

  return hasLegacyAdminSession();
}
