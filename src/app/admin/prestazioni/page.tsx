import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPrestazioniPage() {
  const supabase = await createSupabaseServerClient();

  const { data: prestazioni } = await supabase
    .from("prestazioni")
    .select("id, nome")
    .order("nome");

  return (
    <div className="card">
      <h1>Prestazioni</h1>
      <p className="muted">Gestione prestazioni disponibili</p>

      {/* FORM INSERIMENTO */}
      <form
        action="/admin/prestazioni/new"
        method="POST"
        style={{ marginTop: 16, marginBottom: 24 }}
      >
        <div className="row" style={{ gap: 8 }}>
          <input
            type="text"
            name="nome"
            placeholder="Nome prestazione"
            required
          />
          <button className="btn btnPrimary">Aggiungi</button>
        </div>
      </form>

      {/* LISTA */}
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th align="left">Nome</th>
          </tr>
        </thead>
        <tbody>
          {prestazioni?.map((p) => (
            <tr key={p.id}>
              <td>{p.nome}</td>
            </tr>
          ))}

          {(!prestazioni || prestazioni.length === 0) && (
            <tr>
              <td className="muted">Nessuna prestazione inserita</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
