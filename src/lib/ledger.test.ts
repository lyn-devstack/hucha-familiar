import { describe, expect, it } from 'vitest'
import type { Movement } from '../types'
import { applyFilters, computeBalances, NO_FILTERS, summaryByFlat, transferRate } from './ledger'
import { parseAmount } from './money'

let n = 0
const mv = (p: Partial<Movement>): Movement => ({
  id: String(n++),
  date: '2026-11-01',
  kind: 'rent',
  amount_usd: null,
  amount_eur: null,
  flat: null,
  concept: 'x',
  created_by_name: 'Test',
  created_at: '2026-11-01T10:00:00Z',
  ...p,
})

describe('computeBalances', () => {
  it('starts at zero', () => {
    expect(computeBalances([])).toEqual({ ec: 0, es: 0, lastRate: null, totalEurApprox: null })
  })

  it('moves money between Ecuador and Spain', () => {
    const b = computeBalances([
      mv({ kind: 'adjust_ec', amount_usd: 1000 }),
      mv({ kind: 'rent', amount_usd: 250, flat: 'piso2' }),
      mv({ kind: 'expense_ec', amount_usd: 100.5, flat: 'piso1' }),
      mv({ kind: 'transfer', amount_usd: 550, amount_eur: 500, date: '2026-11-10' }),
      mv({ kind: 'expense_es', amount_eur: 60 }),
    ])
    expect(b.ec).toBe(599.5)
    expect(b.es).toBe(440)
    expect(b.lastRate).toBe(0.9091)
    expect(b.totalEurApprox).toBeCloseTo(440 + 599.5 * 0.9091, 2)
  })

  it('does not drift with decimals', () => {
    const b = computeBalances([mv({ kind: 'adjust_es', amount_eur: 0.1 }), mv({ kind: 'adjust_es', amount_eur: 0.2 })])
    expect(b.es).toBe(0.3)
  })

  it('accepts negative adjustments', () => {
    const b = computeBalances([mv({ kind: 'adjust_ec', amount_usd: 100 }), mv({ kind: 'adjust_ec', amount_usd: -30 })])
    expect(b.ec).toBe(70)
  })

  it('uses the most recent transfer for the rate', () => {
    const b = computeBalances([
      mv({ kind: 'transfer', amount_usd: 100, amount_eur: 90, date: '2026-12-01' }),
      mv({ kind: 'transfer', amount_usd: 100, amount_eur: 80, date: '2026-01-01' }),
    ])
    expect(b.lastRate).toBe(0.9)
  })
})

describe('transferRate', () => {
  it('is euros per dollar', () => expect(transferRate({ amount_usd: 200, amount_eur: 184 })).toBe(0.92))
  it('is null without both amounts', () => expect(transferRate({ amount_usd: 200, amount_eur: null })).toBeNull())
})

describe('summaryByFlat', () => {
  it('adds rent and repairs per flat', () => {
    const s = summaryByFlat([
      mv({ kind: 'rent', amount_usd: 250, flat: 'piso2', date: '2026-10-01' }),
      mv({ kind: 'rent', amount_usd: 250, flat: 'piso2', date: '2026-11-01' }),
      mv({ kind: 'expense_ec', amount_usd: 400, flat: 'piso1' }),
      mv({ kind: 'expense_ec', amount_usd: 50, flat: 'piso2' }),
      mv({ kind: 'expense_ec', amount_usd: 999 }), // general, no flat
    ])
    expect(s.piso2).toEqual({ rentUsd: 500, expensesUsd: 50, netUsd: 450, lastRentDate: '2026-11-01' })
    expect(s.piso1.netUsd).toBe(-400)
    expect(s.local.rentUsd).toBe(0)
  })
})

describe('applyFilters', () => {
  const list = [
    mv({ kind: 'rent', amount_usd: 1, flat: 'piso3', date: '2026-10-05', concept: 'Alquiler' }),
    mv({ kind: 'transfer', amount_usd: 1, amount_eur: 1, date: '2026-11-02', concept: 'Western Union' }),
    mv({ kind: 'expense_es', amount_eur: 1, date: '2026-11-20', concept: 'Médico' }),
  ]
  it('sorts newest first', () => expect(applyFilters(list, NO_FILTERS).map((m) => m.date)).toEqual(['2026-11-20', '2026-11-02', '2026-10-05']))
  it('transfers appear in both boxes', () => {
    expect(applyFilters(list, { ...NO_FILTERS, box: 'ec' })).toHaveLength(2)
    expect(applyFilters(list, { ...NO_FILTERS, box: 'es' })).toHaveLength(2)
  })
  it('filters by month, flat and text', () => {
    expect(applyFilters(list, { ...NO_FILTERS, month: '2026-11' })).toHaveLength(2)
    expect(applyFilters(list, { ...NO_FILTERS, flat: 'piso3' })).toHaveLength(1)
    expect(applyFilters(list, { ...NO_FILTERS, text: 'médi' })[0].concept).toBe('Médico')
  })
})

describe('parseAmount', () => {
  it.each([
    ['100', 100],
    ['100,5', 100.5],
    ['1.234,56', 1234.56],
    ['1234.56', 1234.56],
    ['-30', -30],
    ['', null],
    ['abc', null],
    ['1,234', null],
  ])('%s → %s', (input, expected) => expect(parseAmount(input)).toBe(expected))
})
