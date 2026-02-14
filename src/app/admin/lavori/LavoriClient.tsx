"use client";

import { useState, useMemo } from "react";

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

export default function LavoriClient({ lavori }: { lavori: Lavoro[] }) {
  const [rows, setRows] = useState(lavori);
  const [dirty, setDirty] = useState(false);

  const [filters, setFilters] = useState({
    cliente: "",
    prestazione: "",
    dataFrom: "",
    dataTo: "",
    prezzoMin: "",
    prezzoMax: "",
  });

  // 🔎 FILTRI
  const filteredRows = useMemo(() => {
    return rows.filter((l) => {
      const data = l.data_prestazione ?? l.created_at;

      const matchCliente =
        !filters.cliente ||
        getNome(l.clienti)
          .toLowerCase()
          .includes(filters.cliente.toLowerCase());

      const matchPrestazione =
        !filters.prestazione ||
        getNome(l.prestazioni)
          .toLowerCase()
          .includes(filters.prestazione.toLowerCase());

      const matchDataFrom =
        !filters.dataFrom || data >= filters.dataFrom;

      const matchDataTo =
        !filters.dataTo || data <= filters.dataTo;

      const prezzo = l.prezzo ?? 0;

      const matchPrezzoMin =
        !filters.prezzoMin || prezzo >= Number(filters.prezzoMin);

      const matchPrezzoMax =
        !filters.prezzoMax || prezzo <= Number(filters.prezzoMax);

      return (
        matchCliente &&
        matchPrestazione &&
        matchDataFrom &&
        matchDataTo &&
        matchPrezzoMin &&
        matchPrezzoMax
      );
    });
  }, [rows, filters]);

  // 💰 Totale sui filtrati
  const totale = filteredRows.reduce(
    (acc, l) => acc + (l.prezzo ?? 0),
    0
  );

  function handlePrezzoChange(id: string, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, prezzo: value === "" ? null : Number(value) }
          : r
      )
    );
    setDirty(true);
  }

  function handleDataChange(id: string, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, data_prestazione: value } : r
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
    if (!confirm("Sei sicuro di voler eliminare questo lavoro?")) return;

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

      {/* 💰 TOTALE */}
      <div className="section">
        <div className="totale-box">
          Totale incasso: <strong>€ {totale.toFixed(2)}</strong>
        </div>
      </div>

      {/* 🔎 FILTRI */}
      <div className="filtro-box">
        <input
          className="input"
          placeholder="Filtra cliente"
          onChange={(e) =>
            setFilters((f) => ({ ...f, cliente: e.target.value }))
          }
        />

        <input
          className="input"
          placeholder="Filtra prestazione"
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              prestazione: e.target.value,
            }))
          }
        />

        <div className="row">
          <input
            type="date"
            className="input"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                dataFrom: e.target.value,
              }))
            }
          />
          <input
            type="date"
            className="input"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                dataTo: e.target.value,
              }))
            }
          />
        </div>

        <div className="row">
          <input
            type="number"
            className="input"
            placeholder="Prezzo min"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                prezzoMin: e.target.value,
              }))
            }
          />
          <input
            type="number"
            className="input"
            placeholder="Prezzo max"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                prezzoMax: e.target.value,
              }))
            }
          />
        </div>
      </div>

      {/* 📋 LISTA LAVORI */}
      <div className="lavori-container">
        {filteredRows.map((l) => {
          const dataVisuale = l.data_prestazione ?? l.created_at;

          return (
            <div key={l.id} className="lavoro-card">
              <div className="lavoro-top">
                <div className="lavoro-cliente">
                  {getNome(l.clienti)}
                </div>
                <div className="lavoro-data">
                  {new Date(dataVisuale).toLocaleDateString()}
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
                    <strong>Note:</strong> {l.descrizione}
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
                  handleDataChange(l.id, e.target.value)
                }
              />

              <input
                className="input lavoro-prezzo"
                type="number"
                placeholder="Prezzo"
                value={l.prezzo ?? ""}
                onChange={(e) =>
                  handlePrezzoChange(l.id, e.target.value)
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
