import type { Metadata } from "next";
import { getAllCategories, getAllJobs } from "../../lib/categories";
import JobCard from "../job-card";
import SiteHeader from "../site-header";
import SiteFooter from "../site-footer";
import pageStyles from "../categories/[slug]/page.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Remote Jobs | Real Work From Home Jobs",
  description: "Browse all published remote jobs by category and find the opportunities that fit.",
};

type JobsPageProps = {
  searchParams: Promise<{ category?: string | string[]; page?: string | string[] }>;
};

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const query = await searchParams;
  const categories = await getAllCategories();
  const category = categories.find((item) => item.slug === query.category);
  const requestedPage = typeof query.page === "string" && /^\d+$/.test(query.page) ? Number(query.page) : 1;
  const { jobs, total, page, pageCount } = await getAllJobs({ category: category?.slug, page: requestedPage, pageSize: 12 });
  const pageHref = (number: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category.slug);
    params.set("page", String(number));
    return `/jobs?${params}`;
  };

  return (
    <>
      <a className="skip-link" href="#jobs-content">Skip to content</a>
      <SiteHeader homeLinks />
      <main id="jobs-content" tabIndex={-1}>
        <header className={`hero ${pageStyles.pageHeader}`}>
          <div className="container">
            <p className="eyebrow">JOB LISTINGS</p>
            <h1>Browse all remote jobs</h1>
            <p className="section-introduction">Explore remote jobs and find the opportunities that fit.</p>
            <p className={pageStyles.count}>{total} {total === 1 ? "job" : "jobs"}</p>
          </div>
        </header>
        <section className={pageStyles.listings} aria-label="Remote job listings">
          <div className="container">
            <a className={`guidance-link ${pageStyles.backLink}`} href="/">← Back to home</a>
            <nav className={`category-filters ${styles.filters}`} aria-label="Filter jobs by category">
              <a className="filter-pill" href="/jobs" aria-current={!category ? "page" : undefined}>All</a>
              {categories.map((item) => (
                <a key={item.slug} className="filter-pill" href={`/jobs?category=${encodeURIComponent(item.slug)}`} aria-current={category?.slug === item.slug ? "page" : undefined}>{item.name}</a>
              ))}
            </nav>
            {jobs.length > 0 ? (
              <div className={pageStyles.grid}>
                {jobs.map((job) => <JobCard key={job.id} job={job} categoryName={categories.find((item) => item.slug === job.category_slug)?.name} />)}
              </div>
            ) : (
              <div className="job-card empty-state">
                <p>No jobs found.</p>
                <a className="guidance-link" href="/jobs">All</a>
              </div>
            )}
            {pageCount > 1 && (
              <nav className={styles.pagination} aria-label="Job listing pages">
                {page > 1 && <a className="button button-outline" href={pageHref(page - 1)} rel="prev">Previous</a>}
                <span>Page {page} of {pageCount}</span>
                {page < pageCount && <a className="button button-outline" href={pageHref(page + 1)} rel="next">Next</a>}
              </nav>
            )}
          </div>
        </section>
      </main>
      <SiteFooter homeLinks />
    </>
  );
}
