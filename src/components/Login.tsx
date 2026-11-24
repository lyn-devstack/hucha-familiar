import { useState, type FormEvent } from 'react'
import { supabase } from '../data/supabase'

export function Login({ onDemo }: { onDemo: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!supabase) return
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError('Email o contraseña incorrectos.')
    setBusy(false)
  }

  return (
    <main className="login">
      <div className="logo" aria-hidden>
        🐷
      </div>
      <h1>Hucha Familiar</h1>
      <p className="lead">Las cuentas compartidas, claras y al día.</p>

      {supabase ? (
        <form onSubmit={submit} className="card">
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary big" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      ) : (
        <p className="meta">Esta versión no tiene base de datos configurada.</p>
      )}

      <button className="demo-btn" onClick={onDemo}>
        <span aria-hidden>✨</span> Probar la demo
        <small>Con datos de ejemplo, sin cuenta</small>
      </button>
    </main>
  )
}
