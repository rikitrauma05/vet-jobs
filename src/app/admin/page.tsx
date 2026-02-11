import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type VetRow = {
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
    .eq("role", "vet")
    .order("created_at", { ascending: false });

  const veterinari = (data ?? []) as VetRow[];

  return (
    <div className="card">
      <h1>Amministrazione</h1>
      <p className="muted">Gestione utenti veterinari</p>

      <table style={{ width: "100%", marginTop: 16 }}>
        <thead>
          <tr>
            <th align="left">Email</th>
            <th align="left">Stato</th>
            <th align="left">Azione</th>
          </tr>
        </thead>
        <tbody>
          {veterinari.map((vet) => (
            <tr key={vet.id}>
              <td>{vet.email || "—"}</td>
              <td>{vet.approved ? "Approvato" : "In attesa"}</td>
              <td>
                <form action="/admin/approve" method="POST">
                  <input type="hidden" name="userId" value={vet.id} />
                  <input
                    type="hidden"
                    name="approved"
                    value={(!vet.approved).toString()}
                  />
                  <button className="btn">
                    {vet.approved ? "Revoca" : "Approva"}
                  </button>
                </form>
              </td>
            </tr>
          ))}

          {veterinari.length === 0 && (
            <tr>
              <td colSpan={3} className="muted">
                Nessun veterinario trovato
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
