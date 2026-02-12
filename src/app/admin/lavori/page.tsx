import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import LavoriClient from "./LavoriClient";

export const dynamic = "force-dynamic";

export default async function AdminLavoriPage() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("lavori")
    .select(`
      id,
      descrizione,
      created_at,
      prezzo,
      clienti:clienti(nome),
      prestazioni:prestazioni(nome),
      vet:profiles(email)
    `)
    .order("created_at", { ascending: false });

  return <LavoriClient lavori={data ?? []} />;
}
