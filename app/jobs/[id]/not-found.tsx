import SiteHeader from "../../site-header";
import SiteFooter from "../../site-footer";
import styles from "../../categories/[slug]/page.module.css";

export default function JobNotFound() {
  return (
    <>
      <a className="skip-link" href="#job-content">Skip to content</a>
      <SiteHeader homeLinks />
      <main id="job-content" className={`hero ${styles.pageHeader}`} tabIndex={-1}>
        <div className="container">
          <p className="eyebrow">Job listing</p>
          <h1>Job not found</h1>
          <p>The job you’re looking for is not available.</p>
          <a className="guidance-link" href="/jobs">← Back to all jobs</a>
        </div>
      </main>
      <SiteFooter homeLinks />
    </>
  );
}
