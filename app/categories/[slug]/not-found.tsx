import SiteHeader from "../../site-header";
import SiteFooter from "../../site-footer";

export default function CategoryNotFound() {
  return <>
    <a className="skip-link" href="#not-found">Skip to content</a>
    <SiteHeader />
    <main id="not-found" className="category-page container" tabIndex={-1}>
      <h1>Category not found.</h1>
      <p>This category is not available. Explore the published categories for more jobs.</p>
      <a className="button" href="/categories">Back to all categories</a>
    </main>
    <SiteFooter />
  </>;
}
