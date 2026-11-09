import { requireSuperAdmin } from "../../../../lib/auth";
import AdminForm from "../admin-form";
import styles from "../../categories/categories.module.css";

export const dynamic = "force-dynamic";

export default async function NewAdminPage() {
  await requireSuperAdmin();
  return <>
    <a href="/admin/users" className={styles.back}>← Users</a>
    <p className="eyebrow">Administration</p><h1>Add admin</h1>
    <AdminForm />
  </>;
}
