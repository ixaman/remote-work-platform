"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { requireSuperAdmin } from "../../../lib/auth";
import { createAdminClient } from "../../../lib/supabase/admin";
import { findAdmin } from "./data";
import { emptyState, isUserId, passwordError, validateAdmin, type FormState } from "./validation";

const base = "/admin/users";
const failure = "Unable to save the admin account. Please try again.";

export async function createAdmin(_previous: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireSuperAdmin();
  const state = validateAdmin(formData);
  if (Object.keys(state.errors).length) return { ...state, message: "Please correct the highlighted fields. Re-enter the password." };
  const password = formData.get("password") as string;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.createUser({
      email: state.values.email, password, email_confirm: true, user_metadata: { name: state.values.name },
    });
    if (error) {
      if (error.code === "email_exists" || error.code === "user_already_exists") {
        return { ...state, errors: { email: "An account with this email already exists." }, message: "Use another email address. Re-enter the password." };
      }
      return { ...state, message: failure };
    }
    if (!data.user) return { ...state, message: failure };
    let inserted = false;
    try {
      const { error: insertError } = await admin.from("admins").insert({
        user_id: data.user.id, ...state.values, role: "admin", created_by: user.id,
      });
      inserted = !insertError;
    } catch { /* Compensate for a failed database request below. */ }
    if (!inserted) {
      // Delete only the Auth user just created, even if the insert threw.
      try {
        const { error: cleanupError } = await admin.auth.admin.deleteUser(data.user.id);
        if (cleanupError) return { ...state, message: "Account setup failed and cleanup could not complete. Review Supabase Auth before retrying." };
      } catch {
        return { ...state, message: "Account setup failed and cleanup could not complete. Review Supabase Auth before retrying." };
      }
      return { ...state, message: failure };
    }
  } catch { return { ...state, message: failure }; }
  revalidatePath(base);
  redirect(`${base}?notice=created`);
}

export async function setAdminPassword(id: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireSuperAdmin();
  const { data: target, error } = await findAdmin(supabase, id);
  if (error || !target) return { ...emptyState, message: failure };
  if (target.role !== "admin" || target.user_id === user.id) redirect(`${base}?error=protected`);
  const raw = formData.get("password");
  const password = typeof raw === "string" ? raw : "";
  const validationError = passwordError(password, target.email);
  if (validationError) return { ...emptyState, errors: { password: validationError }, message: "Please correct the password." };
  try {
    const admin = createAdminClient();
    const { error: updateError } = await admin.auth.admin.updateUserById(target.user_id, { password });
    if (updateError) return { ...emptyState, message: failure };
  } catch { return { ...emptyState, message: failure }; }
  revalidatePath(base);
  redirect(`${base}?notice=password`);
}

export async function removeAdmin(formData: FormData) {
  const { supabase, user } = await requireSuperAdmin();
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw : "";
  if (!isUserId(id)) notFound();
  const { data: target, error } = await findAdmin(supabase, id);
  if (error || !target) redirect(`${base}?error=remove`);
  if (target.role !== "admin" || target.user_id === user.id) redirect(`${base}?error=protected`);
  const destination = `${base}/${id}/remove`;
  if (formData.get("confirmation") !== "remove") redirect(`${destination}?error=confirm`);
  let failed = false;
  try {
    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(target.user_id);
    failed = Boolean(deleteError);
  } catch { failed = true; }
  if (failed) redirect(`${destination}?error=remove`);
  revalidatePath(base);
  redirect(`${base}?notice=removed`);
}
