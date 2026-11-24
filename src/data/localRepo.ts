import type { Movement, NewMovement } from '../types'
import type { Repo } from './repo'
import { demoMovements } from './demoData'

const KEY = 'hucha-familiar-demo-v1'

/** Demo mode: data lives in this browser only. Lets anyone try the app without an account. */
export class LocalRepo implements Repo {
  readonly mode = 'demo' as const
  private readonly userName: string

  constructor(userName = 'Demo') {
    this.userName = userName
  }

  private read(): Movement[] {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return JSON.parse(raw) as Movement[]
    } catch {
      /* storage unavailable or corrupted: fall back to sample data */
    }
    const seed = demoMovements()
    this.write(seed)
    return seed
  }

  private write(list: Movement[]) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list))
    } catch {
      /* ignore */
    }
  }

  async list() {
    return this.read()
  }

  async add(m: NewMovement) {
    const list = this.read()
    list.push({ ...m, id: crypto.randomUUID(), created_at: new Date().toISOString(), created_by_name: this.userName })
    this.write(list)
  }

  async update(id: string, m: NewMovement) {
    this.write(this.read().map((x) => (x.id === id ? { ...x, ...m } : x)))
  }

  async remove(id: string) {
    this.write(this.read().filter((x) => x.id !== id))
  }

  subscribe() {
    return () => {}
  }

  static reset() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  }
}
