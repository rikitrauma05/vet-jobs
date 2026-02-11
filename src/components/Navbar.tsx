"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

type Role = "admin" | "vet" | null;

export default function Navbar() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabaseBrowserClient.auth.getUser();

      setUser(user);

      if (user) {
        const { data: profile } = await supabaseBrowserClient
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(profile?.role ?? null);
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  if (loading) return null;

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #222",
      }}
    >
      <Link href="/" style={{ fontWeight: 700 }}>
        VetJobs
      </Link>

      <div style={{ display: "flex", gap: 12 }}>
        {!user && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Registrati</Link>
          </>
        )}

        {user && role === "admin" && (
          <>
            <Link href="/admin">Admin</Link>
            <Link href="/admin/clienti">Clienti</Link>
            <Link href="/admin/prestazioni">Prestazioni</Link>
            <Link href="/admin/lavori">Lavori</Link>
          </>
        )}

        {user && role === "vet" && (
          <>
            <Link href="/vet">Area Vet</Link>
            <Link href="/vet/lavori">I miei lavori</Link>
          </>
        )}

        {user && <Link href="/logout">Logout</Link>}
      </div>
    </nav>
  );
}
