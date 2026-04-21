import { useState, useEffect } from 'react'
import { type User, onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import NetworkGuard from './components/NetworkGuard'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', fontSize: 14 }}>Loading...</div>
    </div>
  )

  return (
    <NetworkGuard>
      {user
        ? <Dashboard user={user} />
        : <AuthScreen onAuth={setUser} />
      }
    </NetworkGuard>
  )
}
