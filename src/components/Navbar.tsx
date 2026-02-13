"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/logout");
    router.replace("/login");
    router.refresh();
  }

  function handleProtectedClick(
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    e.preventDefault();
    setMobileOpen(false);
    router.push(href);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand" onClick={closeMobile}>
          VetJobs
        </Link>

        {/* DESKTOP */}
        <div className="navbar-links desktop-only">
          <Link href="/login" className="navbar-link">
            Login
          </Link>

          <Link href="/register" className="navbar-link">
            Registrati
          </Link>

          <Link
            href="/admin"
            className="navbar-link"
            onClick={(e) => handleProtectedClick(e, "/admin")}
          >
            Dashboard
          </Link>

          <Link
            href="/admin/clienti"
            className="navbar-link"
            onClick={(e) => handleProtectedClick(e, "/admin/clienti")}
          >
            Clienti
          </Link>

          <Link
            href="/admin/prestazioni"
            className="navbar-link"
            onClick={(e) => handleProtectedClick(e, "/admin/prestazioni")}
          >
            Prestazioni
          </Link>

          <Link
            href="/admin/lavori"
            className="navbar-link"
            onClick={(e) => handleProtectedClick(e, "/admin/lavori")}
          >
            Lavori
          </Link>

          <button onClick={handleLogout} className="navbar-link">
            Logout
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <div
          className="navbar-toggle mobile-only"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          ☰
        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`navbar-mobile ${mobileOpen ? "active" : ""}`}>
        <Link href="/login" className="navbar-link" onClick={closeMobile}>
          Login
        </Link>

        <Link href="/register" className="navbar-link" onClick={closeMobile}>
          Registrati
        </Link>

        <Link
          href="/admin"
          className="navbar-link"
          onClick={(e) => handleProtectedClick(e, "/admin")}
        >
          Dashboard
        </Link>

        <Link
          href="/admin/clienti"
          className="navbar-link"
          onClick={(e) => handleProtectedClick(e, "/admin/clienti")}
        >
          Clienti
        </Link>

        <Link
          href="/admin/prestazioni"
          className="navbar-link"
          onClick={(e) => handleProtectedClick(e, "/admin/prestazioni")}
        >
          Prestazioni
        </Link>

        <Link
          href="/admin/lavori"
          className="navbar-link"
          onClick={(e) => handleProtectedClick(e, "/admin/lavori")}
        >
          Lavori
        </Link>

        <button onClick={handleLogout} className="navbar-link">
          Logout
        </button>
      </div>
    </nav>
  );
}
