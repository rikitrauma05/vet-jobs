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

  if (!user) return null;

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

      {/* FORM INSERIMENTO */}
      <form
        action="/vet/lavori/new"
        method="POST"
        className="vet-form"
      >
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

        <textarea
          name="descrizione"
          placeholder="Descrizione (opzionale)"
          rows={3}
        />

        <button className="btn btnPrimary">
          Salva lavoro
        </button>
      </form>

      {/* LISTA LAVORI */}
      <div className="vet-lavori-list">
        {lavori?.map((l) => (
          <div key={l.id} className="vet-lavoro-card">
            <div className="vet-lavoro-row">
              <span className="label">Cliente</span>
              <span>{getNome(l.clienti) ?? "—"}</span>
            </div>

            <div className="vet-lavoro-row">
              <span className="label">Prestazione</span>
              <span>{getNome(l.prestazioni) ?? "—"}</span>
            </div>

            <div className="vet-lavoro-row">
              <span className="label">Descrizione</span>
              <span>{l.descrizione || "—"}</span>
            </div>

            <div className="vet-lavoro-row">
              <span className="label">Data</span>
              <span>
                {new Date(l.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {(!lavori || lavori.length === 0) && (
          <p className="muted">Nessun lavoro inserito</p>
        )}
      </div>
    </div>
  );
}
