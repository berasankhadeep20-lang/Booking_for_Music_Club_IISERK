import { useState, useEffect, useCallback } from 'react'
import { type User, signOut } from 'firebase/auth'
import { ref, onValue, set, remove } from 'firebase/database'
import { auth, db } from '../firebase'
import { SLOTS, getSlotStatus, getUserBookingToday, todayKey, canCancel } from '../slots'
import { type Booking } from '../types'
import SlotCard from './SlotCard'
import BookingModal from './BookingModal'
import { useToast } from '../hooks/useToast'

interface Props { user: User }

export default function Dashboard({ user }: Props) {
  const [bookings, setBookings] = useState<Record<string, Booking>>({})
  const [modalSlot, setModalSlot] = useState<string | null>(null)
  const [, setTick] = useState(0)
  const { toast, msg, visible } = useToast()

  // live-sync bookings from Firebase
  useEffect(() => {
    const day = todayKey()
    const bookingsRef = ref(db, `bookings/${day}`)
    const unsub = onValue(bookingsRef, snap => {
      setBookings(snap.val() ?? {})
    })
    return unsub
  }, [])

  // re-render every 10s to update countdowns & open/close windows
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(iv)
  }, [])

  const handleBook = useCallback(async (slotId: string, instruments: string[]) => {
    const day = todayKey()
    // double-check: re-read from firebase before writing
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
  }, [user, toast])

  const handleCancel = useCallback(async (slotId: string) => {
    const slot = SLOTS.find(s => s.id === slotId)!
    if (!canCancel(slot)) { toast('Cannot cancel within 15 minutes of slot start'); return }
    const day = todayKey()
    await remove(ref(db, `bookings/${day}/${slotId}`))
    toast('Booking cancelled')
  }, [toast])

  const mySlotId = getUserBookingToday(bookings, user.uid)
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  const initials = (user.displayName || user.email || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

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
        <div style={{ background: 'rgba(233,69,96,0.08)', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
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

      {/* Slots */}
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: '1rem' }}>
        Today's Slots — {today}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: '2rem' }}>
        {SLOTS.map(slot => {
          const { status, booking, opensIn } = getSlotStatus(slot, bookings, user.uid)
          return (
            <SlotCard
              key={slot.id}
              slot={slot}
              status={status}
              booking={booking}
              opensIn={opensIn}
              hasBookedToday={!!mySlotId}
              onBook={() => setModalSlot(slot.id)}
              onCancel={() => handleCancel(slot.id)}
            />
          )
        })}
      </div>

      {/* Modal */}
      {modalSlot && (
        <BookingModal
          slotId={modalSlot}
          onConfirm={instruments => handleBook(modalSlot, instruments)}
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
