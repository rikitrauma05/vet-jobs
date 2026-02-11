import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ClienteRel = { nome: string } | { nome: string }[] | null;
type PrestazioneRel = { nome: string } | { nome: string }[] | null;

function getNome(rel: ClienteRel | PrestazioneRel): string | null {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0]?.nome ?? null;
  return rel.nome ?? null;
}

export default async function LavoriVetPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: clienti } = await supabase
    .from("clienti")
    .select("id, nome")
    .order("nome");

  const { data: prestazioni } = await supabase
    .from("prestazioni")
    .select("id, nome")
    .order("nome");

  const { data: lavori } = await supabase
    .from("lavori")
    .select(`
      id,
      descrizione,
      created_at,
      clienti:clienti!lavori_cliente_id_fkey(nome),
      prestazioni:prestazioni!lavori_prestazione_id_fkey(nome)
    `)
    .eq("vet_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="card">
      <h1>I miei lavori</h1>
      <p className="muted">Inserisci un nuovo lavoro</p>

      {/* FORM INSERIMENTO */}
      <form
        action="/vet/lavori/new"
        method="POST"
        style={{ marginTop: 16, marginBottom: 24 }}
      >
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <select name="cliente_id" required>
            <option value="">Seleziona cliente</option>
            {clienti?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          <select name="prestazione_id" required>
            <option value="">Seleziona prestazione</option>
            {prestazioni?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <textarea
          name="descrizione"
          placeholder="Descrizione (opzionale)"
        />

        <button className="btn btnPrimary" style={{ marginTop: 8 }}>
          Salva lavoro
        </button>
      </form>

      {/* LISTA LAVORI */}
      <table className="table">
  <thead>
    <tr>
      <th>Cliente</th>
      <th>Prestazione</th>
      <th>Descrizione</th>
      <th>Data</th>
    </tr>
  </thead>
  <tbody>
    {lavori?.map((l) => (
      <tr key={l.id}>
        <td data-label="Cliente">
          {getNome(l.clienti) ?? "—"}
        </td>
        <td data-label="Prestazione">
          {getNome(l.prestazioni) ?? "—"}
        </td>
        <td data-label="Descrizione">
          {l.descrizione || "—"}
        </td>
        <td data-label="Data">
          {new Date(l.created_at).toLocaleDateString()}
        </td>
      </tr>
    ))}

    {(!lavori || lavori.length === 0) && (
      <tr>
        <td colSpan={4} className="muted">
          Nessun lavoro inserito
        </td>
      </tr>
    )}
  </tbody>
</table>

    </div>
  );
}
