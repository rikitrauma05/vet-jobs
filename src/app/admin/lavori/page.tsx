import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type RelazioneNome = {
  nome: string;
} | {
  nome: string;
}[] | null;

type RelazioneVet = {
  email: string | null;
} | {
  email: string | null;
}[] | null;

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

  return (
    <div className="card">
      <h1>Gestione lavori</h1>
      <p className="muted">Inserimento prezzo (solo admin)</p>

      <table style={{ width: "100%", marginTop: 16 }}>
        <thead>
          <tr>
            <th align="left">Cliente</th>
            <th align="left">Prestazione</th>
            <th align="left">Veterinario</th>
            <th align="left">Descrizione</th>
            <th align="left">Data</th>
            <th align="left">Prezzo (€)</th>
          </tr>
        </thead>
        <tbody>
          {lavori.map((l) => (
            <tr key={l.id}>
              <td>{getNome(l.clienti)}</td>
              <td>{getNome(l.prestazioni)}</td>
              <td>{getEmail(l.vet)}</td>
              <td>{l.descrizione || "—"}</td>
              <td>{new Date(l.created_at).toLocaleDateString()}</td>
              <td>
                <form
                  action="/admin/lavori/prezzo"
                  method="POST"
                  style={{ display: "flex", gap: 8 }}
                >
                  <input type="hidden" name="lavoro_id" value={l.id} />

                  <input
                    type="number"
                    name="prezzo"
                    step="0.01"
                    min="0"
                    defaultValue={l.prezzo ?? ""}
                    placeholder="€"
                    style={{ width: 90 }}
                  />

                  <button className="btn btnPrimary">Salva</button>
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
  );
}
