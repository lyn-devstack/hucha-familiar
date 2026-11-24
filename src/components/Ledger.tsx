import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Repo } from '../data/repo'
import { computeBalances, type Filters, NO_FILTERS, sortByDateDesc } from '../lib/ledger'
import type { FlatId, Movement, MovementKind, NewMovement } from '../types'
import { Flats } from './Flats'
import { History } from './History'
import { Home } from './Home'
import { MovementForm } from './MovementForm'

type Tab = 'home' | 'history' | 'flats'

interface Props {
  repo: Repo
  userName: string
  onSignOut: () => void
}

type FormState = { kind: MovementKind; editing?: Movement } | null

export function Ledger({ repo, userName, onSignOut }: Props) {
  const [movements, setMovements] = useState<Movement[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState<Tab>('home')
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const [form, setForm] = useState<FormState>(null)

  const refresh = useCallback(async () => {
    try {
      setMovements(await repo.list())
      setLoadError('')
    } catch (e) {
      setLoadError('No se pudieron cargar los datos. ' + (e instanceof Error ? e.message : ''))
    } finally {
      setLoading(false)
    }
  }, [repo])

  useEffect(() => {
    void refresh()
    const unsubscribe = repo.subscribe(() => void refresh())
    const onFocus = () => void refresh()
    window.addEventListener('focus', onFocus)
    return () => {
      unsubscribe()
      window.removeEventListener('focus', onFocus)
    }
  }, [repo, refresh])

  const balances = useMemo(() => computeBalances(movements), [movements])
  const recent = useMemo(() => sortByDateDesc(movements).slice(0, 6), [movements])
  const concepts = useMemo(() => [...new Set(movements.map((m) => m.concept))].slice(0, 50), [movements])

  async function save(m: NewMovement) {
    if (form?.editing) await repo.update(form.editing.id, m)
    else await repo.add(m)
    await refresh()
  }

  async function remove() {
    if (!form?.editing) return
    await repo.remove(form.editing.id)
    await refresh()
  }

  const seeFlat = (id: FlatId) => {
    setFilters({ ...NO_FILTERS, flat: id })
    setTab('history')
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>🐷 Hucha Familiar</h1>
          <p className="meta">
            {repo.mode === 'demo' ? 'Modo demo · datos de ejemplo en este navegador' : `Hola, ${userName}`}
          </p>
        </div>
        <button className="link" onClick={onSignOut}>
          {repo.mode === 'demo' ? 'Salir de la demo' : 'Cerrar sesión'}
        </button>
      </header>

      <main className="content">
        {loading ? (
          <p className="empty">Cargando…</p>
        ) : loadError ? (
          <p className="error">{loadError}</p>
        ) : tab === 'home' ? (
          <Home
            balances={balances}
            recent={recent}
            onNew={(kind) => setForm({ kind })}
            onOpen={(m) => setForm({ kind: m.kind, editing: m })}
            onSeeAll={() => setTab('history')}
          />
        ) : tab === 'history' ? (
          <History movements={movements} filters={filters} setFilters={setFilters} onOpen={(m) => setForm({ kind: m.kind, editing: m })} />
        ) : (
          <Flats movements={movements} onSeeFlat={seeFlat} />
        )}
      </main>

      <button className="fab" onClick={() => setForm({ kind: 'expense_ec' })} aria-label="Apuntar movimiento">
        +
      </button>

      <nav className="tabbar">
        {(
          [
            ['home', '🏦', 'Inicio'],
            ['history', '📋', 'Movimientos'],
            ['flats', '🏠', 'Pisos'],
          ] as const
        ).map(([id, icon, label]) => (
          <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}>
            <span aria-hidden>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {form && (
        <MovementForm
          key={form.editing?.id ?? form.kind}
          initialKind={form.kind}
          editing={form.editing}
          conceptSuggestions={concepts}
          onSave={save}
          onDelete={form.editing ? remove : undefined}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  )
}
