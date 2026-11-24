import type { SupabaseClient } from '@supabase/supabase-js'
import type { Movement, NewMovement } from '../types'
import type { Repo } from './repo'

const COLUMNS = 'id, date, kind, amount_usd, amount_eur, flat, concept, created_by_name, created_at'

export class SupabaseRepo implements Repo {
  readonly mode = 'cloud' as const
  private readonly db: SupabaseClient
  private readonly userName: string

  constructor(db: SupabaseClient, userName: string) {
    this.db = db
    this.userName = userName
  }

  async list(): Promise<Movement[]> {
    const { data, error } = await this.db.from('movements').select(COLUMNS).order('date', { ascending: false })
    if (error) throw error
    return (data ?? []).map(normalize)
  }

  async add(m: NewMovement) {
    const { error } = await this.db.from('movements').insert({ ...m, created_by_name: this.userName })
    if (error) throw error
  }

  async update(id: string, m: NewMovement) {
    const { error } = await this.db.from('movements').update(m).eq('id', id)
    if (error) throw error
  }

  async remove(id: string) {
    const { error } = await this.db.from('movements').delete().eq('id', id)
    if (error) throw error
  }

  subscribe(onChange: () => void) {
    const channel = this.db
      .channel('movements-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movements' }, onChange)
      .subscribe()
    return () => {
      void this.db.removeChannel(channel)
    }
  }
}

/** Postgres numeric columns arrive as strings; make them numbers. */
function normalize(row: Record<string, unknown>): Movement {
  const num = (v: unknown) => (v === null || v === undefined ? null : Number(v))
  return { ...(row as unknown as Movement), amount_usd: num(row.amount_usd), amount_eur: num(row.amount_eur) }
}
