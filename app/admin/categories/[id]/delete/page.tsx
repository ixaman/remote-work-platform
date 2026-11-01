import { requireAdmin } from "../../../../../lib/auth";
import { deleteCategory } from "../../actions";
import { countJobs, findCategory } from "../../data";
import styles from "../../categories.module.css";

export const dynamic = "force-dynamic";

export default async function DeleteCategoryPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { error: actionError } = await searchParams;
  const { data: category, error } = await findCategory(supabase, id);
  const count = category ? await countJobs(supabase, category.id) : null;
  return <>
    <a className={styles.back} href="/admin/categories">← Categories</a>
    <p className="eyebrow">Administration</p><h1>Delete category</h1>
    {error || !category || count === null ? <p role="alert" className={styles.error}>Unable to load the category and its job count. Please reload and try again.</p>
      : <section className={styles.panel}>
        <h2>{category.name}</h2>
        {count > 0 ? <p role="alert" className={styles.error}>This category has {count} jobs. Move or delete them first, or hide the category instead.</p>
          : <>
            {actionError && <p role="alert" className={styles.error}>{actionError === "jobs"
              ? "A job was added before deletion completed. Move or delete its jobs first, or hide the category instead."
              : actionError === "confirm" ? "Please confirm deletion below." : "Unable to delete the category. Please try again."}</p>}
            <p>Delete this category permanently? This cannot be undone.</p>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={category.id} />
              <input type="hidden" name="confirmation" value="delete" />
              <div className={styles.actions}><button type="submit" className={`button ${styles.danger}`}>Yes, delete category</button><a className="button button-outline" href="/admin/categories">Cancel</a></div>
            </form>
          </>}
        {count > 0 && <div className={styles.actions}><a className="button" href={`/admin/categories/${category.id}/edit`}>Edit or hide category</a><a className="button button-outline" href="/admin/categories">Cancel</a></div>}
      </section>}
  </>;
}
