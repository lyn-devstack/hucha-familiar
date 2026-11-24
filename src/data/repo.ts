import type { Movement, NewMovement } from '../types'

/**
 * Storage abstraction: the app talks to this interface only,
 * so it runs against Supabase in production and localStorage in demo mode.
 */
export interface Repo {
  readonly mode: 'cloud' | 'demo'
  list(): Promise<Movement[]>
  add(m: NewMovement): Promise<void>
  update(id: string, m: NewMovement): Promise<void>
  remove(id: string): Promise<void>
  /** Calls back when someone else changes data. Returns an unsubscribe function. */
  subscribe(onChange: () => void): () => void
}
