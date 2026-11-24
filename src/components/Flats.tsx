import { useMemo } from 'react'
import { FLATS } from '../constants'
import { summaryByFlat } from '../lib/ledger'
import { formatDate, formatUSD } from '../lib/money'
import type { FlatId, Movement } from '../types'

interface Props {
  movements: Movement[]
  onSeeFlat: (id: FlatId) => void
}

export function Flats({ movements, onSeeFlat }: Props) {
  const summary = useMemo(() => summaryByFlat(movements), [movements])
  return (
    <ul className="flats">
      {FLATS.map((f) => {
        const s = summary[f.id]
        return (
          <li key={f.id} className="flat">
            <div className="flat-head">
              <h2>{f.name}</h2>
              {f.note && <span className="badge">{f.note}</span>}
            </div>
            <dl>
              <div>
                <dt>Alquileres cobrados</dt>
                <dd className="pos">{formatUSD(s.rentUsd)}</dd>
              </div>
              <div>
                <dt>Gastos y arreglos</dt>
                <dd className="neg">{formatUSD(s.expensesUsd)}</dd>
              </div>
              <div>
                <dt>Balance</dt>
                <dd className={s.netUsd < 0 ? 'neg strong' : 'strong'}>{formatUSD(s.netUsd)}</dd>
              </div>
            </dl>
            <p className="meta">{s.lastRentDate ? `Último alquiler: ${formatDate(s.lastRentDate)}` : 'Sin alquileres apuntados'}</p>
            <button className="link" onClick={() => onSeeFlat(f.id)}>
              Ver movimientos de {f.name} →
            </button>
          </li>
        )
      })}
    </ul>
  )
}
