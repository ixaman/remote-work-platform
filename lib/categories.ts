import { categories, jobs } from "./fixtures";

// Keep public category reads here so the fixture source can be replaced by Supabase.
export async function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug && category.status === "published");
}

export async function getJobsByCategory(slug: string) {
  if (!(await getCategoryBySlug(slug))) return [];
  return jobs.filter((job) => job.category_slug === slug && job.status === "published");
}

export async function getAllCategories() {
  const publishedCategories = categories.filter((category) => category.status === "published")
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "en"));

  return Promise.all(publishedCategories.map(async (category) => ({
    ...category,
    jobCount: (await getJobsByCategory(category.slug)).length,
  })));
}


export async function getAllJobs({ category, page = 1, pageSize = 12 }: {
  category?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  const publishedSlugs = new Set(categories.filter((item) => item.status === "published").map((item) => item.slug));
  const activeCategory = category && publishedSlugs.has(category) ? category : undefined;
  const matchingJobs = jobs.filter((job) => job.status === "published"
    && publishedSlugs.has(job.category_slug)
    && (!activeCategory || job.category_slug === activeCategory))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || a.id.localeCompare(b.id));
  const size = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 12;
  const pageCount = Math.max(1, Math.ceil(matchingJobs.length / size));
  const currentPage = Math.min(Number.isSafeInteger(page) && page > 0 ? page : 1, pageCount);

  return {
    jobs: matchingJobs.slice((currentPage - 1) * size, currentPage * size),
    total: matchingJobs.length,
    page: currentPage,
    pageCount,
  };
}
