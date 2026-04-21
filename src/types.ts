export interface Booking {
  uid: string
  name: string
  email: string
  instruments: string[]
  timestamp: number
  day: string
  slotId: string
}

export interface QueueEntry {
  uid: string
  name: string
  email: string
  instruments: string[]
  timestamp: number
  day: string
  slotId: string
}

export interface Slot {
  id: string
  label: string
  startH: number
  endH: number
}

export type SlotStatus = 'past' | 'upcoming' | 'open' | 'full' | 'mine' | 'queued'
