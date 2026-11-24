import { KINDS } from '../constants'
import type { Balances } from '../lib/ledger'
import { formatEUR, formatUSD } from '../lib/money'
import type { Movement, MovementKind } from '../types'
import { MovementRow } from './MovementRow'

interface Props {
  balances: Balances
  recent: Movement[]
  onNew: (k: MovementKind) => void
  onOpen: (m: Movement) => void
  onSeeAll: () => void
}

const QUICK: MovementKind[] = ['rent', 'expense_ec', 'transfer', 'expense_es']

export function Home({ balances, recent, onNew, onOpen, onSeeAll }: Props) {
  return (
    <>
      <section className="boxes">
        <article className="box ec">
          <h2>
            <span aria-hidden>🇪🇨</span> En Ecuador
          </h2>
          <p className={balances.ec < 0 ? 'amount neg' : 'amount'}>{formatUSD(balances.ec)}</p>
        </article>
        <article className="box es">
          <h2>
            <span aria-hidden>🇪🇸</span> En España
          </h2>
          <p className={balances.es < 0 ? 'amount neg' : 'amount'}>{formatEUR(balances.es)}</p>
        </article>
      </section>
      {balances.totalEurApprox !== null && (
        <p className="total">
          Total aprox.: <strong>{formatEUR(balances.totalEurApprox)}</strong>
          <span> (con el último cambio, 1 $ = {balances.lastRate?.toLocaleString('es-ES')} €)</span>
        </p>
      )}

      <section className="quick">
        {QUICK.map((k) => (
          <button key={k} className="quick-btn" onClick={() => onNew(k)}>
            <span aria-hidden>{KINDS[k].emoji}</span>
            {KINDS[k].label}
          </button>
        ))}
      </section>

      <section>
        <div className="section-head">
          <h2>Últimos movimientos</h2>
          {recent.length > 0 && (
            <button className="link" onClick={onSeeAll}>
              Ver todos
            </button>
          )}
        </div>
        {recent.length === 0 ? (
          <p className="empty">
            Aún no hay movimientos. Empieza apuntando el <strong>saldo inicial</strong> de cada caja (botón + → «Saldo inicial / ajuste»).
          </p>
        ) : (
          <ul className="movs">
            {recent.map((m) => (
              <MovementRow key={m.id} m={m} onClick={() => onOpen(m)} />
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
