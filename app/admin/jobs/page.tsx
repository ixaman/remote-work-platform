import { requireAdmin } from "../../../lib/auth";
import { setJobStatus } from "./actions";
import { categoryOptions, listJobs } from "./data";
import { isId } from "./validation";
import styles from "../categories/categories.module.css";
import jobStyles from "./jobs.module.css";

export const dynamic = "force-dynamic";
const notices: Record<string, string> = {
  created: "Job created.", updated: "Job updated.", published: "Job published. Jobs in draft categories stay hidden until the category is published.",
  drafted: "Job saved as draft. It is hidden from the public site.", deleted: "Job deleted.",
};

export default async function JobsPage({ searchParams }: {
  searchParams: Promise<{ status?: string; category?: string; page?: string; notice?: string; error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const status = params.status === "published" || params.status === "draft" ? params.status : "all";
  const category = typeof params.category === "string" && isId(params.category.trim()) ? params.category.trim() : "";
  const page = typeof params.page === "string" && /^[1-9]\d{0,5}$/.test(params.page.trim()) ? Number(params.page.trim()) : 1;
  const [categories, result] = await Promise.all([categoryOptions(supabase), listJobs(supabase, status, category, page)]);
  const jobs = result.data?.slice(0, 20) ?? [];
  const notice = typeof params.notice === "string" && Object.hasOwn(notices, params.notice) ? notices[params.notice] : null;
  function pageUrl(nextPage: number) {
    const filters = new URLSearchParams({ status, ...(category ? { category } : {}), page: String(nextPage) });
    return `/admin/jobs?${filters}`;
  }
  return <>
    <a className={styles.back} href="/admin">← Dashboard</a>
    <div className={styles.heading}><div><p className="eyebrow">Administration</p><h1>Jobs</h1></div><a href="/admin/jobs/new" className="button">New job</a></div>
    <p>Manage job details and visibility. Published jobs in draft categories stay hidden from the public site.</p>
    {notice && <p role="status" className={styles.success}>{notice}</p>}
    {params.error && <p role="alert" className={styles.error}>Unable to change the job status. Please try again.</p>}
    <form action="/admin/jobs" method="get" className={jobStyles.filters}>
      <div className={styles.field}><label htmlFor="status-filter">Status</label><select id="status-filter" name="status" defaultValue={status}>
        <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option>
      </select></div>
      <div className={styles.field}><label htmlFor="category-filter">Category</label><select id="category-filter" name="category" defaultValue={category} disabled={categories === null}>
        <option value="">All categories</option>{categories?.map((item) => <option key={item.id} value={item.id}>{item.name}{item.status === "draft" ? " (draft)" : ""}</option>)}
      </select></div>
      <button className="button" type="submit">Filter jobs</button>
      <a href="/admin/jobs" className="button button-outline">Clear filters</a>
    </form>
    {categories === null && <p role="alert" className={styles.error}>Unable to load category filters. Please reload and try again.</p>}
    {result.error ? <div role="alert" className={styles.error}><p>Unable to load jobs. Please try again.</p><a href={pageUrl(page)}>Reload jobs</a></div>
      : jobs.length === 0 ? <section className={styles.panel}><h2>No jobs found</h2><p>{status !== "all" || category || page > 1 ? "No jobs match these filters on this page. Try another page or clear the filters." : "Create your first job to get started."}</p><a href="/admin/jobs/new" className="button">New job</a></section>
      : <table className={styles.table}>
        <caption className="sr-only">Jobs, newest first. Page {page}, up to 20 jobs per page. Dates use UTC.</caption>
        <thead><tr>{["Title", "Category", "Company/source", "Status", "Created", "Actions"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{jobs.map((job) => <tr key={job.id}>
          <th scope="row" data-label="Title">{job.title}</th>
          <td data-label="Category">{job.category?.name ?? "Unavailable category"}{job.category?.status === "draft" ? " (draft)" : ""}</td>
          <td data-label="Company/source">{job.company_source}</td>
          <td data-label="Status"><span className={`${styles.badge} ${job.status === "published" ? styles.published : styles.draft}`}>{job.status}</span></td>
          <td data-label="Created"><time dateTime={job.created_at}>{new Date(job.created_at).toISOString().slice(0, 10)}</time></td>
          <td data-label="Actions"><div className={styles.actions}>
            <a href={`/admin/jobs/${job.id}/edit`}>Edit<span className="sr-only"> {job.title}</span></a>
            <form action={setJobStatus}><input type="hidden" name="id" value={job.id} /><input type="hidden" name="status" value={job.status === "published" ? "draft" : "published"} />
              <button type="submit" className={styles.textButton}>{job.status === "published" ? "Draft" : "Publish"}<span className="sr-only"> {job.title}</span></button>
            </form>
            {job.status === "published" && job.category?.status === "published" && <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer">View<span className="sr-only"> {job.title} (opens in a new tab)</span></a>}
            <a href={`/admin/jobs/${job.id}/delete`}>Delete<span className="sr-only"> {job.title}</span></a>
          </div></td>
        </tr>)}</tbody>
      </table>}
    {!result.error && <nav aria-label="Job pages" className={jobStyles.pagination}>
      {page > 1 && <a href={pageUrl(page - 1)} className="button button-outline" rel="prev">Previous</a>}
      <span>Page {page}</span>
      {(result.data?.length ?? 0) > 20 && <a href={pageUrl(page + 1)} className="button button-outline" rel="next">Next</a>}
    </nav>}
  </>;
}
