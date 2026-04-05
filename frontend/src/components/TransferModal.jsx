import { useState } from 'react'
import { fmt, shortId } from '../api/client.js'

export default function TransferModal({ accounts, balances, defaultFrom = '', onSubmit, onClose, loading }) {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo]   = useState('')
  const [amount, setAmt] = useState('')

  const activeAccounts = accounts.filter(a => a.status === 'ACTIVE')
  const toOptions = activeAccounts.filter(a => a._id !== from)
  const fromBal = balances[from]
  const parsedAmt = parseFloat(amount) || 0
  const insufficient = parsedAmt > 0 && fromBal !== undefined && parsedAmt > fromBal
  const canSubmit = from && to && parsedAmt > 0 && !insufficient && !loading

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(from, to, parsedAmt)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 50, height: 50,
            background: 'var(--gold-glow)', border: '1px solid var(--border-gold)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: 'var(--gold)',
          }}>↗</div>
          <div>
            <h3 className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>
              Transfer Funds
            </h3>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginTop: 2 }}>
              Atomic transfer — takes ~15 seconds to process
            </p>
          </div>
        </div>

        <div className="divider" style={{ margin: '26px 0' }} />

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 30 }}>

            {/* From */}
            <div className="field-wrap">
              <label className="field-label">From Account</label>
              <select
                className="field-input"
                value={from}
                onChange={e => { setFrom(e.target.value); setTo('') }}
                required
              >
                <option value="">Select source account</option>
                {activeAccounts.map(a => (
                  <option key={a._id} value={a._id}>
                    {shortId(a._id)} — {fmt(balances[a._id] || 0)}
                  </option>
                ))}
              </select>
              {from && fromBal !== undefined && (
                <p className="field-hint">
                  Available: <span className="mono" style={{ color: 'var(--muted)' }}>{fmt(fromBal)}</span>
                </p>
              )}
            </div>

            {/* Arrow */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex', width: 38, height: 38, borderRadius: '50%',
                background: 'var(--gold-glow)', border: '1px solid var(--border-gold)',
                alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: 18,
              }}>↓</div>
            </div>

            {/* To */}
            <div className="field-wrap">
              <label className="field-label">To Account</label>
              <select
                className="field-input"
                value={to}
                onChange={e => setTo(e.target.value)}
                required
                disabled={!from}
              >
                <option value="">Select destination account</option>
                {toOptions.map(a => (
                  <option key={a._id} value={a._id}>
                    {shortId(a._id)} — {fmt(balances[a._id] || 0)}
                  </option>
                ))}
              </select>
              {from && toOptions.length === 0 && (
                <p className="field-error">No other active accounts available</p>
              )}
            </div>

            {/* Amount */}
            <div className="field-wrap">
              <label className="field-label">Amount (INR)</label>
              <div style={{ position: 'relative' }}>
                <span className="mono" style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--muted)', fontSize: 16, pointerEvents: 'none',
                }}>₹</span>
                <input
                  className="field-input mono"
                  type="number"
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmt(e.target.value)}
                  required
                  style={{ paddingLeft: 36 }}
                />
              </div>
              {from && amount && fromBal !== undefined && (
                <p className={insufficient ? 'field-error' : 'field-hint'}>
                  {insufficient
                    ? `Insufficient balance — max ${fmt(fromBal)}`
                    : `Remaining after transfer: `}
                  {!insufficient && (
                    <span className="mono" style={{ color: 'var(--muted)' }}>
                      {fmt(fromBal - parsedAmt)}
                    </span>
                  )}
                </p>
              )}
            </div>

          </div>

          {/* Idempotency note */}
          <div style={{
            background: 'rgba(232,184,109,.05)', border: '1px solid rgba(232,184,109,.12)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 24,
          }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              🔑 A unique <strong style={{ color: 'var(--gold)' }}>idempotency key</strong> is
              auto-generated per request. Safe to retry without duplicate charges.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" style={{ flex: 2 }} disabled={!canSubmit}>
              {loading ? <span className="spinner">Processing...</span> : 'Confirm Transfer →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
