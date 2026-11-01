import { notFound } from "next/navigation";
import SiteHeader from "../../site-header";
import SiteFooter from "../../site-footer";
import JobCard from "../../job-card";
import { getCategories, getJobsByCategory } from "../../../lib/data";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategories().find((item) => item.slug === slug);
  if (!category) notFound();
  const jobs = getJobsByCategory(slug);
  return <>
    <a className="skip-link" href="#category">Skip to content</a>
    <SiteHeader />
    <main id="category" className="category-page container" tabIndex={-1}>
      <a className="browse-link" href="/categories">Back to all categories</a>
      <h1>{category.name}</h1>
      <p>{category.description}</p>
      <p>{jobs.length} {jobs.length === 1 ? "job" : "jobs"}</p>
      <div className="job-results">{jobs.length ? jobs.map((job) => <JobCard key={job.id} job={job} />) : <p className="job-card empty-state">No jobs in this category yet.</p>}</div>
    </main>
    <SiteFooter />
  </>;
}
