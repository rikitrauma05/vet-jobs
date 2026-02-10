import Link from "next/link";

export default function Navbar() {
  return (
    <header
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(11,15,23,0.6)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <Link href="/" style={{ fontWeight: 700, letterSpacing: 0.2 }}>
          VetJobs
        </Link>

        <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link className="btn" href="/login">
            Login
          </Link>
          <Link className="btn btnPrimary" href="/register">
            Registrati
          </Link>
        </nav>
      </div>
    </header>
  );
}
