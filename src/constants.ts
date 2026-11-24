import type { FlatId, MovementKind } from './types'

export interface Flat {
  id: FlatId
  name: string
  note?: string
}

export const FLATS: Flat[] = [
  { id: 'piso1', name: 'Piso 1', note: 'En reformas (humedad)' },
  { id: 'piso2', name: 'Piso 2' },
  { id: 'piso3', name: 'Piso 3' },
  { id: 'local', name: 'Local' },
]

export const flatName = (id: FlatId | null) => FLATS.find((f) => f.id === id)?.name ?? ''

export interface KindInfo {
  label: string
  short: string
  emoji: string
  /** Which currency fields the form asks for. */
  usd: boolean
  eur: boolean
  /** Flat selector: required, optional or hidden. */
  flat: 'required' | 'optional' | 'none'
  signed?: boolean
}

export const KINDS: Record<MovementKind, KindInfo> = {
  rent: { label: 'Cobro de alquiler', short: 'Alquiler', emoji: '🏠', usd: true, eur: false, flat: 'required' },
  expense_ec: { label: 'Gasto en Ecuador', short: 'Gasto Ecuador', emoji: '🔧', usd: true, eur: false, flat: 'optional' },
  transfer: { label: 'Envío a España', short: 'Envío', emoji: '✈️', usd: true, eur: true, flat: 'none' },
  expense_es: { label: 'Gasto en España', short: 'Gasto España', emoji: '🧾', usd: false, eur: true, flat: 'none' },
  adjust_ec: { label: 'Saldo inicial / ajuste Ecuador', short: 'Ajuste Ecuador', emoji: '⚖️', usd: true, eur: false, flat: 'none', signed: true },
  adjust_es: { label: 'Saldo inicial / ajuste España', short: 'Ajuste España', emoji: '⚖️', usd: false, eur: true, flat: 'none', signed: true },
}

export const KIND_ORDER: MovementKind[] = ['rent', 'expense_ec', 'transfer', 'expense_es', 'adjust_ec', 'adjust_es']
