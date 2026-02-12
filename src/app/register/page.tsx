"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // crea profilo base
      await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        role: "vet",
        approved: false,
      });

      router.replace("/pending");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-header">
          <h1 className="card-title">Registrati</h1>
          <p className="muted">Crea un nuovo account.</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
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
            {loading ? "Registrazione..." : "Registrati"}
          </button>
        </form>

        <p className="muted auth-footer">
          Hai già un account?{" "}
          <Link className="link" href="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
