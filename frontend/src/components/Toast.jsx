import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: { bg: 'rgba(52,211,153,.13)', border: 'rgba(52,211,153,.28)', color: '#6ee7b7', icon: '✓' },
    error:   { bg: 'rgba(248,113,113,.13)', border: 'rgba(248,113,113,.28)', color: '#fca5a5', icon: '✕' },
    warning: { bg: 'rgba(251,191,36,.13)', border: 'rgba(251,191,36,.28)', color: '#fde68a', icon: '⚠' },
    info:    { bg: 'rgba(96,165,250,.13)', border: 'rgba(96,165,250,.28)', color: '#bfdbfe', icon: 'ℹ' },
  }
  const c = colors[type] || colors.success

  return (
    <div
      style={{
        position: 'fixed', top: 24, right: 24, zIndex: 999,
        background: c.bg, border: `1px solid ${c.border}`, color: c.color,
        padding: '14px 20px', borderRadius: 13, fontSize: 14, fontWeight: 500,
        maxWidth: 390, display: 'flex', alignItems: 'flex-start', gap: 10,
        animation: visible ? 'slideRight .3s ease' : 'fadeIn .3s ease reverse',
        boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      }}
    >
      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
      <span style={{ lineHeight: 1.5 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', color: 'inherit', opacity: .6,
          cursor: 'pointer', marginLeft: 'auto', flexShrink: 0, fontSize: 14,
        }}
      >✕</button>
    </div>
  )
}
