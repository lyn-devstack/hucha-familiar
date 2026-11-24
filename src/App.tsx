import type { Session } from '@supabase/supabase-js'
import { useEffect, useMemo, useState } from 'react'
import { Ledger } from './components/Ledger'
import { Login } from './components/Login'
import { NameSetup } from './components/NameSetup'
import { LocalRepo } from './data/localRepo'
import { supabase } from './data/supabase'
import { SupabaseRepo } from './data/supabaseRepo'

export default function App() {
  // `?demo` in the URL opens the demo directly (used by the README button).
  const [demo, setDemo] = useState(() => new URLSearchParams(window.location.search).has('demo'))
  const [session, setSession] = useState<Session | null>(null)
  const [checking, setChecking] = useState(Boolean(supabase))
  /** Profile name loaded for a given user id (undefined = not loaded yet). */
  const [profile, setProfile] = useState<{ userId: string; name: string | null }>()

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecking(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  useEffect(() => {
    if (!supabase || !userId) return
    void supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => setProfile({ userId, name: data?.name ?? null }))
  }, [userId])

  const nameLoaded = Boolean(userId) && profile?.userId === userId
  const name = nameLoaded ? profile!.name : null

  const repo = useMemo(() => {
    if (demo) return new LocalRepo('Demo')
    if (supabase && userId && name) return new SupabaseRepo(supabase, name)
    return null
  }, [demo, userId, name])

  if (demo && repo)
    return (
      <Ledger
        repo={repo}
        userName="Demo"
        onSignOut={() => {
          LocalRepo.reset()
          window.history.replaceState(null, '', window.location.pathname)
          setDemo(false)
        }}
      />
    )

  if (checking) return <p className="empty">Cargando…</p>
  if (!session) return <Login onDemo={() => setDemo(true)} />
  if (!nameLoaded) return <p className="empty">Cargando…</p>
  if (!name)
    return (
      <NameSetup
        onSave={async (n) => {
          const { error } = await supabase!.from('profiles').upsert({ id: session.user.id, name: n })
          if (error) throw error
          setProfile({ userId: session.user.id, name: n })
        }}
      />
    )

  return <Ledger repo={repo!} userName={name} onSignOut={() => void supabase!.auth.signOut()} />
}
