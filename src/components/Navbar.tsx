"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

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
    router.push(href);
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          VetJobs
        </Link>

        <div className="navbar-links desktop-only">
          {/* Sempre visibili */}
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
      </div>
    </nav>
  );
}
