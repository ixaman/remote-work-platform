import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getJobById } from "../../../lib/categories";
import SiteHeader from "../../site-header";
import SiteFooter from "../../site-footer";
import pageStyles from "../../categories/[slug]/page.module.css";
import styles from "./page.module.css";

type JobPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: JobPageProps): Promise<Metadata> {
  const job = await getJobById((await params).id);
  if (!job) notFound();
  return { title: `${job.title} at ${job.company_source} | Real Work From Home Jobs` };
}

export default async function JobPage({ params }: JobPageProps) {
  const job = await getJobById((await params).id);
  if (!job) notFound();
  const categoryHref = `/categories/${encodeURIComponent(job.category.slug)}`;
  const applyLink = (
    <a className="button" href={job.application_url} target="_blank" rel="noopener noreferrer">
      Apply now<span className="sr-only"> for {job.title} (opens in a new tab)</span>
    </a>
  );

  return (
    <>
      <a className="skip-link" href="#job-content">Skip to content</a>
      <SiteHeader homeLinks />
      <main id="job-content" className={styles.page} tabIndex={-1}>
        <header className={`hero ${pageStyles.pageHeader}`}>
          <div className="container">
            <p className="eyebrow"><a className="guidance-link" href={categoryHref}>{job.category.name}</a></p>
            <h1>{job.title}</h1>
            <p className={`section-introduction ${styles.meta}`}>{job.company_source} · {job.location_eligibility}</p>
            <p className={pageStyles.count}>Posted <time dateTime={job.created_at}>{new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(job.created_at))}</time></p>
          </div>
        </header>
        <div className={`container ${styles.content}`}>
          <aside className={`job-card ${styles.details}`} aria-label="Job details">
            <div className={styles.primaryApply}>{applyLink}</div>
            <dl className={`job-details ${styles.detailList}`}>
              <div><dt>Company/source</dt><dd>{job.company_source}</dd></div>
              <div><dt>Category</dt><dd><a className="guidance-link" href={categoryHref}>{job.category.name}</a></dd></div>
              <div><dt>Location/eligibility</dt><dd>{job.location_eligibility}</dd></div>
            </dl>
          </aside>
          <article className={styles.description} aria-labelledby="description-title">
            <a className={`guidance-link ${pageStyles.backLink}`} href="/jobs">← Back to all jobs</a>
            <h2 id="description-title">Job description</h2>
            <p className={styles.descriptionText}>{job.description}</p>
            {applyLink}
          </article>
        </div>
      </main>
      <SiteFooter homeLinks />
    </>
  );
}
