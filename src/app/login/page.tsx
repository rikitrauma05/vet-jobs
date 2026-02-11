"use client";

import { useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabaseBrowserClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // NIENTE redirect qui
    // Lo faremo centralizzato in /redirect
    window.location.href = "/redirect";
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit} className="row" style={{ flexDirection: "column" }}>
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
          {loading ? "Accesso..." : "Accedi"}
        </button>
        <p className="muted" style={{ marginTop: 12 }}>
  Non hai un account?{" "}
  <a href="/register" style={{ color: "#4f8cff" }}>
    Registrati
  </a>
</p>

      </form>
    </div>
  );
}
