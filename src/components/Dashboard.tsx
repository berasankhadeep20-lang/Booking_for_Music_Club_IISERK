import { useState, useEffect, useCallback } from 'react'
import { type User, signOut } from 'firebase/auth'
import { ref, onValue, set, remove, get } from 'firebase/database'
import { auth, db } from '../firebase'
import { SLOTS, getSlotStatus, getUserBookingToday, getUserQueuedToday, todayKey, canCancel } from '../slots'
import { type Booking, type QueueEntry } from '../types'
import SlotCard from './SlotCard'
import BookingModal from './BookingModal'
import { useToast } from '../hooks/useToast'

interface Props { user: User }

export default function Dashboard({ user }: Props) {
  const [bookings, setBookings] = useState<Record<string, Booking>>({})
  const [queues, setQueues] = useState<Record<string, Record<string, QueueEntry>>>({})
  const [modalSlot, setModalSlot] = useState<string | null>(null)
  const [modalMode, setModalMode] = useState<'book' | 'queue'>('book')
  const [, setTick] = useState(0)
  const { toast, msg, visible } = useToast()

  const day = todayKey()

  // live-sync bookings
  useEffect(() => {
    const unsub = onValue(ref(db, `bookings/${day}`), snap => setBookings(snap.val() ?? {}))
    return unsub
  }, [day])

  // live-sync queues
  useEffect(() => {
    const unsub = onValue(ref(db, `queues/${day}`), snap => setQueues(snap.val() ?? {}))
    return unsub
  }, [day])

  // re-render every 10s for countdowns
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(iv)
  }, [])

  // ── Book a slot ──────────────────────────────────────────────
  const handleBook = useCallback(async (slotId: string, instruments: string[]) => {
    const booking: Booking = {
      uid: user.uid,
      name: user.displayName || user.email || 'Unknown',
      email: user.email || '',
      instruments,
      timestamp: Date.now(),
      day,
      slotId,
    }
    try {
      await set(ref(db, `bookings/${day}/${slotId}`), booking)
      toast(`Booked! ${SLOTS.find(s => s.id === slotId)?.label}`)
    } catch {
      toast('Booking failed — slot may have just been taken!')
    }
    setModalSlot(null)
  }, [user, day, toast])

  // ── Join queue ───────────────────────────────────────────────
  const handleJoinQueue = useCallback(async (slotId: string, instruments: string[]) => {
    const entry: QueueEntry = {
      uid: user.uid,
      name: user.displayName || user.email || 'Unknown',
      email: user.email || '',
      instruments,
      timestamp: Date.now(),
      day,
      slotId,
    }
    await set(ref(db, `queues/${day}/${slotId}/${user.uid}`), entry)
    toast(`You're in the queue for ${SLOTS.find(s => s.id === slotId)?.label}`)
    setModalSlot(null)
  }, [user, day, toast])

  // ── Cancel booking → auto-assign to first in queue ───────────
  const handleCancel = useCallback(async (slotId: string) => {
    const slot = SLOTS.find(s => s.id === slotId)!
    if (!canCancel(slot)) { toast('Cannot cancel within 15 minutes of slot start'); return }

    // fetch current queue for this slot
    const queueSnap = await get(ref(db, `queues/${day}/${slotId}`))
    const queueData: Record<string, QueueEntry> = queueSnap.val() ?? {}
    const sorted = Object.values(queueData).sort((a, b) => a.timestamp - b.timestamp)

    if (sorted.length > 0) {
      // promote first in queue to booking
      const next = sorted[0]
      const newBooking: Booking = {
        uid: next.uid,
        name: next.name,
        email: next.email,
        instruments: next.instruments,
        timestamp: Date.now(),
        day,
        slotId,
      }
      await set(ref(db, `bookings/${day}/${slotId}`), newBooking)
      await remove(ref(db, `queues/${day}/${slotId}/${next.uid}`))
      toast(`Booking cancelled — slot given to next in queue`)
    } else {
      await remove(ref(db, `bookings/${day}/${slotId}`))
      toast('Booking cancelled')
    }
  }, [day, toast])

  // ── Leave queue ──────────────────────────────────────────────
  const handleLeaveQueue = useCallback(async (slotId: string) => {
    await remove(ref(db, `queues/${day}/${slotId}/${user.uid}`))
    toast('Left queue')
  }, [user.uid, day, toast])

  // ── Open modal ───────────────────────────────────────────────
  function openBookModal(slotId: string) {
    setModalMode('book')
    setModalSlot(slotId)
  }
  function openQueueModal(slotId: string) {
    setModalMode('queue')
    setModalSlot(slotId)
  }

  const mySlotId     = getUserBookingToday(bookings, user.uid)
  const myQueueSlotId = getUserQueuedToday(queues, user.uid)
  const today        = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  const initials     = (user.displayName || user.email || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem 4rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '2rem 0 2.5rem' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--accent)', letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>IISER Kolkata</div>
        <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1 }}>Music Club <span style={{ color: 'var(--accent)' }}>Booking</span></div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>// fair · instant · automatic</div>
      </div>

      {/* User bar */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{user.displayName || 'Student'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{user.email}</div>
          </div>
        </div>
        <button onClick={() => signOut(auth)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', color: 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>
          Sign out
        </button>
      </div>

      {/* My booking banner */}
      {mySlotId && bookings[mySlotId] && (
        <div style={{ background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Your booking today</div>
            <div style={{ fontSize: 13, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
              {SLOTS.find(s => s.id === mySlotId)?.label} — {bookings[mySlotId].instruments.join(', ')}
            </div>
          </div>
          <button onClick={() => handleCancel(mySlotId)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', flexShrink: 0 }}>
            Cancel
          </button>
        </div>
      )}

      {/* My queue banner */}
      {myQueueSlotId && !mySlotId && (
        <div style={{ background: 'rgba(124,92,191,0.08)', border: '1px solid rgba(124,92,191,0.35)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#7c5cbf' }}>You're in a queue</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
              {SLOTS.find(s => s.id === myQueueSlotId)?.label} — you'll be auto-booked if the slot opens up
            </div>
          </div>
          <button onClick={() => handleLeaveQueue(myQueueSlotId)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px', color: 'var(--muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', flexShrink: 0 }}>
            Leave
          </button>
        </div>
      )}

      {/* Slots */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>
        Today's Slots — {today}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '2rem' }}>
        {SLOTS.map(slot => {
          const { status, booking, opensIn, queuePosition, queueLength } = getSlotStatus(slot, bookings, queues, user.uid)
          return (
            <SlotCard
              key={slot.id}
              slot={slot}
              status={status}
              booking={booking}
              opensIn={opensIn}
              queuePosition={queuePosition}
              queueLength={queueLength}
              hasBookedToday={!!mySlotId}
              hasQueuedToday={!!myQueueSlotId}
              onBook={() => openBookModal(slot.id)}
              onQueue={() => openQueueModal(slot.id)}
              onCancel={() => handleCancel(slot.id)}
              onLeaveQueue={() => handleLeaveQueue(slot.id)}
            />
          )
        })}
      </div>

      {/* Modal */}
      {modalSlot && (
        <BookingModal
          slotId={modalSlot}
          mode={modalMode}
          onConfirm={instruments =>
            modalMode === 'book'
              ? handleBook(modalSlot, instruments)
              : handleJoinQueue(modalSlot, instruments)
          }
          onClose={() => setModalSlot(null)}
        />
      )}

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        background: '#13132a', border: '1px solid var(--accent)', color: 'var(--text)',
        padding: '10px 20px', borderRadius: 30, fontSize: 14, fontFamily: 'var(--mono)',
        zIndex: 200, opacity: visible ? 1 : 0, transition: 'opacity 0.3s',
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        {msg}
      </div>
    </div>
  )
}
