export default function CreateAccountModal({ onConfirm, onClose, loading }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div style={{
          width: 72, height: 72,
          background: 'var(--gold-glow)', border: '1px solid var(--border-gold)',
          borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, margin: '0 auto 24px', color: 'var(--gold)',
        }}>+</div>

        <h3 className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>
          Create New Account
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.75, marginBottom: 10 }}>
          A new INR account will be created and linked to your profile.
        </p>
        <p style={{ color: 'var(--dim)', fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>
          Account defaults to <span className="text-green" style={{ fontWeight: 600 }}>ACTIVE</span> status.
          Use the <strong style={{ color: 'var(--muted)' }}>Fund Account</strong> tab to add initial funds via the system user.
        </p>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button className="btn-gold" style={{ flex: 2 }} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner">Creating...</span> : 'Create Account →'}
          </button>
        </div>
      </div>
    </div>
  )
}
