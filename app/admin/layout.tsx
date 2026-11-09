import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdmin } from "../../lib/auth";
import { signOut } from "./actions";
import styles from "./auth.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Real Work From Home Jobs", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, supabase } = await requireAdmin();
  const { data: isSuperAdmin, error } = await supabase.rpc("is_super_admin");
  return (
    <div className={styles.admin}>
      <a className="skip-link" href="#admin-content">Skip to content</a>
      <header className={styles.topBar}>
        <a href="/admin" className={styles.brand}>Real Work From Home Jobs</a>
        <nav aria-label="Admin account" className={styles.account}>
          <a href="/admin/categories">Categories</a>
          <a href="/admin/jobs">Jobs</a>
          {!error && isSuperAdmin === true && <a href="/admin/users">Users</a>}
          <a href="/">View site</a>
          <span className={styles.email}>{user.email}</span>
          <form action={signOut}><button className="button button-outline" type="submit">Sign out</button></form>
        </nav>
      </header>
      <main id="admin-content" tabIndex={-1} className={styles.content}>{children}</main>
    </div>
  );
}
