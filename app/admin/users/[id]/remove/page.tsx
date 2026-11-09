import { redirect } from "next/navigation";
import { requireSuperAdmin } from "../../../../../lib/auth";
import { removeAdmin } from "../../actions";
import { findAdmin } from "../../data";
import styles from "../../../categories/categories.module.css";

export const dynamic = "force-dynamic";

export default async function RemovePage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }>;
}) {
  const { supabase, user } = await requireSuperAdmin();
  const { id } = await params;
  const { error: actionError } = await searchParams;
  const { data: target, error } = await findAdmin(supabase, id);
  if (target && (target.role !== "admin" || target.user_id === user.id)) redirect("/admin/users?error=protected");
  return <>
    <a href="/admin/users" className={styles.back}>← Users</a>
    <p className="eyebrow">Administration</p><h1>Remove admin</h1>
    {error || !target ? <p role="alert" className={styles.error}>Unable to load this admin. Please try again.</p>
      : <section className={styles.panel}>
        <h2>{target.name}</h2><p>{target.email}</p>
        {actionError && <p role="alert" className={styles.error}>{actionError === "confirm" ? "Please confirm removal below." : "Unable to remove this admin. Please try again."}</p>}
        <p>Permanently remove this admin account and its access? This cannot be undone. Jobs and categories will remain.</p>
        <form action={removeAdmin}>
          <input type="hidden" name="id" value={target.user_id} />
          <input type="hidden" name="confirmation" value="remove" />
          <div className={styles.actions}><button type="submit" className={`button ${styles.danger}`}>Yes, remove admin</button><a href="/admin/users" className="button button-outline">Cancel</a></div>
        </form>
      </section>}
  </>;
}
