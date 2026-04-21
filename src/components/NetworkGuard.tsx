import { useEffect, useState, type ReactNode } from 'react'
import { checkOnCampusNetwork } from '../networkCheck'

const s: Record<string, React.CSSProperties> = {
  wrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2.5rem 2rem', maxWidth: 420, width: '100%', textAlign: 'center' },
  icon: { fontSize: 48, marginBottom: '1rem' },
  title: { fontSize: 22, fontWeight: 800, marginBottom: 8 },
  sub: { fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.5rem', fontFamily: 'var(--mono)' },
  ip: { fontFamily: 'var(--mono)', fontSize: 13, background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: 8, display: 'inline-block', marginBottom: '1.5rem', color: 'var(--gold)' },
  btn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontFamily: 'var(--font)', fontWeight: 700, fontSize: 15, cursor: 'pointer' },
}

export default function NetworkGuard({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'checking' | 'ok' | 'blocked'>('checking')
  const [ip, setIp] = useState('')

  async function check() {
    setState('checking')
    try {
      const { ok, ip } = await checkOnCampusNetwork()
      setIp(ip)
      setState(ok ? 'ok' : 'blocked')
    } catch {
      setState('blocked')
      setIp('unknown')
    }
  }

  useEffect(() => { check() }, [])

  if (state === 'checking') return (
    <div style={s.wrap}>
      <div style={s.card}>
        <div style={s.icon}>📡</div>
        <div style={s.title}>Checking network...</div>
        <div style={s.sub}>Verifying you are on IISERK campus WiFi</div>
      </div>
    </div>
  )

  if (state === 'blocked') return (
    <div style={s.wrap}>
      <div style={{ ...s.card, borderColor: 'rgba(233,69,96,0.3)' }}>
        <div style={s.icon}>🔒</div>
        <div style={s.title}>Campus WiFi Required</div>
        <div style={s.ip}>Your IP: {ip || 'unknown'}</div>
        <div style={s.sub}>
          This app is only accessible from the IISERK campus network.<br />
          Connect to IISERK WiFi and try again.
        </div>
        <button style={s.btn} onClick={check}>Retry</button>
      </div>
    </div>
  )

  return <>{children}</>
}
