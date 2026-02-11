import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function VetHome() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="card">
      <h1>Area Veterinario</h1>
      <p className="muted">
        Da qui puoi gestire i tuoi lavori e inserirne di nuovi.
      </p>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/vet/lavori" className="btn btnPrimary">
          I miei lavori
        </Link>
      </div>
    </div>
  );
}
