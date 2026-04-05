const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/* ─── Token helpers ─── */
export const saveToken = (t) => localStorage.setItem('ledger_token', t)
export const loadToken = ()  => localStorage.getItem('ledger_token')
export const clearToken = () => localStorage.removeItem('ledger_token')

/* ─── Fetch wrapper ─── */
const req = async (path, options = {}) => {
  const token = loadToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

/* ─── Auth endpoints ─── */
// POST /api/auth/register
export const authRegister = (email, password, name) =>
  req('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) })

// POST /api/auth/login
export const authLogin = (email, password) =>
  req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

// POST /api/auth/logout  (uses token from localStorage)
export const authLogout = () =>
  req('/api/auth/logout', { method: 'POST' })

/* ─── Account endpoints ─── */
// POST /api/accounts  — create a new INR account
export const accountCreate = () =>
  req('/api/accounts', { method: 'POST' })

// GET /api/accounts  — all accounts for logged-in user
export const accountList = () =>
  req('/api/accounts')

// GET /api/accounts/balance/:accountId
export const accountBalance = (accountId) =>
  req(`/api/accounts/balance/${accountId}`)

/* ─── Transaction endpoints ─── */
// POST /api/transactions  — transfer between two accounts
export const txTransfer = (fromAccount, toAccount, amount, idempotencyKey) =>
  req('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({ fromAccount, toAccount, amount, idempotencyKey }),
  })

// POST /api/transactions/system/initial-funds  — fund an account (system user only)
export const txInitialFunds = (toAccount, amount, idempotencyKey, systemToken) =>
  req('/api/transactions/system/initial-funds', {
    method: 'POST',
    headers: systemToken ? { Authorization: `Bearer ${systemToken}` } : {},
    body: JSON.stringify({ toAccount, amount, idempotencyKey }),
  })

/* ─── Helpers ─── */
export const genKey = () =>
  `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

export const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 2,
  }).format(n || 0)

export const shortId = (id) =>
  '···· ' + String(id).slice(-8).toUpperCase()
