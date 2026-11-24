import { useMemo } from 'react'
import { FLATS, KIND_ORDER, KINDS } from '../constants'
import { applyFilters, effect, type Filters, NO_FILTERS } from '../lib/ledger'
import { formatEUR, formatUSD, fromCents, toCents } from '../lib/money'
import type { FlatId, Movement, MovementKind } from '../types'
import { MovementRow } from './MovementRow'

interface Props {
  movements: Movement[]
  filters: Filters
  setFilters: (f: Filters) => void
  onOpen: (m: Movement) => void
}

export function History({ movements, filters, setFilters, onOpen }: Props) {
  const list = useMemo(() => applyFilters(movements, filters), [movements, filters])
  const totals = useMemo(() => {
    let usd = 0
    let eur = 0
    for (const m of list) {
      const e = effect(m)
      usd += toCents(e.usd)
      eur += toCents(e.eur)
    }
    return { usd: fromCents(usd), eur: fromCents(eur) }
  }, [list])
  const set = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch })
  const active = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS)

  return (
    <>
      <div className="chips" role="group" aria-label="Caja">
        {(
          [
            ['all', 'Todo'],
            ['ec', '🇪🇨 Ecuador'],
            ['es', '🇪🇸 España'],
          ] as const
        ).map(([v, l]) => (
          <button key={v} className={filters.box === v ? 'chip on' : 'chip'} onClick={() => set({ box: v })}>
            {l}
          </button>
        ))}
      </div>

      <div className="filters">
        <select value={filters.kind} onChange={(e) => set({ kind: e.target.value as 'all' | MovementKind })} aria-label="Tipo">
          <option value="all">Todos los tipos</option>
          {KIND_ORDER.map((k) => (
            <option key={k} value={k}>
              {KINDS[k].short}
            </option>
          ))}
        </select>
        <select value={filters.flat} onChange={(e) => set({ flat: e.target.value as 'all' | FlatId })} aria-label="Piso">
          <option value="all">Todos los pisos</option>
          {FLATS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        <input type="month" value={filters.month} onChange={(e) => set({ month: e.target.value })} aria-label="Mes" />
        <input type="search" placeholder="Buscar concepto…" value={filters.text} onChange={(e) => set({ text: e.target.value })} />
      </div>

      <div className="section-head">
        <p className="meta">
          {list.length} movimiento{list.length === 1 ? '' : 's'}
          {active && (
            <>
              {' '}· neto {totals.usd !== 0 && formatUSD(totals.usd)}
              {totals.usd !== 0 && totals.eur !== 0 && ' / '}
              {totals.eur !== 0 && formatEUR(totals.eur)}
            </>
          )}
        </p>
        {active && (
          <button className="link" onClick={() => setFilters(NO_FILTERS)}>
            Quitar filtros
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="empty">No hay movimientos con estos filtros.</p>
      ) : (
        <ul className="movs">
          {list.map((m) => (
            <MovementRow key={m.id} m={m} onClick={() => onOpen(m)} />
          ))}
        </ul>
      )}
    </>
  )
}
