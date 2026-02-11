import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminClientiPage() {
  const supabase = await createSupabaseServerClient();

  const { data: clienti } = await supabase
    .from("clienti")
    .select("id, nome")
    .order("nome");

  return (
    <div className="card">
      <h1>Clienti</h1>

      <form
        action="/admin/clienti/new"
        method="POST"
        style={{ marginTop: 16, marginBottom: 24 }}
      >
        <div className="row" style={{ gap: 8 }}>
          <input name="nome" placeholder="Nome cliente" required />
          <button className="btn btnPrimary">Aggiungi</button>
        </div>
      </form>

      <table style={{ width: "100%" }}>
        <tbody>
          {clienti?.map((c) => (
            <tr key={c.id}>
              <td>{c.nome}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
