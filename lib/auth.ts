import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

// Call on every admin layout, page, and Server Action; never rely on Proxy alone.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) {
    await supabase.auth.signOut({ scope: "local" });
    redirect("/login?error=forbidden");
  }
  return { user, supabase };
}

export function adminDestination(value: unknown): string {
  if (typeof value !== "string" || !/^\/admin(?:\/|\?|#|$)/.test(value)) return "/admin";
  // Reject URL normalization tricks, control characters, and encoded path separators.
  if (/[\\\u0000-\u0020\u007f]/.test(value) || /%(?:2f|5c|2e|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)) return "/admin";
  const parsed = new URL(value, "https://admin.invalid");
  if (parsed.origin !== "https://admin.invalid" || !/^\/admin(?:\/|$)/.test(parsed.pathname)) return "/admin";
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}
