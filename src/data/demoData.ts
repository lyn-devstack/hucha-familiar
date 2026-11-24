import type { Movement, NewMovement } from '../types'

/** Sample data for the public demo (invented amounts). Dates are relative to today. */
export function demoMovements(): Movement[] {
  const day = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() - offset)
    return d.toISOString().slice(0, 10)
  }
  const rows: (NewMovement & { by: string; offset: number })[] = [
    { offset: 120, kind: 'adjust_ec', amount_usd: 1500, amount_eur: null, flat: null, concept: 'Saldo inicial en Ecuador', by: 'Mamá', date: '' },
    { offset: 118, kind: 'adjust_es', amount_usd: null, amount_eur: 200, flat: null, concept: 'Saldo inicial en España', by: 'Yo', date: '' },
    { offset: 95, kind: 'rent', amount_usd: 250, amount_eur: null, flat: 'piso2', concept: 'Alquiler', by: 'Mamá', date: '' },
    { offset: 94, kind: 'rent', amount_usd: 230, amount_eur: null, flat: 'piso3', concept: 'Alquiler', by: 'Mamá', date: '' },
    { offset: 93, kind: 'rent', amount_usd: 300, amount_eur: null, flat: 'local', concept: 'Alquiler', by: 'Mamá', date: '' },
    { offset: 80, kind: 'expense_ec', amount_usd: 420, amount_eur: null, flat: 'piso1', concept: 'Impermeabilización pared (humedad)', by: 'Mamá', date: '' },
    { offset: 70, kind: 'transfer', amount_usd: 550, amount_eur: 500, flat: null, concept: 'Traído en el viaje', by: 'Mamá', date: '' },
    { offset: 64, kind: 'rent', amount_usd: 250, amount_eur: null, flat: 'piso2', concept: 'Alquiler', by: 'Mamá', date: '' },
    { offset: 63, kind: 'rent', amount_usd: 230, amount_eur: null, flat: 'piso3', concept: 'Alquiler', by: 'Mamá', date: '' },
    { offset: 62, kind: 'rent', amount_usd: 300, amount_eur: null, flat: 'local', concept: 'Alquiler', by: 'Mamá', date: '' },
    { offset: 55, kind: 'expense_ec', amount_usd: 85, amount_eur: null, flat: null, concept: 'Impuesto predial', by: 'Mamá', date: '' },
    { offset: 40, kind: 'expense_es', amount_usd: null, amount_eur: 120, flat: null, concept: 'Regalo cumpleaños tía', by: 'Yo', date: '' },
    { offset: 34, kind: 'rent', amount_usd: 250, amount_eur: null, flat: 'piso2', concept: 'Alquiler', by: 'Mamá', date: '' },
    { offset: 33, kind: 'rent', amount_usd: 300, amount_eur: null, flat: 'local', concept: 'Alquiler', by: 'Mamá', date: '' },
    { offset: 28, kind: 'expense_ec', amount_usd: 310, amount_eur: null, flat: 'piso1', concept: 'Pintura y materiales', by: 'Mamá', date: '' },
    { offset: 20, kind: 'transfer', amount_usd: 1100, amount_eur: 980, flat: null, concept: 'Envío por Western Union', by: 'Yo', date: '' },
    { offset: 10, kind: 'expense_es', amount_usd: null, amount_eur: 60, flat: null, concept: 'Médico', by: 'Yo', date: '' },
    { offset: 4, kind: 'rent', amount_usd: 230, amount_eur: null, flat: 'piso3', concept: 'Alquiler (con retraso)', by: 'Mamá', date: '' },
  ]
  return rows.map(({ by, offset, ...m }, i) => ({
    ...m,
    date: day(offset),
    id: `demo-${i}`,
    created_by_name: by,
    created_at: new Date(Date.now() - offset * 86400000).toISOString(),
  }))
}
