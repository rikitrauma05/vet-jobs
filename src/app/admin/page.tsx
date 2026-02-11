import { createSupabaseServerClient } from "@/lib/supabase/server";

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

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Gestione Utenti</h1>
        <p className="muted">Approva, modifica ruolo o elimina utenti</p>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Ruolo</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>

          <tbody>
            {utenti.map((u) => (
              <tr key={u.id}>
                <td>{u.email || "—"}</td>

                <td>
                  <form action="/admin/update-role" method="POST" className="row">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="role" defaultValue={u.role} className="input">
                      <option value="vet">Vet</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button className="btn btnPrimary">Salva</button>
                  </form>
                </td>

                <td>
                  {u.approved ? (
                    <span className="status-approved">Approvato</span>
                  ) : (
                    <span className="status-pending">In attesa</span>
                  )}
                </td>

                <td className="row">
                  <form action="/admin/approve" method="POST">
                    <input type="hidden" name="userId" value={u.id} />
                    <input
                      type="hidden"
                      name="approved"
                      value={(!u.approved).toString()}
                    />
                    <button className="btn">
                      {u.approved ? "Revoca" : "Approva"}
                    </button>
                  </form>

                  <form action="/admin/delete-user" method="POST">
                    <input type="hidden" name="userId" value={u.id} />
                    <button className="btn btnDanger">
                      Elimina
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
