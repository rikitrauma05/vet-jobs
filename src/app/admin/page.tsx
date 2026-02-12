import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  email: string | null;
  role: string;
  approved: boolean;
};

export default async function AdminPage() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, approved")
    .order("created_at", { ascending: false });

  return <AdminUsersClient utenti={(data ?? []) as UserRow[]} />;
}
