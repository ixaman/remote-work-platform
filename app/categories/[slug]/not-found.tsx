import SiteHeader from "../../site-header";
import SiteFooter from "../../site-footer";
import styles from "./page.module.css";

export default function CategoryNotFound() {
  return (
    <>
      <a className="skip-link" href="#category-content">Skip to content</a>
      <SiteHeader homeLinks />
      <main id="category-content" className={`hero ${styles.pageHeader}`} tabIndex={-1}>
        <div className="container">
          <p className="eyebrow">Job category</p>
          <h1>Category not found</h1>
          <p>The category you’re looking for is not available.</p>
          <a className="guidance-link" href="/#job-categories">← Back to categories</a>
        </div>
      </main>
      <SiteFooter homeLinks />
    </>
  );
}
