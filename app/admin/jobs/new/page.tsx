import { requireAdmin } from "../../../../lib/auth";
import JobForm from "../job-form";
import { categoryOptions } from "../data";
import { emptyValues } from "../validation";
import styles from "../../categories/categories.module.css";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const { supabase } = await requireAdmin();
  const categories = await categoryOptions(supabase);
  return <>
    <a className={styles.back} href="/admin/jobs">← Jobs</a>
    <p className="eyebrow">Administration</p><h1>New job</h1>
    {categories === null ? <p role="alert" className={styles.error}>Unable to load categories. Please reload and try again.</p>
      : categories.length === 0 ? <section className={styles.panel}><p>Create a category before adding a job.</p><a href="/admin/categories/new" className="button">New category</a></section>
      : <JobForm initialValues={emptyValues} categories={categories} />}
  </>;
}
