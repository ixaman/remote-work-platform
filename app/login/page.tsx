import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { adminDestination, requireAdmin } from "../../lib/auth";
import { createClient } from "../../lib/supabase/server";
import { signIn } from "./actions";
import styles from "../admin/auth.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin sign in | Real Work From Home Jobs", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await requireAdmin();
    redirect("/admin");
  }
  const params = await searchParams;
  const message = params.error === "forbidden"
    ? "This account doesn't have admin access."
    : params.error === "invalid" ? "Invalid email or password" : null;

  return (
    <main className={styles.login}>
      <div className={styles.loginIntro}>
        <a href="/" className={styles.brand}>Real Work From Home Jobs</a>
        <p className="eyebrow">Admin access</p>
        <h1>Welcome back</h1>
        <p>Sign in to manage categories and jobs.</p>
      </div>
      <div className={styles.loginCard}>
        <h2>Sign in</h2>
        {message && <p id="login-error" role="alert" className={styles.error}>{message}</p>}
        <form action={signIn} className={styles.form} aria-describedby={message ? "login-error" : undefined}>
          <input type="hidden" name="next" value={adminDestination(params.next)} />
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          <button type="submit" className="button">Sign in</button>
        </form>
        <a href="/" className={styles.back}>← Back to site</a>
      </div>
    </main>
  );
}
