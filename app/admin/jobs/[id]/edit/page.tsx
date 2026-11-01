import { requireAdmin } from "../../../../../lib/auth";
import JobForm from "../../job-form";
import { categoryOptions, findJob } from "../../data";
import styles from "../../../categories/categories.module.css";

export const dynamic = "force-dynamic";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { data: job, error } = await findJob(supabase, id);
  const categories = await categoryOptions(supabase);
  return <>
    <a className={styles.back} href="/admin/jobs">← Jobs</a>
    <p className="eyebrow">Administration</p><h1>Edit job</h1>
    {error || !job || categories === null ? <p role="alert" className={styles.error}>Unable to load the job and categories. Please reload and try again.</p>
      : categories.length === 0 ? <section className={styles.panel}><p>Create a category before saving a job.</p><a href="/admin/categories/new" className="button">New category</a></section>
      : <JobForm id={job.id} categories={categories} initialValues={{ title: job.title, category_id: job.category_id, company_source: job.company_source,
        location_eligibility: job.location_eligibility, description: job.description, application_url: job.application_url, status: job.status }} />}
  </>;
}
