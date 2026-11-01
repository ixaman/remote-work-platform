"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "../../lib/auth";

export async function signOut() {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error("Unable to sign out. Please try again.");
  redirect("/login");
}
