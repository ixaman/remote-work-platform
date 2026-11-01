import { requireAdmin } from "../../../../../lib/auth";
import CategoryForm from "../../category-form";
import { findCategory } from "../../data";
import styles from "../../categories.module.css";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { data: category, error } = await findCategory(supabase, id);
  return <>
    <a className={styles.back} href="/admin/categories">← Categories</a>
    <p className="eyebrow">Administration</p><h1>Edit category</h1>
    {error || !category ? <p role="alert" className={styles.error}>Unable to load the category. Please reload and try again.</p>
      : <CategoryForm id={category.id} initialValues={{ name: category.name, slug: category.slug, description: category.description ?? "", status: category.status, sort_order: String(category.sort_order) }} />}
  </>;
}
