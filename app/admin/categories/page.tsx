import { requireAdmin } from "../../../lib/auth";
import { setCategoryStatus } from "./actions";
import { listCategories } from "./data";
import styles from "./categories.module.css";

export const dynamic = "force-dynamic";
const notices: Record<string, string> = {
  created: "Category created.", updated: "Category updated.", published: "Category published.",
  hidden: "Category hidden. Its jobs are also hidden from the public site.", deleted: "Category deleted.",
};

export default async function CategoriesPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const categories = await listCategories(supabase);
  const notice = typeof params.notice === "string" && Object.hasOwn(notices, params.notice) ? notices[params.notice] : null;
  return <>
    <a className={styles.back} href="/admin">← Dashboard</a>
    <div className={styles.heading}><div><p className="eyebrow">Administration</p><h1>Categories</h1></div><a href="/admin/categories/new" className="button">New category</a></div>
    <p>Manage category details and visibility. Job counts include all statuses.</p>
    {notice && <p role="status" className={styles.success}>{notice}</p>}
    {params.error && <p role="alert" className={styles.error}>Unable to change the category status. Please try again.</p>}
    {categories === null ? <div role="alert" className={styles.error}><p>Unable to load categories. Please try again.</p><a href="/admin/categories">Reload categories</a></div>
      : categories.length === 0 ? <section className={styles.panel}><h2>No categories yet</h2><p>Create your first category to organize jobs.</p><a href="/admin/categories/new" className="button">New category</a></section>
      : <table className={styles.table}>
        <caption className="sr-only">Categories ordered by sort order, then name. Job counts include all statuses.</caption>
        <thead><tr>{["Name", "Slug", "Status", "Sort order", "Jobs", "Actions"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{categories.map((category) => <tr key={category.id}>
          <th scope="row" data-label="Name">{category.name}</th>
          <td data-label="Slug">{category.slug}</td>
          <td data-label="Status"><span className={`${styles.badge} ${category.status === "published" ? styles.published : styles.draft}`}>{category.status}</span></td>
          <td data-label="Sort order">{category.sort_order}</td>
          <td data-label="Jobs">{category.jobs[0]?.count ?? 0}</td>
          <td data-label="Actions"><div className={styles.actions}>
            <a href={`/admin/categories/${category.id}/edit`}>Edit<span className="sr-only"> {category.name}</span></a>
            <form action={setCategoryStatus}>
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="status" value={category.status === "published" ? "draft" : "published"} />
              <button type="submit" className={styles.textButton}>{category.status === "published" ? "Hide" : "Publish"}<span className="sr-only"> {category.name}</span></button>
            </form>
            <a href={`/admin/categories/${category.id}/delete`}>Delete<span className="sr-only"> {category.name}</span></a>
          </div></td>
        </tr>)}</tbody>
      </table>}
  </>;
}
