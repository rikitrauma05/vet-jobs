"use client";

import { useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabaseBrowserClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabaseBrowserClient.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        role: "vet",
        approved: false,
      });
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="card" style={{ maxWidth: 420 }}>
        <h1>Registrazione completata</h1>
        <p className="muted">
          Il tuo account è stato creato correttamente.
          <br />
          Attendi l’approvazione da parte di un amministratore.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1>Registrazione</h1>

      <form onSubmit={handleSubmit} className="row" style={{ flexDirection: "column" }}>
        <input
          type="text"
          placeholder="Nome completo"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p style={{ color: "salmon" }}>{error}</p>}

        <button className="btn btnPrimary" disabled={loading}>
          {loading ? "Creazione..." : "Registrati"}
        </button>
      </form>
    </div>
  );
}
