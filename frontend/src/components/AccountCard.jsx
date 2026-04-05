import { fmt, shortId } from '../api/client.js'

export default function AccountCard({ account, balance, loading, onSend, delay = '' }) {
  const statusClass = {
    ACTIVE: 'badge-active',
    FROZEN: 'badge-frozen',
    CLOSED: 'badge-closed',
  }[account.status] || 'badge-active'

  return (
    <div
      className={`card card-hover anim-up ${delay}`}
      style={{ padding: 30, position: 'relative', overflow: 'hidden' }}
    >
      {/* Glow corner */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: 130, height: 130,
        background: 'radial-gradient(circle, rgba(232,184,109,.07) 0%, transparent 70%)',
        borderRadius: '0 18px 0 100%',
      }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 }}>
        <div>
          <p className="field-label" style={{ marginBottom: 6 }}>Account ID</p>
          <p className="mono" style={{ fontSize: 13.5, color: 'var(--muted)', letterSpacing: '.4px' }}>
            {shortId(account._id)}
          </p>
        </div>
        <span className={`badge ${statusClass}`}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'currentColor', display: 'inline-block',
          }} />
          {account.status}
        </span>
      </div>

      {/* Balance */}
      <div style={{ marginBottom: 22 }}>
        <p className="field-label" style={{ marginBottom: 10 }}>Available Balance</p>
        {loading ? (
          <p className="spinner mono" style={{ fontSize: 28, color: 'var(--dim)' }}>Fetching...</p>
        ) : (
          <p className="mono" style={{
            fontSize: 36, fontWeight: 500, color: 'var(--text)', letterSpacing: '-1.2px',
          }}>
            {fmt(balance)}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        paddingTop: 18, borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>{account.currency}</span>
          <span style={{ fontSize: 12, color: 'var(--dim)', margin: '0 8px' }}>·</span>
          <span style={{ fontSize: 12, color: 'var(--dim)' }}>
            {new Date(account.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>

        {account.status === 'ACTIVE' && (
          <button className="link-btn" onClick={() => onSend(account._id)}>
            Send ↗
          </button>
        )}
      </div>
    </div>
  )
}
