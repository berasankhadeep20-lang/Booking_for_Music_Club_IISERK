import { useState } from 'react'
import { INSTRUMENTS, SLOTS } from '../slots'

interface Props {
  slotId: string
  onConfirm: (instruments: string[]) => void
  onClose: () => void
}

export default function BookingModal({ slotId, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const slot = SLOTS.find(s => s.id === slotId)!

  function toggle(name: string) {
    if (name === 'All') { setSelected(['All']); return }
    setSelected(prev => {
      const without = prev.filter(i => i !== 'All')
      return without.includes(name) ? without.filter(i => i !== name) : [...without, name]
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#13132a', border: '1px solid rgba(233,69,96,0.3)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 440 }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Book Slot</div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--accent)', marginBottom: '1.5rem' }}>{slot.label}</div>
        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          Instruments you'll use
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1.5rem' }}>
          {INSTRUMENTS.map(instr => {
            const isSelected = selected.includes(instr)
            return (
              <button
                key={instr}
                onClick={() => toggle(instr)}
                style={{
                  background: isSelected ? 'rgba(233,69,96,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '10px', textAlign: 'center',
                  cursor: 'pointer', fontSize: 13,
                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                  fontFamily: 'var(--font)', transition: 'all 0.15s',
                }}
              >
                {instr}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => selected.length > 0 && onConfirm(selected)}
            style={{ flex: 1, padding: '10px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', opacity: selected.length === 0 ? 0.4 : 1 }}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  )
}
