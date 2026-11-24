/** Work in integer cents so sums never drift (0.1 + 0.2 !== 0.3). */
export const toCents = (n: number | null | undefined) => Math.round((n ?? 0) * 100)
export const fromCents = (c: number) => c / 100

const usdFmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' })
const eurFmt = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

export const formatUSD = (n: number) => usdFmt.format(n)
export const formatEUR = (n: number) => eurFmt.format(n)

/** Accepts "1.234,56", "1234,56" or "1234.56" as typed on a Spanish phone keyboard. */
export function parseAmount(input: string): number | null {
  const s = input.trim().replace(/\s/g, '')
  if (!s) return null
  let normalized = s
  if (s.includes(',')) normalized = s.replace(/\./g, '').replace(',', '.')
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Number(normalized)
}

const dateFmt = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
export const formatDate = (iso: string) => dateFmt.format(new Date(iso + 'T12:00:00'))

export const todayISO = () => {
  const d = new Date()
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}
