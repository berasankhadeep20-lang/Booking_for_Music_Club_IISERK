import { type Slot, type SlotStatus, type Booking, type QueueEntry } from './types'

export const SLOTS: Slot[] = [
  { id: 's1', label: '6:00 AM – 7:00 AM',   startH: 6,  endH: 7  },
  { id: 's2', label: '8:00 AM – 9:00 AM',   startH: 8,  endH: 9  },
  { id: 's3', label: '10:00 AM – 11:00 AM', startH: 10, endH: 11 },
  { id: 's4', label: '12:00 PM – 1:00 PM',  startH: 12, endH: 13 },
  { id: 's5', label: '3:00 PM – 4:00 PM',   startH: 15, endH: 16 },
  { id: 's6', label: '5:00 PM – 6:00 PM',   startH: 17, endH: 18 },
  { id: 's7', label: '7:00 PM – 8:00 PM',   startH: 19, endH: 20 },
  { id: 's8', label: '9:00 PM – 10:00 PM',  startH: 21, endH: 22 },
  { id: 's9', label: '11:00 PM – 12:00 AM', startH: 23, endH: 24 },
]

export const INSTRUMENTS = ['Guitar', 'Bass', 'Drums', 'Keyboard', 'Violin', 'Flute', 'Tabla', 'Sitar', 'Saxophone', 'All']

export function todayKey(): string {
  return new Date().toDateString()
}

// Returns the booking key date for a slot.
// The 6AM slot is special: it belongs to "tomorrow" when booked after midnight.
export function slotDayKey(slot: Slot): string {
  const now = new Date()
  // const hour = now.getHours()
  // After midnight (0:00–5:59), the 6AM slot is for today (same calendar day)
  // so the key is just today — no adjustment needed.
  // For all other times, key is also today. No change needed here;
  // the open-time logic handles the midnight unlock.
  void slot // slot param reserved for future per-slot overrides
  return now.toDateString()
}

export function getSlotTimes(slot: Slot): { open: Date; start: Date; end: Date } {
  const now = new Date()

  if (slot.startH === 6) {
    // 6AM slot: opens at midnight of the same calendar day
    const open = new Date()
    open.setHours(0, 0, 0, 0)

    const start = new Date()
    start.setHours(6, 0, 0, 0)

    const end = new Date()
    end.setHours(7, 0, 0, 0)

    // Edge case: if it's currently between midnight and 6AM,
    // the slot hasn't started yet but booking is open — correct.
    return { open, start, end }
  }

  // Normal slots: open 1hr before
  const open  = new Date(); open.setHours(slot.startH - 1, 0, 0, 0)
  const start = new Date(); start.setHours(slot.startH, 0, 0, 0)
  const end   = new Date(); end.setHours(slot.endH === 24 ? 23 : slot.endH, slot.endH === 24 ? 59 : 0, 0, 0)

  void now
  return { open, start, end }
}

// App is open 6AM–12AM. Outside those hours show a closed screen.
export function isAppOpen(): boolean {
  const h = new Date().getHours()
  // Allow midnight–6AM only for 6AM slot pre-booking
  // App UI is accessible 0:00–1:00 (midnight buffer) and 6:00–23:59
  return h >= 6 || h < 1 // open 6AM–midnight, plus 12AM–1AM for pre-booking
}

export function getSlotStatus(
  slot: Slot,
  bookings: Record<string, Booking>,
  queues: Record<string, Record<string, QueueEntry>>,
  currentUid?: string
): { status: SlotStatus; booking?: Booking; opensIn?: number; queuePosition?: number; queueLength?: number } {
  const now = new Date()
  const { open, end } = getSlotTimes(slot)
  const booking = bookings[slot.id]
  const slotQueue = queues[slot.id] ?? {}
  const queueEntries = Object.values(slotQueue).sort((a, b) => a.timestamp - b.timestamp)
  const queueLength = queueEntries.length

  if (now >= end)   return { status: 'past', booking }
  if (now < open)   return { status: 'upcoming', booking, opensIn: open.getTime() - now.getTime() }

  if (booking) {
    if (booking.uid === currentUid) return { status: 'mine', booking, queueLength }
    const myQueuePos = queueEntries.findIndex(e => e.uid === currentUid)
    if (myQueuePos !== -1) return { status: 'queued', booking, queuePosition: myQueuePos + 1, queueLength }
    return { status: 'full', booking, queueLength }
  }
  return { status: 'open' }
}

export function getUserBookingToday(bookings: Record<string, Booking>, uid: string): string | null {
  const day = todayKey()
  for (const sid in bookings) {
    if (bookings[sid].uid === uid && bookings[sid].day === day) return sid
  }
  return null
}

export function getUserQueuedToday(queues: Record<string, Record<string, QueueEntry>>, uid: string): string | null {
  for (const slotId in queues) {
    const slotQueue = queues[slotId] ?? {}
    if (Object.values(slotQueue).some(e => e.uid === uid)) return slotId
  }
  return null
}

export function canCancel(slot: Slot): boolean {
  const now = new Date()
  const { start: _start } = getSlotTimes(slot)
  return _start.getTime() - now.getTime() > 15 * 60 * 1000
}
