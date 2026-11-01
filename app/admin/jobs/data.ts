import "server-only";
import { notFound } from "next/navigation";
import type { requireAdmin } from "../../../lib/auth";
import type { Category, Job } from "../../../lib/types";
import { isId } from "./validation";

type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
export type CategoryOption = Pick<Category, "id" | "name" | "slug" | "status">;
export type AdminJob = Job & { category: CategoryOption | null };
const columns = "*, category:categories(id, name, slug, status)";

export async function query<T>(operation: PromiseLike<{ data: T; error: { code?: string } | null }>) {
  try {
    const result = await operation;
    if (result.error) console.error("Admin job query failed:", result.error);
    return result;
  } catch (error) {
    console.error("Admin job query failed:", error);
    return { data: null, error: { code: "request_failed" } };
  }
}

export async function findJob(supabase: AdminClient, rawId: string) {
  const id = rawId.trim();
  if (!isId(id)) notFound();
  const result = await query(supabase.from("jobs").select(columns).eq("id", id).maybeSingle<AdminJob>());
  if (!result.error && !result.data) notFound();
  return result;
}

export async function categoryOptions(supabase: AdminClient) {
  const categories: CategoryOption[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await query(supabase.from("categories").select("id, name, slug, status")
      .order("sort_order").order("name").order("id").range(offset, offset + 999).returns<CategoryOption[]>());
    if (result.error) return null;
    categories.push(...(result.data ?? []));
    if ((result.data?.length ?? 0) < 1000) return categories;
  }
}

export async function listJobs(supabase: AdminClient, status: string, category: string, page: number) {
  let request = supabase.from("jobs").select(columns);
  if (status !== "all") request = request.eq("status", status);
  if (category) request = request.eq("category_id", category);
  // One extra row determines Next without a second count query.
  return query(request.order("created_at", { ascending: false }).order("id", { ascending: false })
    .range((page - 1) * 20, page * 20).returns<AdminJob[]>());
}
