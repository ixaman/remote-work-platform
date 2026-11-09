import "server-only";
import { notFound } from "next/navigation";
import type { requireSuperAdmin } from "../../../lib/auth";
import { isUserId } from "./validation";

type Client = Awaited<ReturnType<typeof requireSuperAdmin>>["supabase"];
export type Admin = { user_id: string; name: string; email: string; role: "super_admin" | "admin"; created_at: string | null };
const columns = "user_id,name,email,role,created_at";

export async function listAdmins(supabase: Client): Promise<Admin[] | null> {
  try {
    const rows: Admin[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase.from("admins").select(columns)
        .order("created_at").order("user_id").range(offset, offset + 999).returns<Admin[]>();
      if (error) return null;
      rows.push(...(data ?? []));
      if ((data?.length ?? 0) < 1000) return rows;
    }
  } catch { return null; }
}

export async function findAdmin(supabase: Client, id: string) {
  if (!isUserId(id)) notFound();
  let result;
  try {
    result = await supabase.from("admins").select(columns).eq("user_id", id).maybeSingle<Admin>();
  } catch { return { data: null, error: true }; }
  if (result.error) return { data: null, error: true };
  if (!result.data) notFound();
  return { data: result.data, error: false };
}
