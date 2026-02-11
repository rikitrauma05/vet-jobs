"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Prestazione = {
  id: string;
  nome: string;
};

export default function PrestazioniClient({
  prestazioni,
}: {
  prestazioni: Prestazione[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa prestazione?")) return;

    setLoadingId(id);

    await fetch("/admin/prestazioni/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    router.refresh();
    setLoadingId(null);
  }

  return (
    <div className="card">
      <h1>Prestazioni</h1>
      <p className="muted">Gestione prestazioni disponibili</p>

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

      <div className="list">
        {prestazioni.map((p) => (
          <div key={p.id} className="list-item">
            <span>{p.nome}</span>
            <button
              className="btn btnDanger"
              onClick={() => handleDelete(p.id)}
              disabled={loadingId === p.id}
            >
              {loadingId === p.id ? "..." : "Elimina"}
            </button>
          </div>
        ))}

        {prestazioni.length === 0 && (
          <p className="muted">Nessuna prestazione inserita</p>
        )}
      </div>
    </div>
  );
}
