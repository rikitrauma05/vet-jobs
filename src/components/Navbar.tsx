"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "admin" | "vet" | null;

export default function Navbar() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await res.json();
        setUser(data.user);
        setRole(data.role);
      } catch {
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await fetch("/logout");
    router.replace("/login");
    router.refresh();
  }

  if (loading) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          VetJobs
        </Link>

        <div className="navbar-links desktop-only">
          {/* NON LOGGATO */}
          {!user && (
            <>
              <Link href="/login" className="navbar-link">
                Login
              </Link>
              <Link href="/register" className="navbar-link">
                Registrati
              </Link>
            </>
          )}

          {/* ADMIN */}
          {user && role === "admin" && (
            <>
              <Link href="/admin" className="navbar-link">
                Dashboard
              </Link>
              <Link href="/admin/clienti" className="navbar-link">
                Clienti
              </Link>
              <Link href="/admin/prestazioni" className="navbar-link">
                Prestazioni
              </Link>
              <Link href="/admin/lavori" className="navbar-link">
                Lavori
              </Link>
              <button onClick={handleLogout} className="navbar-link">
                Logout
              </button>
            </>
          )}

          {/* VET */}
          {user && role === "vet" && (
            <button onClick={handleLogout} className="navbar-link">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
