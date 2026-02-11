"use client";

import { useState } from "react";
import Link from "next/link";
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
      <div className="auth-wrap">
        <div className="card auth-card">
          <div className="card-header">
            <h1 className="card-title">Registrazione completata</h1>
          </div>

          <p className="muted">
            Il tuo account è stato creato correttamente.
            <br />
            Attendi l’approvazione da parte di un amministratore.
          </p>

          <div className="section">
            <Link href="/login" className="btn btnPrimary">
              Vai al Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-header">
          <h1 className="card-title">Registrazione</h1>
          <p className="muted">
            Crea un account per accedere alla piattaforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <input
            className="input"
            type="text"
            placeholder="Nome completo"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="input"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="alert">{error}</p>}

          <button className="btn btnPrimary" disabled={loading}>
            {loading ? "Creazione..." : "Registrati"}
          </button>
        </form>

        <p className="muted auth-footer">
          Hai già un account?{" "}
          <Link href="/login" className="link">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
