"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("Login non riuscito.");
      setLoading(false);
      return;
    }

    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("role, approved")
      .eq("id", user.id)
      .single();

    if (pErr || !profile) {
      setError("Profilo non trovato.");
      setLoading(false);
      return;
    }

    if (!profile.approved) {
      router.replace("/pending");
      return;
    }

    if (profile.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/vet");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-header">
          <h1 className="card-title">Login</h1>
          <p className="muted">Accedi con le tue credenziali.</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <input
            className="input"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {error && <p className="alert">{error}</p>}

          <button className="btn btnPrimary" disabled={loading}>
            {loading ? "Accesso..." : "Accedi"}
          </button>
        </form>

        <p className="muted auth-footer">
          Non hai un account?{" "}
          <Link className="link" href="/register">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
