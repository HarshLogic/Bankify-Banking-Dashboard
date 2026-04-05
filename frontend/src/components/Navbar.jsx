export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  const tabs = [
    { id: 'accounts',     label: 'Accounts' },
    { id: 'transfer',     label: 'Transfer' },
    { id: 'initial-funds',label: 'Fund Account' },
    { id: 'overview',     label: 'Overview' },
  ]

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 66, padding: '0 36px',
      borderBottom: '1px solid var(--border)',
      background: 'rgba(7,9,26,.92)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo + Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, #e8b86d, #a06820)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 4px 16px rgba(232,184,109,.25)',
          }}>⟁</div>
          <span className="serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>Bankify</span>
        </div>

        <nav style={{ display: 'flex', gap: 2 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >{t.label}</button>
          ))}
        </nav>
      </div>

      {/* User + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 14px',
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(232,184,109,.3),rgba(232,184,109,.1))',
            border: '1px solid var(--border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600, color: 'var(--gold)',
          }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'var(--dim)' }}>{user?.email}</div>
          </div>
        </div>
        <button className="btn-ghost" onClick={onLogout}>Sign out</button>
      </div>
    </header>
  )
}
