import { categories, jobs } from "./fixtures";

// Keep public category reads here so the fixture source can be replaced by Supabase.
export async function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug && category.status === "published");
}

export async function getJobsByCategory(slug: string) {
  if (!(await getCategoryBySlug(slug))) return [];
  return jobs.filter((job) => job.category_slug === slug && job.status === "published");
}
