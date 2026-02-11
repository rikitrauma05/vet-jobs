"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowserClient } from "@/lib/supabase/client";

type Role = "admin" | "vet" | null;

export default function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
    // Attiva tema admin rosso
    document.body.classList.toggle("admin-theme", isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    // Chiude menu quando cambi pagina
    setMobileOpen(false);
  }, [pathname]);

  if (loading) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          VetJobs
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
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
            <>
              <Link href="/vet" className="navbar-link">
                Area Vet
              </Link>
              <Link href="/vet/lavori" className="navbar-link">
                I miei lavori
              </Link>
            </>
          )}

          {user && (
            <Link href="/logout" className="navbar-link">
              Logout
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <div
          className="navbar-toggle"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          ☰
        </div>
      </div>

      {/* Mobile dropdown */}
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
          <>
            <Link href="/vet" className="navbar-link">
              Area Vet
            </Link>
            <Link href="/vet/lavori" className="navbar-link">
              I miei lavori
            </Link>
          </>
        )}

        {user && (
          <Link href="/logout" className="navbar-link">
            Logout
          </Link>
        )}
      </div>
    </nav>
  );
}
