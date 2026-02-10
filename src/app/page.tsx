export default function HomePage() {
  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>Deploy check</h1>
      <p className="muted" style={{ marginBottom: 16 }}>
        Questa è una base minimale per verificare che progetto, GitHub e Vercel siano stabili
        prima di introdurre autenticazione e redirect.
      </p>

      <div className="row">
        <a className="btn" href="/login">
          Vai a Login
        </a>
        <a className="btn btnPrimary" href="/register">
          Vai a Registrazione
        </a>
      </div>
    </div>
  );
}
