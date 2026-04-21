import { useState, useEffect } from 'react'
import { type User, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import NetworkGuard from './components/NetworkGuard'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'
import ClosedScreen from './components/ClosedScreen'
import { isAppOpen } from './slots'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [appOpen, setAppOpen] = useState(isAppOpen())

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  // Re-check open status every minute
  useEffect(() => {
    const iv = setInterval(() => setAppOpen(isAppOpen()), 60000)
    return () => clearInterval(iv)
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', fontSize: 14 }}>Loading...</div>
    </div>
  )

  if (!appOpen) return <ClosedScreen />

  return (
    <NetworkGuard>
      {user
        ? <Dashboard user={user} />
        : <AuthScreen onAuth={setUser} />
      }
    </NetworkGuard>
  )
}
