"use client";

import { useState } from "react";

type Lavoro = {
  id: string;
  descrizione: string | null;
  created_at: string;
  data_prestazione?: string | null;
  prezzo: number | null;
  clienti: any;
  prestazioni: any;
  vet: any;
};

function getNome(rel: any) {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.nome ?? "—";
  return rel.nome;
}

function getEmail(rel: any) {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.email ?? "—";
  return rel.email ?? "—";
}

export default function LavoriClient({
  lavori,
}: {
  lavori: Lavoro[];
}) {
  const [rows, setRows] = useState(lavori);
  const [dirty, setDirty] = useState(false);

  const totale = rows.reduce(
    (acc, l) => acc + (l.prezzo ?? 0),
    0
  );

  function handlePrezzoChange(id: string, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              prezzo: value === "" ? null : Number(value),
            }
          : r
      )
    );
    setDirty(true);
  }

  function handleDataChange(id: string, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, data_prestazione: value }
          : r
      )
    );
    setDirty(true);
  }

  async function salvaModifiche() {
    await fetch("/admin/lavori/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        rows.map((r) => ({
          id: r.id,
          prezzo: r.prezzo,
          data_prestazione: r.data_prestazione ?? null,
        }))
      ),
    });

    setDirty(false);
    location.reload();
  }

  async function elimina(id: string) {
    if (!confirm("Sei sicuro di voler eliminare questo lavoro?"))
      return;

    await fetch("/admin/lavori/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    location.reload();
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Gestione Lavori</h1>
        <p className="muted">
          Modifica prezzi, date o elimina lavori
        </p>
      </div>

      <div className="section">
        <div className="totale-box">
          Totale incasso:{" "}
          <strong>€ {totale.toFixed(2)}</strong>
        </div>
      </div>

      <div className="lavori-container">
        {rows.map((l) => {
          const dataVisuale =
            l.data_prestazione ?? l.created_at;

          return (
            <div key={l.id} className="lavoro-card">
              <div className="lavoro-top">
                <div className="lavoro-cliente">
                  {getNome(l.clienti)}
                </div>
                <div className="lavoro-data">
                  {new Date(
                    dataVisuale
                  ).toLocaleDateString()}
                </div>
              </div>

              <div className="lavoro-body">
                <div>
                  <strong>Prestazione:</strong>{" "}
                  {getNome(l.prestazioni)}
                </div>

                <div>
                  <strong>Vet:</strong>{" "}
                  {getEmail(l.vet)}
                </div>

                {l.descrizione && (
                  <div>
                    <strong>Note:</strong>{" "}
                    {l.descrizione}
                  </div>
                )}
              </div>

              <input
                type="date"
                className="input"
                value={
                  l.data_prestazione ??
                  new Date(l.created_at)
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) =>
                  handleDataChange(
                    l.id,
                    e.target.value
                  )
                }
              />

              <input
                className="input lavoro-prezzo"
                type="number"
                placeholder="Prezzo"
                value={l.prezzo ?? ""}
                onChange={(e) =>
                  handlePrezzoChange(
                    l.id,
                    e.target.value
                  )
                }
              />

              <button
                className="btn btnDanger"
                onClick={() => elimina(l.id)}
              >
                Elimina
              </button>
            </div>
          );
        })}
      </div>

      {dirty && (
        <div className="section">
          <button
            className="btn btnPrimary"
            onClick={salvaModifiche}
          >
            Salva modifiche
          </button>
        </div>
      )}
    </div>
  );
}
