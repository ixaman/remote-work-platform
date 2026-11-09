import type { Metadata } from "next";
import type { ReactNode } from "react";
import { requireAdmin } from "../../lib/auth";
import AdminShell from "./admin-shell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin | Real Work From Home Jobs", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, supabase } = await requireAdmin();
  const [{ data: isSuperAdmin, error }, { data: profile }] = await Promise.all([
    supabase.rpc("is_super_admin"),
    supabase.from("admins").select("name").eq("user_id", user.id).maybeSingle<{ name: string }>(),
  ]);
  return (
    <AdminShell name={profile?.name.trim() || "Admin"} email={user.email ?? ""} isSuperAdmin={!error && isSuperAdmin === true}>
      {children}
    </AdminShell>
  );
}
