import type { Job } from "../lib/fixtures";

export default function JobCard({ job, categoryName }: { job: Job; categoryName: string | undefined }) {
  return (
    <article className="job-card" aria-labelledby={`title-${job.id}`}>
      <p className="sample-badge">Sample only — no active opening shown</p>
      <h3 id={`title-${job.id}`}>{job.title}</h3>
      <p className="job-category">{categoryName}</p>
      <dl className="job-details">
        <div><dt>Company/source</dt><dd>{job.company_source}</dd></div>
        <div><dt>Location/eligibility</dt><dd>{job.location_eligibility}</dd></div>
      </dl>
      <p className="job-description">{job.description}</p>
      <a className="button" href={job.application_url} target="_blank" rel="noopener noreferrer">Apply<span className="sr-only"> for {job.title} (opens in a new tab)</span></a>
    </article>
  );
}
