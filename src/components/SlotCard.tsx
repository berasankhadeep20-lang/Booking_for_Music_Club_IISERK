import { useEffect, useState } from 'react'
import { type Slot, type Booking, type SlotStatus } from '../types'
import { getSlotTimes } from '../slots'

const STATUS_COLORS: Record<SlotStatus, string> = {
  open:     '#2ecc71',
  upcoming: '#f5a623',
  full:     '#e74c3c',
  mine:     '#e94560',
  past:     '#444',
  queued:   '#7c5cbf',
}

const STATUS_LABELS: Record<SlotStatus, string> = {
  open:     'Open',
  upcoming: 'Opens soon',
  full:     'Booked',
  mine:     'Your booking',
  past:     'Past',
  queued:   'You\'re queued',
}

function fmt(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}m ${s}s`
}

interface Props {
  slot: Slot
  status: SlotStatus
  booking?: Booking
  opensIn?: number
  queuePosition?: number
  queueLength?: number
  hasBookedToday: boolean
  hasQueuedToday: boolean
  onBook: () => void
  onQueue: () => void
  onCancel: () => void
  onLeaveQueue: () => void
}

export default function SlotCard({
  slot, status, booking, opensIn: initialOpensIn,
  queuePosition, queueLength,
  hasBookedToday, hasQueuedToday,
  onBook, onQueue, onCancel, onLeaveQueue
}: Props) {
  const [countdown, setCountdown] = useState(initialOpensIn ?? 0)

  useEffect(() => {
    if (status !== 'upcoming') return
    const iv = setInterval(() => {
      const { open } = getSlotTimes(slot)
      const diff = open.getTime() - Date.now()
      setCountdown(Math.max(0, diff))
    }, 1000)
    return () => clearInterval(iv)
  }, [status, slot])

  const color = STATUS_COLORS[status]

  const cardStyle: React.CSSProperties = {
    background: status === 'mine' ? 'rgba(233,69,96,0.06)' : status === 'queued' ? 'rgba(124,92,191,0.06)' : 'var(--surface)',
    border: `1px solid ${
      status === 'open'    ? 'rgba(46,204,113,0.35)' :
      status === 'mine'    ? 'rgba(233,69,96,0.4)'   :
      status === 'queued'  ? 'rgba(124,92,191,0.4)'  :
      status === 'upcoming'? 'rgba(245,166,35,0.3)'  :
      'var(--border)'
    }`,
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.25rem',
    opacity: status === 'past' ? 0.45 : 1,
    transition: 'border-color 0.2s',
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{slot.label}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>1 hour slot</div>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: `${color}18`, border: `1px solid ${color}44`, fontSize: 11, fontFamily: 'var(--mono)', color }}>
          {status === 'open' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />}
          {STATUS_LABELS[status]}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' as const }}>
        <div style={{ flex: 1 }}>
          {(status === 'full' || status === 'mine' || status === 'queued') && booking && (
            <>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                {status === 'mine'
                  ? <>You booked this slot {queueLength ? <span style={{ color: 'var(--accent2)' }}>· {queueLength} in queue</span> : null}</>
                  : status === 'queued'
                  ? <span style={{ color: '#7c5cbf' }}>You're #{queuePosition} in queue — slot held by <strong style={{ color: 'var(--text)' }}>{booking.name}</strong></span>
                  : <>Booked by <strong style={{ color: 'var(--text)' }}>{booking.name}</strong> {queueLength ? <span style={{ color: 'var(--muted)' }}>· {queueLength} waiting</span> : null}</>
                }
              </div>
              {status !== 'queued' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {booking.instruments.map(i => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 11, padding: '3px 9px', borderRadius: 6, fontFamily: 'var(--mono)' }}>{i}</span>
                  ))}
                </div>
              )}
            </>
          )}
          {status === 'upcoming' && (
            <div style={{ fontSize: 12, color: 'var(--gold)', fontFamily: 'var(--mono)' }}>
              Opens in {fmt(countdown)}
            </div>
          )}
          {status === 'past'  && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Slot has ended</div>}
          {status === 'open'  && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Available — be the first!</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
          {status === 'open' && !hasBookedToday && (
            <button onClick={onBook} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              Book →
            </button>
          )}
          {status === 'open' && hasBookedToday && (
            <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>1 booking/day</span>
          )}
          {status === 'full' && !hasBookedToday && !hasQueuedToday && (
            <button onClick={onQueue} style={{ background: 'rgba(124,92,191,0.15)', color: '#7c5cbf', border: '1px solid rgba(124,92,191,0.4)', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              Join queue
            </button>
          )}
          {status === 'mine' && (
            <button onClick={onCancel} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              Cancel
            </button>
          )}
          {status === 'queued' && (
            <button onClick={onLeaveQueue} style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              Leave queue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
