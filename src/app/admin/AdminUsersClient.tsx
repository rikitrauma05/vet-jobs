"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UserRow = {
  id: string;
  email: string | null;
  role: string;
  approved: boolean;
};

export default function AdminUsersClient({
  utenti,
}: {
  utenti: UserRow[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(userId: string) {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;

    setLoadingId(userId);

    await fetch("/admin/delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    router.refresh();
    setLoadingId(null);
  }

  async function handleApprove(userId: string, approved: boolean) {
    setLoadingId(userId);

    await fetch("/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, approved: !approved }),
    });

    router.refresh();
    setLoadingId(null);
  }

  async function handleRoleChange(userId: string, role: string) {
    setLoadingId(userId);

    await fetch("/admin/update-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });

    router.refresh();
    setLoadingId(null);
  }

  return (
    <div className="card">
      <div className="card-header">
        <h1 className="card-title">Gestione Utenti</h1>
        <p className="muted">
          Approva, modifica ruolo o elimina utenti
        </p>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Ruolo</th>
              <th>Stato</th>
              <th>Azioni</th>
            </tr>
          </thead>

          <tbody>
            {utenti.map((u) => (
              <tr key={u.id}>
                <td>{u.email || "—"}</td>

                <td>
                  <select
                    defaultValue={u.role}
                    className="input"
                    onChange={(e) =>
                      handleRoleChange(u.id, e.target.value)
                    }
                  >
                    <option value="vet">Vet</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  {u.approved ? (
                    <span className="status-approved">Approvato</span>
                  ) : (
                    <span className="status-pending">In attesa</span>
                  )}
                </td>

                <td className="row">
                  <button
                    onClick={() => handleApprove(u.id, u.approved)}
                    className="btn"
                    disabled={loadingId === u.id}
                  >
                    {u.approved ? "Revoca" : "Approva"}
                  </button>

                  <button
                    onClick={() => handleDelete(u.id)}
                    className="btn btnDanger"
                    disabled={loadingId === u.id}
                  >
                    {loadingId === u.id
                      ? "Eliminazione..."
                      : "Elimina"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
