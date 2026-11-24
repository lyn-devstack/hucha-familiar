import { useState, type FormEvent } from 'react'

/** First login: ask how this person wants to appear next to the movements they record. */
export function NameSetup({ onSave }: { onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setError('Escribe tu nombre.')
    setBusy(true)
    try {
      await onSave(name.trim())
    } catch {
      setError('No se pudo guardar, inténtalo de nuevo.')
      setBusy(false)
    }
  }

  return (
    <main className="login">
      <div className="logo" aria-hidden>
        👋
      </div>
      <h1>¿Cómo te llamas?</h1>
      <p className="lead">Saldrá al lado de cada movimiento que apuntes, para saber quién lo apuntó.</p>
      <form onSubmit={submit} className="card">
        <label className="field">
          <span>Nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Ana" maxLength={30} autoFocus />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary big" disabled={busy}>
          Continuar
        </button>
      </form>
    </main>
  )
}
