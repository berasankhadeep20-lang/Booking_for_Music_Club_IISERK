import { useState } from 'react'
import { INSTRUMENTS, SLOTS } from '../slots'

interface Props {
  slotId: string
  mode: 'book' | 'queue'
  onConfirm: (instruments: string[]) => void
  onClose: () => void
}

export default function BookingModal({ slotId, mode, onConfirm, onClose }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  const [showWarning, setShowWarning] = useState(false)
  const [warningAcknowledged, setWarningAcknowledged] = useState(false)
  const slot = SLOTS.find(s => s.id === slotId)!
  const isQueue = mode === 'queue'

  function toggle(name: string) {
    if (name === 'All') {
      setSelected(['All'])
      setShowWarning(true)
      setWarningAcknowledged(false)
      return
    }
    setShowWarning(false)
    setWarningAcknowledged(false)
    setSelected(prev => {
      const without = prev.filter(i => i !== 'All')
      return without.includes(name) ? without.filter(i => i !== name) : [...without, name]
    })
  }

  function handleConfirm() {
    if (selected.length === 0) return
    if (selected.includes('All') && !warningAcknowledged) { setShowWarning(true); return }
    onConfirm(selected)
  }

  const canConfirm = selected.length > 0 && (!selected.includes('All') || warningAcknowledged)

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#13132a', border: `1px solid ${isQueue ? 'rgba(124,92,191,0.4)' : 'rgba(233,69,96,0.3)'}`, borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 440 }}>

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          {isQueue ? 'Join Queue' : 'Book Slot'}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: isQueue ? '#7c5cbf' : 'var(--accent)', marginBottom: isQueue ? 8 : '1.5rem' }}>
          {slot.label}
        </div>

        {/* Queue note */}
        {isQueue && (
          <div style={{ background: 'rgba(124,92,191,0.08)', border: '1px solid rgba(124,92,191,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: '1.25rem', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            This slot is currently booked. Select your instruments now — if the slot opens up, you'll be automatically booked in queue order.
          </div>
        )}

        <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>
          Instruments you'll use
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: '1.25rem' }}>
          {INSTRUMENTS.map(instr => {
            const isSelected = selected.includes(instr)
            return (
              <button
                key={instr}
                onClick={() => toggle(instr)}
                style={{
                  background: isSelected ? (isQueue ? 'rgba(124,92,191,0.15)' : 'rgba(233,69,96,0.15)') : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isSelected ? (isQueue ? '#7c5cbf' : 'var(--accent)') : 'var(--border)'}`,
                  borderRadius: 8, padding: '10px', textAlign: 'center',
                  cursor: 'pointer', fontSize: 13,
                  color: isSelected ? (isQueue ? '#7c5cbf' : 'var(--accent)') : 'var(--text)',
                  fontFamily: 'var(--font)', transition: 'all 0.15s',
                }}
              >
                {instr}
              </button>
            )
          })}
        </div>

        {/* Damage warning — only when All selected */}
        {showWarning && (
          <div style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.4)', borderRadius: 10, padding: '14px 16px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1.2 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 4 }}>
                  All Instruments — Responsibility Notice
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
                  By booking all instruments, you accept full responsibility for their condition during your slot.
                  Any damage, misplacement, or mishandling of club equipment will be your liability.
                  Please treat all instruments with care.
                </div>
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={warningAcknowledged}
                onChange={e => setWarningAcknowledged(e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--gold)' }}
              />
              <span style={{ fontSize: 13, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                I understand and accept responsibility
              </span>
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 1, padding: '10px',
              background: isQueue ? '#7c5cbf' : 'var(--accent)',
              border: 'none', borderRadius: 10, color: '#fff',
              fontSize: 14, fontWeight: 700,
              cursor: canConfirm ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font)',
              opacity: canConfirm ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}
          >
            {isQueue ? 'Join Queue' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
