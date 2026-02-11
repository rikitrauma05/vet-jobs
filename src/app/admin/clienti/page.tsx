import { createSupabaseServerClient } from "@/lib/supabase/server";
import ClientiClient from "./ClientiClient";

export const dynamic = "force-dynamic";

export default async function AdminClientiPage() {
  const supabase = await createSupabaseServerClient();

  const { data: clienti } = await supabase
    .from("clienti")
    .select("id, nome")
    .order("nome");

  return <ClientiClient clienti={clienti ?? []} />;
}
