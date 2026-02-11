"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Cliente = {
  id: string;
  nome: string;
};

export default function ClientiClient({
  clienti,
}: {
  clienti: Cliente[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questo cliente?")) return;

    setLoadingId(id);

    await fetch("/admin/clienti/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    router.refresh();
    setLoadingId(null);
  }

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

      <div className="list">
        {clienti.map((c) => (
          <div key={c.id} className="list-item">
            <span>{c.nome}</span>
            <button
              className="btn btnDanger"
              onClick={() => handleDelete(c.id)}
              disabled={loadingId === c.id}
            >
              {loadingId === c.id ? "..." : "Elimina"}
            </button>
          </div>
        ))}

        {clienti.length === 0 && (
          <p className="muted">Nessun cliente inserito</p>
        )}
      </div>
    </div>
  );
}
