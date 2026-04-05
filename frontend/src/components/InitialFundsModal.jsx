import { useState } from 'react'
import { fmt, shortId } from '../api/client.js'

export default function InitialFundsModal({ accounts, onSubmit, onClose, loading }) {
  const [toAccount, setTo] = useState('')
  const [amount, setAmt]   = useState('')
  const [sysToken, setSys] = useState('')

  const activeAccounts = accounts.filter(a => a.status === 'ACTIVE')
  const canSubmit = toAccount && parseFloat(amount) > 0 && sysToken && !loading

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit) return
    onSubmit(toAccount, parseFloat(amount), sysToken)
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 50, height: 50,
            background: 'rgba(96,165,250,.1)', border: '1px solid rgba(96,165,250,.25)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: 'var(--blue)',
          }}>⬡</div>
          <div>
            <h3 className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>
              Fund Account
            </h3>
            <p style={{ fontSize: 13, color: 'var(--dim)', marginTop: 2 }}>
              System endpoint — requires system user JWT token
            </p>
          </div>
        </div>

        <div className="divider" style={{ margin: '24px 0' }} />

        {/* Info box */}
        <div style={{
          background: 'rgba(96,165,250,.06)', border: '1px solid rgba(96,165,250,.18)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, marginBottom: 6 }}>
            ℹ System User Endpoint
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.65 }}>
            This route uses <code style={{ background:'rgba(255,255,255,.06)', padding:'2px 5px', borderRadius:4 }}>authSystemUserMiddleware</code>.
            Create a system user in MongoDB, login with that account, and paste its JWT token below.
            Regular user tokens will be rejected.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>

            {/* System token */}
            <div className="field-wrap">
              <label className="field-label">System User JWT Token</label>
              <textarea
                className="field-input"
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                value={sysToken}
                onChange={e => setSys(e.target.value)}
                rows={3}
                required
                style={{ resize: 'vertical', fontSize: 12, fontFamily: 'DM Mono, monospace' }}
              />
              <p className="field-hint">
                Token from a user where <code style={{ color:'var(--muted)'}}>systemUser: true</code> in MongoDB
              </p>
            </div>

            {/* To account */}
            <div className="field-wrap">
              <label className="field-label">Credit Account</label>
              <select
                className="field-input"
                value={toAccount}
                onChange={e => setTo(e.target.value)}
                required
              >
                <option value="">Select account to fund</option>
                {activeAccounts.map(a => (
                  <option key={a._id} value={a._id}>
                    {shortId(a._id)} — {a.currency}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="field-wrap">
              <label className="field-label">Amount to Credit (INR)</label>
              <div style={{ position: 'relative' }}>
                <span className="mono" style={{
                  position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--muted)', fontSize: 16, pointerEvents: 'none',
                }}>₹</span>
                <input
                  className="field-input mono"
                  type="number"
                  placeholder="10000.00"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmt(e.target.value)}
                  required
                  style={{ paddingLeft: 36 }}
                />
              </div>
              {amount && (
                <p className="field-hint">
                  Will credit <span className="mono" style={{ color:'var(--muted)' }}>{fmt(parseFloat(amount)||0)}</span> to selected account
                </p>
              )}
            </div>

          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 2, background:'linear-gradient(135deg,#60a5fa,#3b82f6)', color:'#fff', fontWeight:600, border:'none', borderRadius:11, padding:'13px 26px', fontSize:14.5, transition:'all .22s', cursor: canSubmit?'pointer':'not-allowed', opacity: canSubmit?1:.5 }}
              disabled={!canSubmit}
            >
              {loading ? <span className="spinner">Processing...</span> : 'Credit Funds →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
