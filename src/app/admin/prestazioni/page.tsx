import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import PrestazioniClient from "./PrestazioniClient";

export const dynamic = "force-dynamic";

export default async function AdminPrestazioniPage() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data: prestazioni } = await supabase
    .from("prestazioni")
    .select("id, nome")
    .order("nome");

  return <PrestazioniClient prestazioni={prestazioni ?? []} />;
}
