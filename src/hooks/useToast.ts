import { useState, useCallback } from 'react'

export function useToast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((message: string) => {
    if (timer) clearTimeout(timer)
    setMsg(message)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 3000)
    setTimer(t)
  }, [timer])

  return { toast, msg, visible }
}
