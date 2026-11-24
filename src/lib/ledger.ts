import type { FlatId, Movement, MovementKind } from '../types'
import { fromCents, toCents } from './money'

export interface Balances {
  /** Dollars still in Ecuador. */
  ec: number
  /** Euros in Spain. */
  es: number
  /** EUR per USD of the most recent transfer, if any. */
  lastRate: number | null
  /** Everything expressed in euros using lastRate (null if no rate yet). */
  totalEurApprox: number | null
}

export function computeBalances(movements: Movement[]): Balances {
  let ec = 0
  let es = 0
  for (const m of movements) {
    const usd = toCents(m.amount_usd)
    const eur = toCents(m.amount_eur)
    switch (m.kind) {
      case 'rent':
      case 'adjust_ec':
        ec += usd
        break
      case 'expense_ec':
        ec -= usd
        break
      case 'transfer':
        ec -= usd
        es += eur
        break
      case 'expense_es':
        es -= eur
        break
      case 'adjust_es':
        es += eur
        break
    }
  }
  const lastRate = latestRate(movements)
  const totalEurApprox = lastRate === null ? null : round2(fromCents(es) + fromCents(ec) * lastRate)
  return { ec: fromCents(ec), es: fromCents(es), lastRate, totalEurApprox }
}

/** Euros received per dollar sent. */
export function transferRate(m: Pick<Movement, 'amount_usd' | 'amount_eur'>): number | null {
  if (!m.amount_usd || !m.amount_eur) return null
  return Math.round((m.amount_eur / m.amount_usd) * 10000) / 10000
}

export function latestRate(movements: Movement[]): number | null {
  const transfers = movements.filter((m) => m.kind === 'transfer' && transferRate(m) !== null)
  if (!transfers.length) return null
  const last = sortByDateDesc(transfers)[0]
  return transferRate(last)
}

export interface FlatSummary {
  rentUsd: number
  expensesUsd: number
  /** rent − expenses */
  netUsd: number
  lastRentDate: string | null
}

export function summaryByFlat(movements: Movement[]): Record<FlatId, FlatSummary> {
  const empty = (): FlatSummary => ({ rentUsd: 0, expensesUsd: 0, netUsd: 0, lastRentDate: null })
  const acc = { piso1: empty(), piso2: empty(), piso3: empty(), local: empty() }
  const cents = { piso1: [0, 0], piso2: [0, 0], piso3: [0, 0], local: [0, 0] }
  for (const m of movements) {
    if (!m.flat) continue
    if (m.kind === 'rent') {
      cents[m.flat][0] += toCents(m.amount_usd)
      const last = acc[m.flat].lastRentDate
      if (!last || m.date > last) acc[m.flat].lastRentDate = m.date
    } else if (m.kind === 'expense_ec') {
      cents[m.flat][1] += toCents(m.amount_usd)
    }
  }
  for (const id of Object.keys(acc) as FlatId[]) {
    const [rent, exp] = cents[id]
    acc[id].rentUsd = fromCents(rent)
    acc[id].expensesUsd = fromCents(exp)
    acc[id].netUsd = fromCents(rent - exp)
  }
  return acc
}

export interface Filters {
  box: 'all' | 'ec' | 'es'
  kind: 'all' | MovementKind
  flat: 'all' | FlatId
  /** yyyy-mm or '' */
  month: string
  text: string
}

export const NO_FILTERS: Filters = { box: 'all', kind: 'all', flat: 'all', month: '', text: '' }

const EC_KINDS: MovementKind[] = ['rent', 'expense_ec', 'transfer', 'adjust_ec']
const ES_KINDS: MovementKind[] = ['transfer', 'expense_es', 'adjust_es']

export function applyFilters(movements: Movement[], f: Filters): Movement[] {
  const text = f.text.trim().toLowerCase()
  return sortByDateDesc(
    movements.filter((m) => {
      if (f.box === 'ec' && !EC_KINDS.includes(m.kind)) return false
      if (f.box === 'es' && !ES_KINDS.includes(m.kind)) return false
      if (f.kind !== 'all' && m.kind !== f.kind) return false
      if (f.flat !== 'all' && m.flat !== f.flat) return false
      if (f.month && !m.date.startsWith(f.month)) return false
      if (text && !m.concept.toLowerCase().includes(text)) return false
      return true
    }),
  )
}

export function sortByDateDesc(movements: Movement[]): Movement[] {
  return [...movements].sort((a, b) =>
    a.date === b.date ? b.created_at.localeCompare(a.created_at) : b.date.localeCompare(a.date),
  )
}

/** Signed effect of a movement on each box, for display. */
export function effect(m: Movement): { usd: number; eur: number } {
  const usd = m.amount_usd ?? 0
  const eur = m.amount_eur ?? 0
  switch (m.kind) {
    case 'rent':
    case 'adjust_ec':
      return { usd, eur: 0 }
    case 'expense_ec':
      return { usd: -usd, eur: 0 }
    case 'transfer':
      return { usd: -usd, eur }
    case 'expense_es':
      return { usd: 0, eur: -eur }
    case 'adjust_es':
      return { usd: 0, eur }
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100
