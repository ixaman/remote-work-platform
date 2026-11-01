import "server-only";
import { notFound } from "next/navigation";
import type { requireAdmin } from "../../../lib/auth";
import type { Category } from "../../../lib/types";
import { isCategoryId } from "./validation";

type AdminClient = Awaited<ReturnType<typeof requireAdmin>>["supabase"];
export type CountedCategory = Category & { jobs: { count: number }[] };

// Preserve database error codes for friendly action errors, including FK races.
export async function query<T>(operation: PromiseLike<{ data: T; error: { code?: string } | null }>) {
  try {
    const result = await operation;
    if (result.error) console.error("Admin category query failed:", result.error);
    return result;
  } catch (error) {
    console.error("Admin category query failed:", error);
    return { data: null, error: { code: "request_failed" } };
  }
}

export async function findCategory(supabase: AdminClient, rawId: string) {
  const id = rawId.trim();
  if (!isCategoryId(id)) notFound();
  const result = await query(supabase.from("categories").select("*").eq("id", id).maybeSingle<Category>());
  if (!result.error && !result.data) notFound();
  return result;
}

export async function listCategories(supabase: AdminClient) {
  const categories: CountedCategory[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await query(supabase.from("categories").select("*, jobs(count)")
      .order("sort_order").order("name").order("id").range(offset, offset + 999).returns<CountedCategory[]>());
    if (result.error) return null;
    categories.push(...(result.data ?? []));
    if ((result.data?.length ?? 0) < 1000) return categories;
  }
}

export async function countJobs(supabase: AdminClient, id: string) {
  try {
    const { count, error } = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (error) console.error("Admin category job count failed:", error);
    return error || count === null ? null : count;
  } catch (error) {
    console.error("Admin category job count failed:", error);
    return null;
  }
}
