import { redirect } from "next/navigation";
import { requireSuperAdmin } from "../../../../../lib/auth";
import AdminForm from "../../admin-form";
import { findAdmin } from "../../data";
import styles from "../../../categories/categories.module.css";

export const dynamic = "force-dynamic";

export default async function PasswordPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, user } = await requireSuperAdmin();
  const { id } = await params;
  const { data: target, error } = await findAdmin(supabase, id);
  if (target && (target.role !== "admin" || target.user_id === user.id)) redirect("/admin/users?error=protected");
  return <>
    <a href="/admin/users" className={styles.back}>← Users</a>
    <p className="eyebrow">Administration</p><h1>Set new password</h1>
    {error || !target ? <p role="alert" className={styles.error}>Unable to load this admin. Please try again.</p>
      : <><p>{target.name} — {target.email}</p><AdminForm id={target.user_id} /></>}
  </>;
}
