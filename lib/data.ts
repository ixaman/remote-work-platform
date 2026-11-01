import { categories, jobs } from "./fixtures";
export type { Category, Job } from "./fixtures";

function publishedJobs() {
  const slugs = new Set(categories.filter((category) => category.status === "published").map((category) => category.slug));
  return jobs.filter((job) => job.status === "published" && slugs.has(job.category_slug))
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id));
}

export function getCategories() {
  const published = publishedJobs();
  return categories.filter((category) => category.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((category) => ({ ...category, jobCount: published.filter((job) => job.category_slug === category.slug).length }));
}

export function getJobsByCategory(slug: string) {
  return publishedJobs().filter((job) => job.category_slug === slug);
}

export function getLatestJobs(n: number) {
  return publishedJobs().slice(0, Math.max(0, Math.floor(n)));
}
