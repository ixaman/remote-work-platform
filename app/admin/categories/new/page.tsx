import { requireAdmin } from "../../../../lib/auth";
import CategoryForm from "../category-form";
import { emptyValues } from "../validation";
import styles from "../categories.module.css";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requireAdmin();
  return <>
    <a className={styles.back} href="/admin/categories">← Categories</a>
    <p className="eyebrow">Administration</p><h1>New category</h1>
    <CategoryForm initialValues={emptyValues} />
  </>;
}
