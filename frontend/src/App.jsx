import { useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Toast from './components/Toast.jsx'
import { authRegister, authLogin, authLogout, saveToken, loadToken, clearToken } from './api/client.js'

export default function App() {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => loadToken())
  const [toasts, setToasts] = useState([])

  /* ─── Restore session from localStorage on reload ─── */
  useEffect(() => {
    const saved = loadToken()
    if (saved && !user) {
      const savedUser = localStorage.getItem('ledger_user')
      if (savedUser) {
        try { setUser(JSON.parse(savedUser)) } catch { clearToken() }
      }
    }
  }, [])

  /* ─── Toast helpers ─── */
  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  /* ─── Auth handlers ─── */
  const handleAuth = async (mode, { email, password, name }) => {
    const data = mode === 'login'
      ? await authLogin(email, password)
      : await authRegister(email, password, name)

    saveToken(data.token)
    localStorage.setItem('ledger_user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    showToast(
      mode === 'login'
        ? `Welcome back, ${data.user.name}!`
        : `Account created! Welcome, ${data.user.name}!`
    )
  }

  const handleLogout = async () => {
    try { await authLogout() } catch { /* token may be expired, ignore */ }
    clearToken()
    localStorage.removeItem('ledger_user')
    setToken(null)
    setUser(null)
    showToast('Signed out successfully')
  }

  const isLoggedIn = !!(token && user)

  return (
    <>
      {/* Toast stack */}
      <div style={{ position:'fixed', top:24, right:24, zIndex:999, display:'flex', flexDirection:'column', gap:10 }}>
        {toasts.map(t => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>

      {isLoggedIn ? (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          showToast={showToast}
        />
      ) : (
        <AuthPage onAuth={handleAuth} />
      )}
    </>
  )
}
