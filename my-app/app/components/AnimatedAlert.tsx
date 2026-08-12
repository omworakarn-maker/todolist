'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

type AlertIcon = 'success' | 'error' | 'warning' | 'question' | 'info'

interface AlertOptions {
  title: string
  text?: string
  icon?: AlertIcon
  showCancelButton?: boolean
  showConfirmButton?: boolean
  confirmButtonText?: string
  cancelButtonText?: string
  timer?: number
  confirmButtonColor?: string
  cancelButtonColor?: string
  customClass?: unknown
}

interface AlertResult { isConfirmed: boolean }
type ShowAlert = (options: AlertOptions) => Promise<AlertResult>

const AlertContext = createContext<ShowAlert | null>(null)

const styles = {
  success: { color: '#10b981', soft: '#ecfdf5', label: 'สำเร็จ', path: 'M5 12l4 4L19 6' },
  error: { color: '#ef4444', soft: '#fef2f2', label: 'เกิดข้อผิดพลาด', path: 'M7 7l10 10M17 7 7 17' },
  warning: { color: '#f59e0b', soft: '#fffbeb', label: 'โปรดตรวจสอบ', path: 'M12 8v5m0 3h.01' },
  question: { color: '#6366f1', soft: '#eef2ff', label: 'ยืนยันรายการ', path: 'M9.1 9a3 3 0 115.4 1.8c-.9 1.2-2.5 1.3-2.5 3.2m0 3h.01' },
  info: { color: '#0ea5e9', soft: '#f0f9ff', label: 'แจ้งให้ทราบ', path: 'M12 11v5m0-8h.01' }
}

export function AnimatedAlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<AlertOptions | null>(null)
  const [closing, setClosing] = useState(false)
  const resolver = useRef<((result: AlertResult) => void) | null>(null)

  const showAlert = useCallback<ShowAlert>((options) => {
    resolver.current?.({ isConfirmed: false })
    setClosing(false)
    setAlert(options)
    return new Promise(resolve => { resolver.current = resolve })
  }, [])

  const close = useCallback((isConfirmed: boolean) => {
    setClosing(true)
    window.setTimeout(() => {
      setAlert(null)
      setClosing(false)
      resolver.current?.({ isConfirmed })
      resolver.current = null
    }, 260)
  }, [])

  useEffect(() => {
    if (!alert?.timer) return
    const timeout = window.setTimeout(() => close(true), alert.timer)
    return () => window.clearTimeout(timeout)
  }, [alert, close])

  const icon = alert?.icon || 'info'
  const theme = styles[icon]

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      {alert && (
        <div className={`animated-alert-backdrop ${closing ? 'is-closing' : ''}`} role="presentation">
          <section className={`animated-alert-card animated-alert-${icon}`} role="alertdialog" aria-modal="true" aria-labelledby="alert-title">
            <div className="animated-alert-glow" style={{ background: theme.color }} />
            <div className="animated-alert-icon" style={{ color: theme.color, background: theme.soft }}>
              <span className="animated-alert-ring" style={{ borderColor: theme.color }} />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path strokeLinecap="round" strokeLinejoin="round" d={theme.path} />
              </svg>
            </div>
            <p className="animated-alert-label" style={{ color: theme.color }}>{theme.label}</p>
            <h2 id="alert-title">{alert.title}</h2>
            {alert.text && <p className="animated-alert-message">{alert.text}</p>}
            <div className="animated-alert-actions">
              {alert.showCancelButton && (
                <button type="button" className="animated-alert-cancel" onClick={() => close(false)}>
                  {alert.cancelButtonText || 'ยกเลิก'}
                </button>
              )}
              {alert.showConfirmButton !== false && (
                <button
                  type="button"
                  className="animated-alert-confirm"
                  style={{ background: alert.confirmButtonColor || theme.color }}
                  onClick={() => close(true)}
                >
                  {alert.confirmButtonText || 'ตกลง'}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </AlertContext.Provider>
  )
}

export function useAnimatedAlert() {
  const showAlert = useContext(AlertContext)
  if (!showAlert) throw new Error('useAnimatedAlert must be used inside AnimatedAlertProvider')
  return { showAlert }
}
