import SiteHeader from "../site-header";
import SiteFooter from "../site-footer";
import { getCategories } from "../../lib/data";

export default function CategoriesPage() {
  return <>
    <a className="skip-link" href="#categories">Skip to content</a>
    <SiteHeader />
    <main id="categories" className="category-page container" tabIndex={-1}>
      <a className="browse-link" href="/#job-categories">Back to home</a>
      <h1>Find jobs by category.</h1>
      <p>Explore all categories and find your next opportunity.</p>
      <div className="category-grid">{getCategories().map((category) =>
        <article key={category.slug} className="category-card">
          <h2><a className="category-route-link" href={`/categories/${category.slug}`}>{category.name}</a></h2>
          <p>{category.description}</p><p className="category-count">{category.jobCount} {category.jobCount === 1 ? "job" : "jobs"}</p>
        </article>
      )}</div>
    </main>
    <SiteFooter />
  </>;
}
