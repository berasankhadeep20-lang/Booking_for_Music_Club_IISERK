import { type Slot, type SlotStatus, type Booking } from './types'

export const SLOTS: Slot[] = [
  { id: 's1', label: '8:00 AM – 9:00 AM',   startH: 8,  endH: 9  },
  { id: 's2', label: '10:00 AM – 11:00 AM', startH: 10, endH: 11 },
  { id: 's3', label: '12:00 PM – 1:00 PM',  startH: 12, endH: 13 },
  { id: 's4', label: '3:00 PM – 4:00 PM',   startH: 15, endH: 16 },
  { id: 's5', label: '5:00 PM – 6:00 PM',   startH: 17, endH: 18 },
  { id: 's6', label: '7:00 PM – 8:00 PM',   startH: 19, endH: 20 },
]

export const INSTRUMENTS = ['Guitar', 'Bass', 'Drums', 'Keyboard', 'Violin', 'Flute', 'Tabla', 'Sitar', 'Saxophone', 'All']

export function todayKey(): string {
  return new Date().toDateString()
}

export function getSlotTimes(slot: Slot): { open: Date; start: Date; end: Date } {
  const open  = new Date(); open.setHours(slot.startH - 1, 0, 0, 0)
  const start = new Date(); start.setHours(slot.startH, 0, 0, 0)
  const end   = new Date(); end.setHours(slot.endH, 0, 0, 0)
  return { open, start, end }
}

export function getSlotStatus(
  slot: Slot,
  bookings: Record<string, Booking>,
  currentUid?: string
): { status: SlotStatus; booking?: Booking; opensIn?: number } {
  const now = new Date()
  const { open, end } = getSlotTimes(slot)
  const booking = bookings[slot.id]

  if (now >= end)   return { status: 'past', booking }
  if (now < open)   return { status: 'upcoming', booking, opensIn: open.getTime() - now.getTime() }
  if (booking) {
    if (booking.uid === currentUid) return { status: 'mine', booking }
    return { status: 'full', booking }
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

export function canCancel(slot: Slot): boolean {
  const now = new Date()
  const { start } = getSlotTimes(slot)
  return start.getTime() - now.getTime() > 15 * 60 * 1000
}
