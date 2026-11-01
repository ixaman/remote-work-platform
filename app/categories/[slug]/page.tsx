import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getJobsByCategory } from "../../../lib/categories";
import JobCard from "../../job-card";
import SiteHeader from "../../site-header";
import SiteFooter from "../../site-footer";
import styles from "./page.module.css";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  return {
    title: `${category.name}${/\bjobs$/i.test(category.name) ? "" : " Jobs"} | Real Work From Home Jobs`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const jobs = await getJobsByCategory(slug);

  return (
    <>
      <a className="skip-link" href="#category-content">Skip to content</a>
      <SiteHeader homeLinks />
      <main id="category-content" tabIndex={-1}>
        <header className={`hero ${styles.pageHeader}`}>
          <div className="container">
            <p className="eyebrow">Job category</p>
            <h1>{category.name}</h1>
            <p className={`section-introduction ${styles.description}`}>{category.description}</p>
            <p className={styles.count}>{jobs.length} {jobs.length === 1 ? "job" : "jobs"}</p>
          </div>
        </header>
        <section className={styles.listings} aria-label={`${category.name} jobs`}>
          <div className="container">
            <a className={`guidance-link ${styles.backLink}`} href="/#job-categories">← Back to categories</a>
            {jobs.length > 0 ? (
              <div className={styles.grid}>
                {jobs.map((job) => <JobCard key={job.id} job={job} categoryName={category.name} />)}
              </div>
            ) : (
              <div className="job-card empty-state">
                <p>No jobs in this category yet.</p>
                <a className="guidance-link" href="/#job-categories">Back to categories</a>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter homeLinks />
    </>
  );
}
