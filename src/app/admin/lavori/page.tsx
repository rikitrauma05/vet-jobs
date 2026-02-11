import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RelazioneNome =
  | { nome: string }
  | { nome: string }[]
  | null;

type RelazioneVet =
  | { email: string | null }
  | { email: string | null }[]
  | null;

type LavoroAdmin = {
  id: string;
  descrizione: string | null;
  created_at: string;
  prezzo: number | null;
  clienti: RelazioneNome;
  prestazioni: RelazioneNome;
  vet: RelazioneVet;
};

function getNome(relazione: RelazioneNome) {
  if (!relazione) return "—";
  if (Array.isArray(relazione)) return relazione[0]?.nome ?? "—";
  return relazione.nome;
}

function getEmail(relazione: RelazioneVet) {
  if (!relazione) return "—";
  if (Array.isArray(relazione)) return relazione[0]?.email ?? "—";
  return relazione.email ?? "—";
}

export default async function AdminLavoriPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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

  const lavori = (data ?? []) as LavoroAdmin[];

  const totaleIncasso = lavori.reduce((acc, l) => {
    return acc + (l.prezzo ?? 0);
  }, 0);

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Gestione Lavori</h1>
        <p className="muted">
          Inserimento prezzo e monitoraggio incassi
        </p>
      </div>

      <div className="section">
        <div className="totale-box">
          Totale incasso:{" "}
          <strong>
            € {totaleIncasso.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Prestazione</th>
              <th>Veterinario</th>
              <th>Descrizione</th>
              <th>Data</th>
              <th>Prezzo (€)</th>
            </tr>
          </thead>

          <tbody>
            {lavori.map((l) => (
              <tr key={l.id}>
                <td>{getNome(l.clienti)}</td>
                <td>{getNome(l.prestazioni)}</td>
                <td>{getEmail(l.vet)}</td>
                <td>{l.descrizione || "—"}</td>
                <td>
                  {new Date(l.created_at).toLocaleDateString()}
                </td>
                <td>
                  <form
                    action="/admin/lavori/prezzo"
                    method="POST"
                    className="row"
                  >
                    <input
                      type="hidden"
                      name="lavoro_id"
                      value={l.id}
                    />

                    <input
                      type="number"
                      name="prezzo"
                      step="0.01"
                      min="0"
                      defaultValue={l.prezzo ?? ""}
                      placeholder="€"
                      className="input prezzo-input"
                    />

                    <button className="btn btnPrimary">
                      Salva
                    </button>
                  </form>
                </td>
              </tr>
            ))}

            {lavori.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  Nessun lavoro trovato
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
