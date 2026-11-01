import { requireAdmin } from "../../../../../lib/auth";
import { deleteJob } from "../../actions";
import { findJob } from "../../data";
import styles from "../../../categories/categories.module.css";

export const dynamic = "force-dynamic";

export default async function DeleteJobPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { error: actionError } = await searchParams;
  const { data: job, error } = await findJob(supabase, id);
  return <>
    <a className={styles.back} href="/admin/jobs">← Jobs</a>
    <p className="eyebrow">Administration</p><h1>Delete job</h1>
    {error || !job ? <p role="alert" className={styles.error}>Unable to load the job. Please reload and try again.</p>
      : <section className={styles.panel}>
        <h2>{job.title}</h2><p>{job.company_source}</p>
        {actionError && <p role="alert" className={styles.error}>{actionError === "confirm" ? "Please confirm deletion below." : "Unable to delete the job. Please try again."}</p>}
        <p>Delete this job permanently? This cannot be undone.</p>
        <form action={deleteJob}>
          <input type="hidden" name="id" value={job.id} /><input type="hidden" name="confirmation" value="delete" />
          <div className={styles.actions}><button type="submit" className={`button ${styles.danger}`}>Yes, delete job</button><a className="button button-outline" href="/admin/jobs">Cancel</a></div>
        </form>
      </section>}
  </>;
}
