/** Where the money physically is. */
export type Box = 'ec' | 'es'

export type FlatId = 'piso1' | 'piso2' | 'piso3' | 'local'

/**
 * Every kind of movement the family records.
 * - rent:        rent collected in Ecuador (USD), always linked to a flat
 * - expense_ec:  money spent in Ecuador (USD), optionally linked to a flat (repairs)
 * - transfer:    money sent from Ecuador to Spain (USD out, EUR in)
 * - expense_es:  money spent in Spain (EUR)
 * - adjust_ec / adjust_es: opening balance or correction (signed amount)
 */
export type MovementKind = 'rent' | 'expense_ec' | 'transfer' | 'expense_es' | 'adjust_ec' | 'adjust_es'

export interface Movement {
  id: string
  /** Day the money actually moved, ISO yyyy-mm-dd. */
  date: string
  kind: MovementKind
  /** Dollars. Used by rent, expense_ec, transfer (dollars sent) and adjust_ec. */
  amount_usd: number | null
  /** Euros. Used by expense_es, transfer (euros received) and adjust_es. */
  amount_eur: number | null
  flat: FlatId | null
  concept: string
  created_by_name: string
  created_at: string
}

export type NewMovement = Omit<Movement, 'id' | 'created_at' | 'created_by_name'>
