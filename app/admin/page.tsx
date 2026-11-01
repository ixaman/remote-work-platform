import { requireAdmin } from "../../lib/auth";
import styles from "./auth.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { supabase } = await requireAdmin();
  const results = await Promise.all([
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "draft"),
  ]);
  const failed = results.some(({ error }) => error);
  return (
    <>
      <p className="eyebrow">Administration</p>
      <h1>Dashboard</h1>
      <p>Manage your remote job categories and listings.</p>
      {failed && <p role="alert" className={styles.error}>Counts are unavailable. Please try again later.</p>}
      <div className={styles.grid}>
        {["Categories", "Jobs"].map((label, index) => (
          <section key={label} className={styles.panel} aria-labelledby={`panel-${index}`}>
            <h2 id={`panel-${index}`}>{label}</h2>
            <dl className={styles.counts}>
              <div><dt>Published</dt><dd>{failed ? "—" : results[index * 2].count ?? 0}</dd></div>
              <div><dt>Draft</dt><dd>{failed ? "—" : results[index * 2 + 1].count ?? 0}</dd></div>
            </dl>
            {label === "Categories" ? <a href="/admin/categories" className="button">Categories</a> : <>
              <a role="link" aria-disabled="true" aria-describedby={`soon-${index}`} className={styles.disabled}>{label}</a>
              <span id={`soon-${index}`} className={styles.soon}>Coming soon</span>
            </>}
          </section>
        ))}
      </div>
    </>
  );
}
