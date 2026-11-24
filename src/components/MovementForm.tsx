import { useState, type FormEvent } from 'react'
import { FLATS, KIND_ORDER, KINDS } from '../constants'
import { transferRate } from '../lib/ledger'
import { formatEUR, formatUSD, parseAmount, todayISO } from '../lib/money'
import type { FlatId, Movement, MovementKind, NewMovement } from '../types'

interface Props {
  initialKind: MovementKind
  editing?: Movement
  conceptSuggestions: string[]
  onSave: (m: NewMovement) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

const DEFAULT_CONCEPT: Partial<Record<MovementKind, string>> = { rent: 'Alquiler', transfer: 'Envío a España' }

const toInput = (n: number | null | undefined) => (n === null || n === undefined ? '' : String(n).replace('.', ','))

export function MovementForm({ initialKind, editing, conceptSuggestions, onSave, onDelete, onClose }: Props) {
  const [kind, setKind] = useState<MovementKind>(editing?.kind ?? initialKind)
  const [date, setDate] = useState(editing?.date ?? todayISO())
  const [usd, setUsd] = useState(toInput(editing?.amount_usd))
  const [eur, setEur] = useState(toInput(editing?.amount_eur))
  const [flat, setFlat] = useState<FlatId | ''>(editing?.flat ?? '')
  const [concept, setConcept] = useState(editing?.concept ?? '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const info = KINDS[kind]
  const usdNum = parseAmount(usd)
  const eurNum = parseAmount(eur)
  const rate = kind === 'transfer' && usdNum && eurNum ? transferRate({ amount_usd: usdNum, amount_eur: eurNum }) : null

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!date) return setError('Pon la fecha.')
    if (info.usd && (usdNum === null || (!info.signed && usdNum <= 0)))
      return setError(kind === 'transfer' ? 'Pon los dólares que salieron de Ecuador.' : 'Pon una cantidad en dólares válida.')
    if (info.eur && (eurNum === null || (!info.signed && eurNum <= 0)))
      return setError(kind === 'transfer' ? 'Pon los euros que llegaron a España.' : 'Pon una cantidad en euros válida.')
    if (info.flat === 'required' && !flat) return setError('Elige de qué piso es el alquiler.')
    const finalConcept = concept.trim() || DEFAULT_CONCEPT[kind] || ''
    if (!finalConcept) return setError('Escribe un concepto para saber en qué fue.')

    setBusy(true)
    try {
      await onSave({
        date,
        kind,
        amount_usd: info.usd ? usdNum : null,
        amount_eur: info.eur ? eurNum : null,
        flat: info.flat === 'none' || !flat ? null : flat,
        concept: finalConcept,
      })
      onClose()
    } catch (err) {
      setError('No se pudo guardar. ' + (err instanceof Error ? err.message : ''))
    } finally {
      setBusy(false)
    }
  }

  async function doDelete() {
    if (!onDelete) return
    setBusy(true)
    try {
      await onDelete()
      onClose()
    } catch (err) {
      setError('No se pudo borrar. ' + (err instanceof Error ? err.message : ''))
      setBusy(false)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <div className="sheet-head">
          <h2>{editing ? 'Editar movimiento' : 'Apuntar movimiento'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <label className="field">
          <span>Tipo</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as MovementKind)}>
            {KIND_ORDER.map((k) => (
              <option key={k} value={k}>
                {KINDS[k].emoji} {KINDS[k].label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Fecha</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max="2100-12-31" />
        </label>

        {info.usd && (
          <label className="field">
            <span>{kind === 'transfer' ? 'Dólares que salen de Ecuador' : info.signed ? 'Dólares (en negativo para restar)' : 'Dólares'}</span>
            <div className="money-input">
              <span>$</span>
              <input inputMode="decimal" placeholder="0,00" value={usd} onChange={(e) => setUsd(e.target.value)} />
            </div>
          </label>
        )}

        {info.eur && (
          <label className="field">
            <span>{kind === 'transfer' ? 'Euros que llegan a España' : info.signed ? 'Euros (en negativo para restar)' : 'Euros'}</span>
            <div className="money-input">
              <span>€</span>
              <input inputMode="decimal" placeholder="0,00" value={eur} onChange={(e) => setEur(e.target.value)} />
            </div>
          </label>
        )}

        {rate !== null && usdNum && eurNum && (
          <p className="hint">
            Cambio: <strong>1 $ = {rate.toLocaleString('es-ES', { maximumFractionDigits: 4 })} €</strong>. Salen {formatUSD(usdNum)} y llegan{' '}
            {formatEUR(eurNum)}.
          </p>
        )}

        {info.flat !== 'none' && (
          <fieldset className="field">
            <span>{info.flat === 'required' ? 'Piso' : 'Piso (opcional, si el gasto es de un piso)'}</span>
            <div className="chips">
              {info.flat === 'optional' && (
                <button type="button" className={flat === '' ? 'chip on' : 'chip'} onClick={() => setFlat('')}>
                  General
                </button>
              )}
              {FLATS.map((f) => (
                <button key={f.id} type="button" className={flat === f.id ? 'chip on' : 'chip'} onClick={() => setFlat(f.id)}>
                  {f.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <label className="field">
          <span>Concepto</span>
          <input
            list="concepts"
            placeholder={DEFAULT_CONCEPT[kind] ?? '¿En qué fue? Ej.: arreglo tubería'}
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            maxLength={140}
          />
          <datalist id="concepts">
            {conceptSuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        {error && <p className="error">{error}</p>}

        <button className="primary big" disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar'}
        </button>

        {editing && onDelete && (
          <div className="delete-zone">
            {confirmDelete ? (
              <>
                <p>¿Seguro que quieres borrar este movimiento? No se puede deshacer.</p>
                <div className="row">
                  <button type="button" className="ghost" onClick={() => setConfirmDelete(false)}>
                    Cancelar
                  </button>
                  <button type="button" className="danger" onClick={doDelete} disabled={busy}>
                    Sí, borrar
                  </button>
                </div>
              </>
            ) : (
              <button type="button" className="link danger-text" onClick={() => setConfirmDelete(true)}>
                Borrar movimiento
              </button>
            )}
          </div>
        )}
        {editing && <p className="meta">Apuntado por {editing.created_by_name}</p>}
      </form>
    </div>
  )
}
