import { requireSuperAdmin } from "../../../lib/auth";
import { listAdmins } from "./data";
import styles from "../categories/categories.module.css";

export const dynamic = "force-dynamic";
const notices: Record<string, string> = { created: "Admin created.", password: "Password updated.", removed: "Admin removed." };

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const { supabase, user } = await requireSuperAdmin();
  const params = await searchParams;
  const admins = await listAdmins(supabase);
  const notice = typeof params.notice === "string" && Object.hasOwn(notices, params.notice) ? notices[params.notice] : null;
  return <>
    <a className={styles.back} href="/admin">← Dashboard</a>
    <div className={styles.heading}><div><p className="eyebrow">Administration</p><h1>Users</h1></div><a href="/admin/users/new" className="button">Add admin</a></div>
    <p>Admins can manage all jobs and categories. Only the super admin can manage users.</p>
    {notice && <p role="status" className={styles.success}>{notice}</p>}
    {params.error && <p role="alert" className={styles.error}>{params.error === "protected" ? "The super admin and your own account cannot be changed here." : "Unable to remove the admin. Please try again."}</p>}
    {admins === null ? <div role="alert" className={styles.error}><p>Unable to load users. Please try again.</p><a href="/admin/users">Reload users</a></div>
      : admins.length === 0 ? <section className={styles.panel}><h2>No admins found</h2></section>
      : <table className={styles.table}>
        <caption className="sr-only">Admin accounts ordered by created date.</caption>
        <thead><tr>{["Name", "Email", "Role", "Created", "Actions"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{admins.map((admin) => <tr key={admin.user_id}>
          <th scope="row" data-label="Name">{admin.name}</th>
          <td data-label="Email">{admin.email}</td>
          <td data-label="Role">{admin.role === "super_admin" ? "Super admin" : "Admin"}</td>
          <td data-label="Created">{admin.created_at ? <time dateTime={admin.created_at}>{new Date(admin.created_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}</time> : "—"}</td>
          <td data-label="Actions">{admin.role === "admin" && admin.user_id !== user.id ? <div className={styles.actions}>
            <a href={`/admin/users/${admin.user_id}/password`}>Set new password<span className="sr-only"> for {admin.name}</span></a>
            <a href={`/admin/users/${admin.user_id}/remove`}>Remove<span className="sr-only"> {admin.name}</span></a>
          </div> : "Protected account"}</td>
        </tr>)}</tbody>
      </table>}
  </>;
}
