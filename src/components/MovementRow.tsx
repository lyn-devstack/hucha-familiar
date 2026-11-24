import { flatName, KINDS } from '../constants'
import { effect, transferRate } from '../lib/ledger'
import { formatDate, formatEUR, formatUSD } from '../lib/money'
import type { Movement } from '../types'

const signed = (n: number, fmt: (n: number) => string) => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n))

export function MovementRow({ m, onClick }: { m: Movement; onClick: () => void }) {
  const info = KINDS[m.kind]
  const { usd, eur } = effect(m)
  const rate = m.kind === 'transfer' ? transferRate(m) : null
  return (
    <li>
      <button className="mov" onClick={onClick}>
        <span className="mov-icon" aria-hidden>
          {info.emoji}
        </span>
        <span className="mov-main">
          <span className="mov-concept">{m.concept}</span>
          <span className="mov-sub">
            {formatDate(m.date)} · {info.short}
            {m.flat ? ` · ${flatName(m.flat)}` : ''}
            {rate ? ` · 1 $ = ${rate.toLocaleString('es-ES')} €` : ''}
          </span>
        </span>
        <span className="mov-amounts">
          {usd !== 0 && <span className={usd > 0 ? 'pos' : 'neg'}>{signed(usd, formatUSD)}</span>}
          {eur !== 0 && <span className={eur > 0 ? 'pos' : 'neg'}>{signed(eur, formatEUR)}</span>}
          <span className="mov-by">{m.created_by_name}</span>
        </span>
      </button>
    </li>
  )
}
