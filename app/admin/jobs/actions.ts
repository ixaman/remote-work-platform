"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "../../../lib/auth";
import { findJob, query, type CategoryOption } from "./data";
import { isId, validateJob, type FormState } from "./validation";

const base = "/admin/jobs";
const failure = "Unable to save the job. Please try again.";

function refresh(id: string, ...slugs: (string | undefined)[]) {
  revalidatePath("/admin");
  revalidatePath(base, "layout");
  revalidatePath("/admin/categories", "layout");
  for (const path of ["/", "/jobs", `/jobs/${id}`, "/categories"]) revalidatePath(path);
  for (const slug of new Set(slugs)) if (slug) revalidatePath(`/categories/${slug}`);
}

function saveError(state: FormState, code?: string): FormState {
  if (code === "23503") return { ...state, errors: { ...state.errors, category_id: "This category is no longer available. Choose another category." }, message: "Please correct the highlighted field." };
  if (code === "23514" || code === "23502" || code === "23505") return { ...state, message: "The job could not be saved because of a database constraint. Check the fields and try again." };
  return { ...state, message: failure };
}

async function selectedCategory(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], state: FormState) {
  const result = await query(supabase.from("categories").select("id, name, slug, status")
    .eq("id", state.values.category_id).maybeSingle<CategoryOption>());
  if (result.error) return { state: { ...state, message: failure }, category: null };
  if (!result.data) return { state: saveError(state, "23503"), category: null };
  return { state, category: result.data };
}

export async function createJob(_previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const state = validateJob(formData);
  if (Object.keys(state.errors).length) return { ...state, message: "Please correct the highlighted fields." };
  const selected = await selectedCategory(supabase, state);
  if (!selected.category) return selected.state;
  const { data, error } = await query(supabase.from("jobs").insert(state.values).select("id").single());
  if (error || !data) return saveError(state, error?.code);
  refresh(data.id, selected.category.slug);
  redirect(`${base}?notice=created`);
}

export async function updateJob(rawId: string, _previous: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = rawId.trim();
  const existing = await findJob(supabase, id);
  const state = validateJob(formData);
  if (existing.error || !existing.data) return { ...state, message: failure };
  if (Object.keys(state.errors).length) return { ...state, message: "Please correct the highlighted fields." };
  const selected = await selectedCategory(supabase, state);
  if (!selected.category) return selected.state;
  const { data, error } = await query(supabase.from("jobs").update(state.values).eq("id", id).select("id").maybeSingle());
  if (error) return saveError(state, error.code);
  if (!data) notFound();
  refresh(id, existing.data.category?.slug, selected.category.slug);
  redirect(`${base}?notice=updated`);
}

export async function setJobStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const rawId = formData.get("id");
  const rawStatus = formData.get("status");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  const status = typeof rawStatus === "string" ? rawStatus.trim() : "";
  if (!isId(id)) notFound();
  if (status !== "draft" && status !== "published") redirect(`${base}?error=status`);
  const existing = await findJob(supabase, id);
  if (existing.error || !existing.data) redirect(`${base}?error=status`);
  const { data, error } = await query(supabase.from("jobs").update({ status }).eq("id", id).select("id").maybeSingle());
  if (error) redirect(`${base}?error=status`);
  if (!data) notFound();
  refresh(id, existing.data.category?.slug);
  redirect(`${base}?notice=${status === "published" ? "published" : "drafted"}`);
}

export async function deleteJob(formData: FormData) {
  const { supabase } = await requireAdmin();
  const rawId = formData.get("id");
  const rawConfirmation = formData.get("confirmation");
  const id = typeof rawId === "string" ? rawId.trim() : "";
  const confirmation = typeof rawConfirmation === "string" ? rawConfirmation.trim() : "";
  if (!isId(id)) notFound();
  const destination = `${base}/${id}/delete`;
  if (confirmation !== "delete") redirect(`${destination}?error=confirm`);
  const existing = await findJob(supabase, id);
  if (existing.error || !existing.data) redirect(`${destination}?error=delete`);
  const { data, error } = await query(supabase.from("jobs").delete().eq("id", id).select("id").maybeSingle());
  if (error) redirect(`${destination}?error=delete`);
  if (!data) notFound();
  refresh(id, existing.data.category?.slug);
  redirect(`${base}?notice=deleted`);
}
