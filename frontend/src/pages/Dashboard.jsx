import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import AccountCard from '../components/AccountCard.jsx'
import TransferModal from '../components/TransferModal.jsx'
import CreateAccountModal from '../components/CreateAccountModal.jsx'
import InitialFundsModal from '../components/InitialFundsModal.jsx'
import {
  accountList, accountCreate, accountBalance,
  txTransfer, txInitialFunds,
  genKey, fmt, shortId,
} from '../api/client.js'

export default function Dashboard({ user, onLogout, showToast }) {
  const [activeTab, setActiveTab]   = useState('accounts')
  const [accounts, setAccounts]     = useState([])
  const [balances, setBalances]     = useState({})
  const [globalLoading, setGL]      = useState(true)
  const [actionLoading, setAL]      = useState(false)
  const [modal, setModal]           = useState(null)  // null | 'create' | 'transfer' | 'funds'
  const [defaultFrom, setDefaultFrom] = useState('')

  /* ─── Load accounts + balances ─── */
  const load = useCallback(async () => {
    setGL(true)
    try {
      const data = await accountList()
      const accs = data.accounts || []
      setAccounts(accs)
      const entries = await Promise.all(
        accs.map(async a => {
          try {
            const b = await accountBalance(a._id)
            return [a._id, b.balance]
          } catch {
            return [a._id, 0]
          }
        })
      )
      setBalances(Object.fromEntries(entries))
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setGL(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  /* ─── Handlers ─── */
  const handleCreateAccount = async () => {
    setAL(true)
    try {
      await accountCreate()
      await load()
      setModal(null)
      showToast('New account created successfully!')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setAL(false)
    }
  }

  const handleTransfer = async (from, to, amount) => {
    setAL(true)
    try {
      await txTransfer(from, to, amount, genKey())
      await load()
      setModal(null)
      showToast('Transfer completed! Balances updated.')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setAL(false)
    }
  }

  const handleInitialFunds = async (toAccount, amount, sysToken) => {
    setAL(true)
    try {
      await txInitialFunds(toAccount, amount, genKey(), sysToken)
      await load()
      setModal(null)
      showToast('Funds credited successfully!')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setAL(false)
    }
  }

  const openSend = (fromId) => {
    setDefaultFrom(fromId)
    setModal('transfer')
  }

  /* ─── Derived stats ─── */
  const totalBalance     = Object.values(balances).reduce((s, b) => s + (b || 0), 0)
  const activeAccounts   = accounts.filter(a => a.status === 'ACTIVE')
  const frozenAccounts   = accounts.filter(a => a.status === 'FROZEN')
  const closedAccounts   = accounts.filter(a => a.status === 'CLOSED')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />

      <main style={{ flex: 1, padding: '44px 36px', maxWidth: 1340, margin: '0 auto', width: '100%' }}>

        {/* ════════ ACCOUNTS TAB ════════ */}
        {activeTab === 'accounts' && (
          <>
            {/* Hero banner */}
            <div className="anim-up" style={{
              background: 'linear-gradient(135deg, rgba(232,184,109,.08) 0%, rgba(232,184,109,.02) 60%, rgba(99,102,241,.05) 100%)',
              border: '1px solid var(--border-gold)', borderRadius: 24,
              padding: '44px 52px', marginBottom: 40,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* decorative circles */}
              <div style={{ position:'absolute', right:-60, top:-60, width:280, height:280, borderRadius:'50%', background:'rgba(232,184,109,.04)', border:'1px solid rgba(232,184,109,.07)' }} />
              <div style={{ position:'absolute', right:40, top:40, width:140, height:140, borderRadius:'50%', background:'rgba(232,184,109,.03)', border:'1px solid rgba(232,184,109,.05)' }} />

              <div style={{ position:'relative', zIndex:1 }}>
                <p className="field-label" style={{ marginBottom: 14 }}>Total Portfolio Balance</p>
                {globalLoading
                  ? <div className="spinner mono" style={{ fontSize:48, color:'var(--dim)' }}>Loading...</div>
                  : <div className="mono" style={{ fontSize:58, fontWeight:500, color:'var(--text)', letterSpacing:'-2px', lineHeight:1 }}>
                      {fmt(totalBalance)}
                    </div>
                }
                <p style={{ color:'var(--dim)', fontSize:14, marginTop:14 }}>
                  {accounts.length} account{accounts.length!==1?'s':''} · {activeAccounts.length} active · INR
                </p>
              </div>

              <div style={{ display:'flex', gap:12, position:'relative', zIndex:1 }}>
                <button className="btn-ghost" onClick={load} title="Refresh balances">↻ Refresh</button>
                <button className="btn-outline" onClick={() => setModal('create')}>+ New Account</button>
                <button
                  className="btn-gold"
                  onClick={() => { setDefaultFrom(''); setModal('transfer') }}
                  disabled={activeAccounts.length < 2}
                  title={activeAccounts.length < 2 ? 'Need at least 2 active accounts to transfer' : ''}
                >↗ Send Money</button>
              </div>
            </div>

            {/* Section header */}
            <h2 className="serif anim-up d1" style={{ fontSize:24, fontWeight:600, color:'var(--text)', marginBottom:24 }}>
              Your Accounts
            </h2>

            {/* Account grid */}
            {globalLoading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:22 }}>
                {[1,2,3].map(i => (
                  <div key={i} className="card" style={{ padding:30, height:200 }}>
                    <div className="spinner" style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--dim)', fontSize:14 }}>
                      Loading...
                    </div>
                  </div>
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="card anim-up" style={{ padding:72, textAlign:'center' }}>
                <div style={{
                  width:72, height:72, background:'var(--gold-glow)', borderRadius:20,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:30, margin:'0 auto 24px', color:'var(--gold)',
                }}>◉</div>
                <p className="serif" style={{ fontSize:22, color:'var(--text)', marginBottom:12 }}>No accounts yet</p>
                <p style={{ color:'var(--muted)', fontSize:15, marginBottom:36, maxWidth:300, margin:'0 auto 36px' }}>
                  Create your first account to start managing your finances.
                </p>
                <button className="btn-gold" onClick={() => setModal('create')}>
                  Create First Account →
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:22 }}>
                {accounts.map((acc, i) => (
                  <AccountCard
                    key={acc._id}
                    account={acc}
                    balance={balances[acc._id]}
                    loading={globalLoading}
                    onSend={openSend}
                    delay={`d${Math.min(i+1,4)}`}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════ TRANSFER TAB ════════ */}
        {activeTab === 'transfer' && (
          <div className="anim-up" style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 className="serif" style={{ fontSize:28, fontWeight:600, color:'var(--text)', marginBottom:8 }}>
              Transfer Funds
            </h2>
            <p style={{ color:'var(--muted)', fontSize:15, marginBottom:36, lineHeight:1.7 }}>
              Move money between your active accounts. Each transfer is atomic — either fully succeeds or fully fails. Takes ~15 seconds to process.
            </p>

            {activeAccounts.length < 2 ? (
              <div className="card-gold" style={{ padding:40, textAlign:'center' }}>
                <p style={{ fontSize:32, marginBottom:20 }}>⚠</p>
                <p className="serif" style={{ fontSize:20, color:'var(--text)', marginBottom:12 }}>
                  Need at least 2 active accounts
                </p>
                <p style={{ color:'var(--muted)', fontSize:14, marginBottom:28 }}>
                  You have {activeAccounts.length} active account{activeAccounts.length!==1?'s':''}. Create another one first.
                </p>
                <button className="btn-gold" onClick={() => setModal('create')}>+ Create Account</button>
              </div>
            ) : (
              <div className="card-gold" style={{ padding: 36 }}>
                <TransferInline
                  accounts={accounts}
                  balances={balances}
                  onSubmit={handleTransfer}
                  loading={actionLoading}
                />
              </div>
            )}

            {/* How it works */}
            <div className="card anim-up d2" style={{ padding:28, marginTop:28 }}>
              <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:18 }}>How transfers work</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {[
                  ['1', 'Validate', 'Checks both accounts are ACTIVE and balance is sufficient'],
                  ['2', 'Idempotency', 'A unique key is generated — safe to retry without duplicates'],
                  ['3', 'Debit', 'A DEBIT Bankify entry is created for the source account'],
                  ['4', 'Credit', 'A CREDIT Bankify entry is created for the destination account'],
                  ['5', 'Commit', 'MongoDB session commits both entries atomically'],
                  ['6', 'Email', 'Notification email is dispatched to the sender'],
                ].map(([n, title, desc]) => (
                  <div key={n} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{
                      width:26, height:26, borderRadius:'50%', background:'var(--gold-glow)',
                      border:'1px solid var(--border-gold)', display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:11, fontWeight:700, color:'var(--gold)', flexShrink:0,
                    }}>{n}</div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{title}</p>
                      <p style={{ fontSize:12, color:'var(--dim)', lineHeight:1.5 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════ INITIAL FUNDS TAB ════════ */}
        {activeTab === 'initial-funds' && (
          <div className="anim-up" style={{ maxWidth:640, margin:'0 auto' }}>
            <h2 className="serif" style={{ fontSize:28, fontWeight:600, color:'var(--text)', marginBottom:8 }}>
              Fund Account
            </h2>
            <p style={{ color:'var(--muted)', fontSize:15, marginBottom:36, lineHeight:1.7 }}>
              Credit an account with initial funds using the system user endpoint. This simulates a bank deposit or external funding.
            </p>

            <div style={{
              background:'rgba(96,165,250,.06)', border:'1px solid rgba(96,165,250,.18)',
              borderRadius:14, padding:'20px 22px', marginBottom:28,
            }}>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--blue)', marginBottom:8 }}>
                ℹ  About System User Authentication
              </p>
              <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.75 }}>
                The <code style={{ background:'rgba(255,255,255,.06)', padding:'2px 6px', borderRadius:4, fontSize:12 }}>POST /api/transactions/system/initial-funds</code> endpoint
                uses a separate <strong style={{color:'var(--text)'}}>authSystemUserMiddleware</strong> that requires a JWT from a user
                with <code style={{ background:'rgba(255,255,255,.06)', padding:'2px 6px', borderRadius:4, fontSize:12 }}>systemUser: true</code> in MongoDB.
              </p>
              <p style={{ fontSize:12, color:'var(--dim)', marginTop:10, lineHeight:1.6 }}>
                To create one: in MongoDB Compass, manually insert a user doc with <code style={{color:'var(--muted)'}}>systemUser: true</code>,
                then call <code style={{color:'var(--muted)'}}>POST /api/auth/login</code> to get its token.
              </p>
            </div>

            <div className="card-gold" style={{ padding:36 }}>
              <InitialFundsInline
                accounts={accounts}
                onSubmit={handleInitialFunds}
                loading={actionLoading}
              />
            </div>
          </div>
        )}

        {/* ════════ OVERVIEW TAB ════════ */}
        {activeTab === 'overview' && (
          <>
            <h2 className="serif anim-up" style={{ fontSize:28, fontWeight:600, color:'var(--text)', marginBottom:32 }}>
              Portfolio Overview
            </h2>

            {/* Stats */}
            <div className="anim-up d1" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18, marginBottom:32 }}>
              {[
                { label:'Total Balance', value: fmt(totalBalance), gold:true },
                { label:'Total Accounts',    value: accounts.length },
                { label:'Active Accounts',   value: activeAccounts.length },
                { label:'Frozen / Closed',   value: frozenAccounts.length + closedAccounts.length },
              ].map(({ label, value, gold }) => (
                <div key={label} className="stat-card" style={gold ? { borderColor:'var(--border-gold)' } : {}}>
                  <p className="field-label" style={{ marginBottom:14 }}>{label}</p>
                  <p className="mono" style={{
                    fontSize: gold ? 28 : 38, fontWeight:500,
                    color: gold ? 'var(--gold)' : 'var(--text)', letterSpacing:'-0.5px',
                  }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Account table */}
            <div className="card anim-up d2" style={{ overflow:'hidden', marginBottom:28 }}>
              <div style={{
                padding:'22px 26px', borderBottom:'1px solid var(--border)',
                display:'flex', justifyContent:'space-between', alignItems:'center',
              }}>
                <h3 style={{ fontSize:16, fontWeight:600, color:'var(--text)' }}>Account Bankify</h3>
                <button className="btn-outline" style={{ padding:'8px 16px', fontSize:13 }} onClick={() => setModal('create')}>
                  + Add Account
                </button>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account ID</th>
                      <th>Status</th>
                      <th>Currency</th>
                      <th>Balance</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--dim)' }}>No accounts found</td></tr>
                    ) : accounts.map(acc => (
                      <tr key={acc._id}>
                        <td><span className="mono" style={{ fontSize:13, color:'var(--muted)' }}>{shortId(acc._id)}</span></td>
                        <td><span className={`badge badge-${acc.status?.toLowerCase()}`}>{acc.status}</span></td>
                        <td style={{ color:'var(--muted)', fontSize:13 }}>{acc.currency}</td>
                        <td>
                          <span className="mono" style={{ fontSize:14, fontWeight:500, color:'var(--text)' }}>
                            {balances[acc._id] !== undefined ? fmt(balances[acc._id]) : '—'}
                          </span>
                        </td>
                        <td style={{ color:'var(--dim)', fontSize:13 }}>
                          {new Date(acc.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                        <td>
                          {acc.status === 'ACTIVE' && (
                            <button className="link-btn" onClick={() => openSend(acc._id)}>Transfer ↗</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Balance breakdown */}
            {accounts.length > 0 && (
              <div className="card anim-up d3" style={{ padding:28 }}>
                <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text)', marginBottom:22 }}>Balance Breakdown</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {accounts.map(acc => {
                    const bal = balances[acc._id] || 0
                    const pct = totalBalance > 0 ? (bal / totalBalance) * 100 : 0
                    return (
                      <div key={acc._id}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <span className="mono" style={{ fontSize:12.5, color:'var(--muted)' }}>{shortId(acc._id)}</span>
                            <span className={`badge badge-${acc.status?.toLowerCase()}`} style={{ fontSize:9.5, padding:'2px 7px' }}>{acc.status}</span>
                          </div>
                          <span className="mono" style={{ fontSize:13, color:'var(--text)' }}>{fmt(bal)}</span>
                        </div>
                        <div style={{ height:5, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden' }}>
                          <div style={{
                            height:'100%', width:`${pct}%`,
                            background:'linear-gradient(90deg, var(--gold-dim), var(--gold))',
                            borderRadius:3, transition:'width .5s ease',
                          }} />
                        </div>
                        <p style={{ fontSize:11, color:'var(--dim)', marginTop:4 }}>{pct.toFixed(1)}% of portfolio</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* ─── Modals ─── */}
      {modal === 'create' && (
        <CreateAccountModal
          onConfirm={handleCreateAccount}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === 'transfer' && (
        <TransferModal
          accounts={accounts}
          balances={balances}
          defaultFrom={defaultFrom}
          onSubmit={handleTransfer}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === 'funds' && (
        <InitialFundsModal
          accounts={accounts}
          onSubmit={handleInitialFunds}
          onClose={() => setModal(null)}
          loading={actionLoading}
        />
      )}
    </div>
  )
}

/* ─── Inline transfer form (used in Transfer tab) ─── */
function TransferInline({ accounts, balances, onSubmit, loading }) {
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')
  const [amt, setAmt]   = useState('')

  const active   = accounts.filter(a => a.status === 'ACTIVE')
  const toOpts   = active.filter(a => a._id !== from)
  const fromBal  = balances[from]
  const parsed   = parseFloat(amt) || 0
  const insuf    = parsed > 0 && fromBal !== undefined && parsed > fromBal
  const canSend  = from && to && parsed > 0 && !insuf && !loading

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canSend) onSubmit(from, to, parsed)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:24 }}>
        <div className="field-wrap">
          <label className="field-label">From Account</label>
          <select className="field-input" value={from} onChange={e=>{ setFrom(e.target.value); setTo('') }} required>
            <option value="">Select source account</option>
            {active.map(a => <option key={a._id} value={a._id}>{shortId(a._id)} — {fmt(balances[a._id]||0)}</option>)}
          </select>
          {from && fromBal !== undefined && (
            <p className="field-hint">Available: <span className="mono" style={{color:'var(--muted)'}}>{fmt(fromBal)}</span></p>
          )}
        </div>

        <div style={{ textAlign:'center' }}>
          <span style={{ color:'var(--gold)', fontSize:22 }}>↓</span>
        </div>

        <div className="field-wrap">
          <label className="field-label">To Account</label>
          <select className="field-input" value={to} onChange={e=>setTo(e.target.value)} required disabled={!from}>
            <option value="">Select destination account</option>
            {toOpts.map(a => <option key={a._id} value={a._id}>{shortId(a._id)} — {fmt(balances[a._id]||0)}</option>)}
          </select>
        </div>

        <div className="field-wrap">
          <label className="field-label">Amount (INR)</label>
          <div style={{ position:'relative' }}>
            <span className="mono" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:16, pointerEvents:'none' }}>₹</span>
            <input className="field-input mono" type="number" placeholder="0.00" min="0.01" step="0.01" value={amt} onChange={e=>setAmt(e.target.value)} required style={{ paddingLeft:36 }} />
          </div>
          {insuf && <p className="field-error">Insufficient balance — max {fmt(fromBal)}</p>}
          {!insuf && from && amt && fromBal !== undefined && (
            <p className="field-hint">Remaining: <span className="mono" style={{color:'var(--muted)'}}>{fmt(fromBal - parsed)}</span></p>
          )}
        </div>
      </div>

      <button type="submit" className="btn-gold" style={{ width:'100%' }} disabled={!canSend}>
        {loading ? <span className="spinner">Processing (15s)...</span> : 'Confirm Transfer →'}
      </button>
    </form>
  )
}

/* ─── Inline initial funds form (used in Fund Account tab) ─── */
function InitialFundsInline({ accounts, onSubmit, loading }) {
  const [to, setTo]       = useState('')
  const [amt, setAmt]     = useState('')
  const [token, setToken] = useState('')

  const active   = accounts.filter(a => a.status === 'ACTIVE')
  const canSend  = to && parseFloat(amt) > 0 && token && !loading

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canSend) onSubmit(to, parseFloat(amt), token)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display:'flex', flexDirection:'column', gap:20, marginBottom:24 }}>
        <div className="field-wrap">
          <label className="field-label">System User JWT Token</label>
          <textarea
            className="field-input"
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={token}
            onChange={e => setToken(e.target.value)}
            rows={3}
            required
            style={{ resize:'vertical', fontFamily:'DM Mono, monospace', fontSize:12 }}
          />
          <p className="field-hint">JWT from a MongoDB user where systemUser: true</p>
        </div>

        <div className="field-wrap">
          <label className="field-label">Credit Account</label>
          <select className="field-input" value={to} onChange={e=>setTo(e.target.value)} required>
            <option value="">Select account to fund</option>
            {active.map(a => <option key={a._id} value={a._id}>{shortId(a._id)} — {a.currency}</option>)}
          </select>
        </div>

        <div className="field-wrap">
          <label className="field-label">Amount to Credit (INR)</label>
          <div style={{ position:'relative' }}>
            <span className="mono" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:16, pointerEvents:'none' }}>₹</span>
            <input className="field-input mono" type="number" placeholder="10000.00" min="1" step="0.01" value={amt} onChange={e=>setAmt(e.target.value)} required style={{ paddingLeft:36 }} />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSend}
        style={{
          width:'100%', padding:'13px 26px', borderRadius:11, border:'none',
          background:'linear-gradient(135deg, #60a5fa, #3b82f6)',
          color:'#fff', fontWeight:600, fontSize:14.5, cursor: canSend?'pointer':'not-allowed',
          opacity: canSend?1:.5, transition:'all .2s', fontFamily:'DM Sans, sans-serif',
        }}
      >
        {loading ? <span className="spinner">Crediting...</span> : 'Credit Funds →'}
      </button>
    </form>
  )
}
