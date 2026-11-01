"use server";

import { redirect } from "next/navigation";
import { adminDestination, requireAdmin } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";

export async function signIn(formData: FormData) {
  const next = adminDestination(formData.get("next"));
  const invalid = `/login?error=invalid&next=${encodeURIComponent(next)}`;
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) redirect(invalid);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) redirect(invalid);
  await requireAdmin();
  redirect(next);
}
