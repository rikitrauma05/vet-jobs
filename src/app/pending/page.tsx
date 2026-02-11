export default function PendingPage() {
  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h1>Account in attesa di approvazione</h1>
      <p className="muted">
        Il tuo account è stato creato correttamente, ma non è ancora stato approvato
        da un amministratore.
        <br />
        <br />
        Riprova più tardi.
      </p>
    </div>
  );
}
