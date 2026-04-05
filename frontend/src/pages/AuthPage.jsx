import { useState } from 'react'

export default function AuthPage({ onAuth }) {
  const [mode, setMode]     = useState('login')
  const [email, setEmail]   = useState('')
  const [pass, setPass]     = useState('')
  const [name, setName]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onAuth(mode, { email, password: pass, name })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: '⬡', title: 'Double-Entry',  sub: 'Every debit has a credit' },
    { icon: '⚡', title: 'Atomic Txns',   sub: 'ACID-compliant transfers' },
    { icon: '⚲', title: 'Idempotent',    sub: 'Safe to retry any request' },
    { icon: '◎', title: 'Bankify-Based',  sub: 'Balance derived from entries' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* ─── Left: Branding ─── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '64px 80px',
        background: 'radial-gradient(ellipse 70% 70% at 15% 55%, rgba(232,184,109,.09) 0%, transparent 70%)',
        borderRight: '1px solid var(--border)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative rings */}
        {[480, 320, 180].map((s, i) => (
          <div key={s} style={{
            position: 'absolute', right: -s/3, top: '50%', transform: 'translateY(-50%)',
            width: s, height: s, borderRadius: '50%',
            border: `1px solid rgba(232,184,109,${.05 + i * .01})`,
          }} />
        ))}

        <div style={{ maxWidth: 520, position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div className="anim-up" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 64 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 13,
              background: 'linear-gradient(135deg, #e8b86d, #a06820)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, boxShadow: '0 4px 20px rgba(232,184,109,.3)',
            }}>⟁</div>
            <span className="serif" style={{ fontSize: 26, fontWeight: 700, color: 'var(--gold)' }}>Bankify</span>
          </div>

          <h1 className="serif anim-up d1" style={{
            fontSize: 56, fontWeight: 700, color: 'var(--text)', lineHeight: 1.07, marginBottom: 24,
          }}>
            Money moves.<br />
            <span style={{ color: 'var(--gold)' }}>Records</span><br />
            don't lie.
          </h1>

          <p className="anim-up d2" style={{
            color: 'var(--muted)', fontSize: 16.5, lineHeight: 1.8, maxWidth: 400, marginBottom: 52,
          }}>
            A production-grade double-entry Bankify with real-time balance derivation, atomic transactions, and immutable audit trails.
          </p>

          <div className="anim-up d3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {features.map(({ icon, title, sub }) => (
              <div key={title} style={{
                background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'var(--gold-glow)', border: '1px solid rgba(232,184,109,.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 17, color: 'var(--gold)', flexShrink: 0,
                }}>{icon}</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{title}</p>
                  <p style={{ fontSize: 11.5, color: 'var(--dim)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right: Form ─── */}
      <div style={{
        width: 500, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 52px', background: 'rgba(0,0,0,.18)',
      }}>
        <div className="anim-up">
          <h2 className="serif" style={{ fontSize: 34, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Get started'}
          </h2>
          <p style={{ color: 'var(--dim)', fontSize: 14, marginBottom: 38 }}>
            {mode === 'login'
              ? 'Sign in to access your portfolio'
              : 'Create your account in seconds'}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 26 }}>
              {mode === 'register' && (
                <div className="field-wrap">
                  <label className="field-label">Full Name</label>
                  <input
                    className="field-input"
                    type="text"
                    placeholder="Arjun Sharma"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="field-wrap">
                <label className="field-label">Email Address</label>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="field-wrap">
                <label className="field-label">Password</label>
                <input
                  className="field-input"
                  type="password"
                  placeholder="••••••••"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  required
                  minLength={6}
                />
                {mode === 'register' && (
                  <p className="field-hint">Minimum 6 characters</p>
                )}
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(248,113,113,.1)', border: '1px solid rgba(248,113,113,.2)',
                borderRadius: 10, padding: '12px 16px', marginBottom: 20,
              }}>
                <p style={{ fontSize: 13.5, color: 'var(--red)' }}>⚠ {error}</p>
              </div>
            )}

            <button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={loading}>
              {loading
                ? <span className="spinner">Processing...</span>
                : mode === 'login' ? 'Sign In →' : 'Create Account →'
              }
            </button>
          </form>

          <div className="divider" style={{ margin: '28px 0' }} />

          <p style={{ textAlign: 'center', color: 'var(--dim)', fontSize: 14 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              style={{ background: 'none', border: 'none', color: 'var(--gold)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {mode === 'login' ? 'Register free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
