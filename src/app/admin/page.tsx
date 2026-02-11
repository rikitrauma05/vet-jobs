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
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, email, role, approved")
    .order("created_at", { ascending: false });

  const utenti = (data ?? []) as UserRow[];

  return <AdminUsersClient utenti={utenti} />;
}
