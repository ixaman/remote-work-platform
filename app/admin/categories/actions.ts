"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/auth";
import { countJobs, findCategory, query } from "./data";
import { isCategoryId, validateCategory, type FormState } from "./validation";

const base = "/admin/categories";
const failure = "Unable to save the category. Please try again.";

function refresh() {
  revalidatePath("/admin");
  revalidatePath(base, "layout");
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/categories/[slug]", "page");
  revalidatePath("/jobs");
  revalidatePath("/jobs/[id]", "page");
}

function payload(state: FormState) {
  return { ...state.values, description: state.values.description || null, sort_order: Number(state.values.sort_order) };
}

function saveError(state: FormState, code?: string): FormState {
  return code === "23505"
    ? { ...state, errors: { slug: "That slug is already used" }, message: "Please correct the highlighted field." }
    : { ...state, message: failure };
}

export async function createCategory(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const state = validateCategory(formData);
  if (Object.keys(state.errors).length) return { ...state, message: "Please correct the highlighted fields." };
  const { error } = await query(supabase.from("categories").insert(payload(state)).select("id").single());
  if (error) return saveError(state, error.code);
  refresh();
  redirect(`${base}?notice=created`);
}

export async function updateCategory(rawId: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = rawId.trim();
  const existing = await findCategory(supabase, id);
  const state = validateCategory(formData);
  if (existing.error) return { ...state, message: failure };
  if (Object.keys(state.errors).length) return { ...state, message: "Please correct the highlighted fields." };
  const { data, error } = await query(supabase.from("categories").update(payload(state)).eq("id", id).select("id").maybeSingle());
  if (error) return saveError(state, error.code);
  if (!data) notFound();
  refresh();
  redirect(`${base}?notice=updated`);
}

export async function setCategoryStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const rawId = formData.get("id");
  const rawStatus = formData.get("status");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  const status = typeof rawStatus === "string" ? rawStatus.trim() : "";
  if (!isCategoryId(id)) notFound();
  if (status !== "draft" && status !== "published") redirect(`${base}?error=status`);
  const { data, error } = await query(supabase.from("categories").update({ status }).eq("id", id).select("id").maybeSingle());
  if (error) redirect(`${base}?error=status`);
  if (!data) notFound();
  refresh();
  redirect(`${base}?notice=${status === "published" ? "published" : "hidden"}`);
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const rawId = formData.get("id");
  const rawConfirmation = formData.get("confirmation");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  const confirmation = typeof rawConfirmation === "string" ? rawConfirmation.trim() : "";
  if (!isCategoryId(id)) notFound();
  const destination = `${base}/${id}/delete`;
  if (confirmation !== "delete") redirect(`${destination}?error=confirm`);
  const existing = await findCategory(supabase, id);
  if (existing.error) redirect(`${destination}?error=delete`);
  const count = await countJobs(supabase, id);
  if (count === null) redirect(`${destination}?error=delete`);
  if (count > 0) redirect(`${destination}?error=jobs`);
  const { data, error } = await query(supabase.from("categories").delete().eq("id", id).select("id").maybeSingle());
  if (error) redirect(`${destination}?error=${error.code === "23503" ? "jobs" : "delete"}`);
  if (!data) notFound();
  refresh();
  redirect(`${base}?notice=deleted`);
}
