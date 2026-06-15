import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

function safeNextPath(request: NextRequest, next: string | null) {
  if (!next) return "/dashboard";

  if (next.startsWith("/")) return next;

  try {
    const parsed = new URL(next);
    if (parsed.origin === request.nextUrl.origin) return `${parsed.pathname}${parsed.search}`;
  } catch {
    return "/dashboard";
  }

  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(request, request.nextUrl.searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) redirect(next);
  }

  redirect("/prihlaseni?mode=login&error=email_confirm");
}
