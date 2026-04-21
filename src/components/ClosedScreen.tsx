export default function ClosedScreen() {
  const now = new Date()
  const h = now.getHours()

  // Between 1AM and 6AM — show closed
  const minsUntil6AM = ((6 - h) * 60) - now.getMinutes()
  const hrs = Math.floor(minsUntil6AM / 60)
  const mins = minsUntil6AM % 60

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 64, marginBottom: '1rem' }}>🎸</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>IISER Kolkata Music Club</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Room's closed</div>
        <div style={{ fontSize: 14, color: 'var(--muted)', fontFamily: 'var(--mono)', lineHeight: 1.8 }}>
          The music room is open<br />
          <span style={{ color: 'var(--text)', fontWeight: 700 }}>6:00 AM – 12:00 AM</span><br /><br />
          Come back in{' '}
          <span style={{ color: 'var(--gold)' }}>
            {hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`}
          </span>
        </div>
        <div style={{ marginTop: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
          💡 Tip: You can pre-book the 6 AM slot from midnight
        </div>
      </div>
    </div>
  )
}
