import { requireAdmin } from "../../../lib/auth";
import styles from "../categories/categories.module.css";

export const dynamic = "force-dynamic";

export default async function JobNotFound() {
  await requireAdmin();
  return <section className={styles.panel}>
    <p className="eyebrow">Administration</p><h1>Job not found</h1>
    <p>This job does not exist or has been deleted.</p>
    <a className="button" href="/admin/jobs">Back to jobs</a>
  </section>;
}
