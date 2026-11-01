import { requireAdmin } from "../../../lib/auth";
import styles from "./categories.module.css";

export default async function CategoryNotFound() {
  await requireAdmin();
  return <section className={styles.panel}>
    <p className="eyebrow">Administration</p><h1>Category not found</h1>
    <p>This category does not exist or has been deleted.</p>
    <a className="button" href="/admin/categories">Back to categories</a>
  </section>;
}
