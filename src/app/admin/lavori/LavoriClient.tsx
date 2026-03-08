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
  return rel.nome ?? "—";
}

function getEmail(rel: any) {
  if (!rel) return "—";
  if (Array.isArray(rel)) return rel[0]?.email ?? "—";
  return rel.email ?? "—";
}

export default function LavoriClient({ lavori }: { lavori: Lavoro[] }) {

  const [rows, setRows] = useState(() =>
    [...lavori].sort((a, b) => {
      const dataA = new Date(a.data_prestazione ?? a.created_at).getTime();
      const dataB = new Date(b.data_prestazione ?? b.created_at).getTime();
      return dataB - dataA;
    })
  );

  const [dirty, setDirty] = useState(false);

  const [clienteFilter, setClienteFilter] = useState("");
  const [prestazioneFilter, setPrestazioneFilter] = useState("");

  const [dataFrom, setDataFrom] = useState("");
  const [dataTo, setDataTo] = useState("");

  const [mostraFiltri, setMostraFiltri] = useState(true);

  function resetFiltri() {
    setClienteFilter("");
    setPrestazioneFilter("");
    setDataFrom("");
    setDataTo("");
  }

  const clientiUnici = useMemo(() => {
    return Array.from(
      new Set(rows.map((l) => getNome(l.clienti)))
    ).filter(Boolean) as string[];
  }, [rows]);

  const prestazioniUniche = useMemo(() => {
    return Array.from(
      new Set(rows.map((l) => getNome(l.prestazioni)))
    ).filter(Boolean) as string[];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((l) => {

      const data = new Date(l.data_prestazione ?? l.created_at).getTime();

      const fromOk =
        !dataFrom || data >= new Date(dataFrom).getTime();

      const toOk =
        !dataTo || data <= new Date(dataTo).getTime();

      const clienteOk =
        !clienteFilter ||
        getNome(l.clienti)
          .toLowerCase()
          .includes(clienteFilter.toLowerCase());

      const prestazioneOk =
        !prestazioneFilter ||
        getNome(l.prestazioni)
          .toLowerCase()
          .includes(prestazioneFilter.toLowerCase());

      return fromOk && toOk && clienteOk && prestazioneOk;
    });
  }, [rows, clienteFilter, prestazioneFilter, dataFrom, dataTo]);

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

  function scaricaPDF() {

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/admin/lavori/pdf";
    form.style.display = "none";

    const fields = {
      dataFrom,
      dataTo,
      cliente: clienteFilter,
      prestazione: prestazioneFilter,
      mostraFiltri: mostraFiltri ? "true" : "false"
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.name = key;
      input.value = value ?? "";
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }

  return (
    <div className="card">

      <div className="card-header">
        <h1 className="card-title">Gestione Lavori</h1>
        <p className="muted">Filtra, modifica o elimina lavori</p>
      </div>

      <div className="totale-box">
        Totale incasso: <strong>€ {totale.toFixed(2)}</strong>
      </div>

      {/* FILTRI */}
      <div className="filtro-box">

        <div className="row">

          <input
            type="date"
            className="input"
            value={dataFrom}
            onChange={(e) => setDataFrom(e.target.value)}
          />

          <input
            type="date"
            className="input"
            value={dataTo}
            onChange={(e) => setDataTo(e.target.value)}
          />

          <select
            className="input"
            value={clienteFilter}
            onChange={(e) => setClienteFilter(e.target.value)}
          >
            <option value="">Tutti i clienti</option>
            {clientiUnici.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={prestazioneFilter}
            onChange={(e) => setPrestazioneFilter(e.target.value)}
          >
            <option value="">Tutte le prestazioni</option>
            {prestazioniUniche.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

        </div>

        <div className="row">

          <label className="pdf-checkbox">
          <input
            type="checkbox"
            checked={mostraFiltri}
            onChange={(e) => setMostraFiltri(e.target.checked)}
          />
          Mostra filtri nel PDF
        </label>

        </div>

        <div className="row">

          <button
            type="button"
            className="btn"
            onClick={resetFiltri}
          >
            Reset
          </button>

          <button
            className="btn btnPrimary"
            onClick={scaricaPDF}
          >
            Scarica PDF
          </button>

        </div>

      </div>

      {/* LISTA LAVORI */}
      <div className="lavori-container">

        {filteredRows.map((l) => {

          const data = l.data_prestazione ?? l.created_at;

          return (
            <div key={l.id} className="lavoro-card">

              <div className="lavoro-top">
                <div>{getNome(l.clienti)}</div>
                <div>{new Date(data).toLocaleDateString()}</div>
              </div>

              <div className="lavoro-body">

                <div>
                  <strong>Prestazione:</strong> {getNome(l.prestazioni)}
                </div>

                <div>
                  <strong>Vet:</strong> {getEmail(l.vet)}
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
                  new Date(l.created_at).toISOString().split("T")[0]
                }
                onChange={(e) =>
                  handleDataChange(l.id, e.target.value)
                }
              />

              <input
                className="input"
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
        <div style={{ marginTop: 16 }}>
          <button className="btn btnPrimary" onClick={salvaModifiche}>
            Salva modifiche
          </button>
        </div>
      )}

    </div>
  );
}