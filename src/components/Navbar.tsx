"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

type Role = "admin" | "vet" | null;

type AuthData = {
  user: any;
  role: Role;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [auth, setAuth] = useState<AuthData>({ user: null, role: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    async function fetchAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        const data = await res.json();
        setAuth(data);
      } catch {
        setAuth({ user: null, role: null });
      } finally {
        setLoading(false);
      }
    }

    fetchAuth();
  }, [pathname]);

  const { user, role } = auth;

  if (loading) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          VetJobs
        </Link>

        <div className="navbar-links desktop-only">
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
            </>
          )}

          {user && role === "vet" && (
            <Link href="/vet/lavori" className="navbar-link">
              I miei lavori
            </Link>
          )}

          {user && (
            <Link
              href="/logout"
              className="navbar-link"
              onClick={() => {
                router.refresh();
              }}
            >
              Logout
            </Link>
          )}
        </div>

        <div
          className="navbar-toggle mobile-only"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? "✕" : "☰"}
        </div>
      </div>

      <div className={`navbar-mobile ${mobileOpen ? "active" : ""}`}>
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
          </>
        )}

        {user && role === "vet" && (
          <Link href="/vet/lavori" className="navbar-link">
            I miei lavori
          </Link>
        )}

        {user && (
          <Link
            href="/logout"
            className="navbar-link"
            onClick={() => {
              router.refresh();
            }}
          >
            Logout
          </Link>
        )}
      </div>
    </nav>
  );
}
