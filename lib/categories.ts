import "server-only";
import { createPublicClient } from "./supabase/public";
import type { Category, Job, PublicJob } from "./types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const message = "Something went wrong loading jobs. Please try again.";
type JoinedJob = Job & { category: Category };

async function read<T>(operation: () => PromiseLike<{ data: T; error: unknown }>): Promise<T> {
  try {
    const { data, error } = await operation();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Public Supabase read failed:", error);
    throw new Error(message);
  }
}

function publicJob({ category, ...job }: JoinedJob): PublicJob {
  return { ...job, category_slug: category.slug };
}

function jobsQuery() {
  return createPublicClient().from("jobs")
    .select("*, category:categories!inner(*)", { count: "exact" })
    .eq("status", "published").eq("category.status", "published")
    .order("created_at", { ascending: false }).order("id");
}

export async function getJobById(id: string) {
  if (!uuid.test(id)) return null;
  const job = await read(() => jobsQuery().eq("id", id).maybeSingle<JoinedJob>());
  return job ? { ...publicJob(job), category: job.category } : null;
}

export async function getCategoryBySlug(slug: string) {
  const category = await read(() => createPublicClient().from("categories").select("*")
    .eq("status", "published").eq("slug", slug).maybeSingle<Category>());
  return category ?? undefined;
}

export async function getJobsByCategory(slug: string): Promise<PublicJob[]> {
  const jobs: PublicJob[] = [];
  // Fetch every page so category totals and homepage previews aren't capped by PostgREST.
  for (let offset = 0; ; offset += 1000) {
    const rows = await read(() => jobsQuery().eq("category.slug", slug)
      .range(offset, offset + 999).returns<JoinedJob[]>());
    jobs.push(...(rows ?? []).map(publicJob));
    if ((rows?.length ?? 0) < 1000) return jobs;
  }
}

export async function getAllCategories() {
  type CountedCategory = Category & { jobs: { count: number }[] };
  const categories: (Category & { jobCount: number })[] = [];
  for (let offset = 0; ; offset += 1000) {
    const rows = await read(() => createPublicClient().from("categories")
      .select("*, jobs(count)").eq("status", "published").eq("jobs.status", "published")
      .order("sort_order").order("name").range(offset, offset + 999).returns<CountedCategory[]>());
    categories.push(...(rows ?? []).map(({ jobs, ...category }) => ({ ...category, jobCount: jobs[0]?.count ?? 0 })));
    if ((rows?.length ?? 0) < 1000) return categories;
  }
}

export async function getCategories() {
  return (await getAllCategories()).slice(0, 4);
}

export async function getLatestJobs() {
  const jobs = await read(() => jobsQuery().limit(5).returns<JoinedJob[]>());
  return (jobs ?? []).map(publicJob);
}

export async function getAllJobs({ category, page = 1, pageSize = 12 }: {
  category?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const activeCategory = category ? await getCategoryBySlug(category) : undefined;
  const size = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 12;
  const query = () => {
    const result = jobsQuery();
    return activeCategory ? result.eq("category.slug", activeCategory.slug) : result;
  };
  const total = await read(async () => {
    const { count, error } = await query().limit(0);
    return { data: count ?? 0, error };
  });
  const pageCount = Math.max(1, Math.ceil(total / size));
  const currentPage = Math.min(Number.isSafeInteger(page) && page > 0 ? page : 1, pageCount);
  const jobs = await read(() => query().range((currentPage - 1) * size, currentPage * size - 1).returns<JoinedJob[]>());
  return { jobs: (jobs ?? []).map(publicJob), total, page: currentPage, pageCount };
}
