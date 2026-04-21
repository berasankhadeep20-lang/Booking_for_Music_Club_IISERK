import { useState } from 'react'
import { signInWithPopup, signOut, type User } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const ALLOWED_DOMAIN = '@iiserkol.ac.in'

const s: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  logo: { fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' as const },
  title: { fontSize: 38, fontWeight: 800, textAlign: 'center' as const, lineHeight: 1.1, marginBottom: 8 },
  accent: { color: 'var(--accent)' },
  sub: { fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', marginBottom: 48, textAlign: 'center' as const },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: 400 },
  cardTitle: { fontSize: 18, fontWeight: 700, marginBottom: 6 },
  cardSub: { fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)', marginBottom: '1.5rem', lineHeight: 1.6 },
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
    width: '100%', padding: '12px 20px', background: '#fff', color: '#1a1a1a',
    border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'var(--font)', transition: 'opacity 0.2s',
  },
  error: { marginTop: 16, padding: '10px 14px', background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 8, fontSize: 13, color: '#e94560', fontFamily: 'var(--mono)' },
  rules: { marginTop: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.2rem', width: '100%', maxWidth: 400 },
  rulesTitle: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 10 },
  ruleItem: { fontSize: 13, color: 'var(--muted)', display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  dash: { color: 'var(--accent)', flexShrink: 0 },
}

interface Props { onAuth: (user: User) => void }

export default function AuthScreen({ onAuth }: Props) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const email = result.user.email || ''
      if (!email.endsWith(ALLOWED_DOMAIN)) {
        await signOut(auth)
        setError(`Only @iiserkol.ac.in accounts are allowed. You signed in with: ${email}`)
        setLoading(false)
        return
      }
      onAuth(result.user)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      if (!msg.includes('popup-closed')) setError(msg)
      setLoading(false)
    }
  }

  return (
    <div style={s.wrap}>
      <div style={s.logo}>IISER Kolkata</div>
      <div style={s.title}>Music Club <span style={s.accent}>Booking</span></div>
      <div style={s.sub}>// fair · instant · automatic</div>

      <div style={s.card}>
        <div style={s.cardTitle}>Sign in to book</div>
        <div style={s.cardSub}>Use your IISERK Google account to continue. Only @iiserkol.ac.in emails are accepted.</div>
        <button style={{ ...s.googleBtn, opacity: loading ? 0.6 : 1 }} onClick={handleGoogleLogin} disabled={loading}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
        {error && <div style={s.error}>{error}</div>}
      </div>

      <div style={s.rules}>
        <div style={s.rulesTitle}>Rules</div>
        {[
          'Booking window opens exactly 1 hour before each slot',
          'One booking per student per day — enforced automatically',
          'Select which instruments you\'ll use when booking',
          'Cancel up to 15 minutes before your slot starts',
          'Must be connected to IISERK campus WiFi',
        ].map((r, i) => (
          <div key={i} style={s.ruleItem}><span style={s.dash}>—</span><span>{r}</span></div>
        ))}
      </div>
    </div>
  )
}
