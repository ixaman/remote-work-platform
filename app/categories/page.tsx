import type { Metadata } from "next";
import { getAllCategories } from "../../lib/categories";
import SiteHeader from "../site-header";
import SiteFooter from "../site-footer";
import pageStyles from "./[slug]/page.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Job Categories | Real Work From Home Jobs",
  description: "Explore all published remote job categories and see how many jobs are available in each.",
};

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <>
      <a className="skip-link" href="#categories-content">Skip to content</a>
      <SiteHeader homeLinks />
      <main id="categories-content" tabIndex={-1}>
        <header className={`hero ${pageStyles.pageHeader}`}>
          <div className="container">
            <p className="eyebrow">Job categories</p>
            <h1>Browse all job categories</h1>
            <p className="section-introduction">Explore remote job categories and find the opportunities that fit.</p>
          </div>
        </header>
        <section className={pageStyles.listings} aria-labelledby="all-categories-title">
          <div className="container">
            <a className={`guidance-link ${pageStyles.backLink}`} href="/">← Back to home</a>
            <h2 id="all-categories-title" className="sr-only">Job categories</h2>
            {categories.length > 0 ? (
              <div className={styles.grid}>
                {categories.map((category) => (
                  <article key={category.slug} className="category-card">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <p>{category.jobCount} {category.jobCount === 1 ? "job" : "jobs"}</p>
                    <a className="guidance-link" href={`/categories/${category.slug}`}>View jobs<span className="sr-only">: {category.name}</span></a>
                  </article>
                ))}
              </div>
            ) : (
              <p className="job-card empty-state">No job categories yet.</p>
            )}
          </div>
        </section>
      </main>
      <SiteFooter homeLinks />
    </>
  );
}
