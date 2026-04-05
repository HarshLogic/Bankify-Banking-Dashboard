import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:3000";

const genIdempotencyKey = () =>
  `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount || 0);

const shortId = (id) => "···· " + String(id).slice(-8).toUpperCase();

export default function App() {
  const [view, setView] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);

  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [transfer, setTransfer] = useState({ fromAccount: "", toAccount: "", amount: "" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const apiCall = useCallback(
    async (path, method = "GET", body = null, tok = token) => {
      const opts = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
        },
      };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`${API_BASE}${path}`, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Request failed");
      return data;
    },
    [token]
  );

  const fetchAccounts = useCallback(
    async (tok) => {
      setGlobalLoading(true);
      try {
        const data = await apiCall("/api/accounts", "GET", null, tok);
        const accs = data.accounts || [];
        setAccounts(accs);
        const results = await Promise.all(
          accs.map((acc) =>
            apiCall(`/api/accounts/balance/${acc._id}`, "GET", null, tok)
              .then((b) => [acc._id, b.balance])
              .catch(() => [acc._id, 0])
          )
        );
        setBalances(Object.fromEntries(results));
      } catch {
        showToast("Failed to load accounts", "error");
      } finally {
        setGlobalLoading(false);
      }
    },
    [apiCall]
  );

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const path = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        authMode === "login"
          ? { email: form.email, password: form.password }
          : { email: form.email, password: form.password, name: form.name };
      const data = await apiCall(path, "POST", body, null);
      setToken(data.token);
      setUser(data.user);
      await fetchAccounts(data.token);
      setView("dashboard");
      showToast(authMode === "login" ? `Welcome back, ${data.user.name}!` : "Account created successfully!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiCall("/api/auth/logout", "POST");
    } catch {}
    setToken(null);
    setUser(null);
    setAccounts([]);
    setBalances({});
    setView("auth");
    setForm({ email: "", password: "", name: "" });
    showToast("Signed out successfully");
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      await apiCall("/api/accounts", "POST");
      await fetchAccounts(token);
      setModal(null);
      showToast("New account created!");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall("/api/transactions", "POST", {
        fromAccount: transfer.fromAccount,
        toAccount: transfer.toAccount,
        amount: parseFloat(transfer.amount),
        idempotencyKey: genIdempotencyKey(),
      });
      await fetchAccounts(token);
      setModal(null);
      setTransfer({ fromAccount: "", toAccount: "", amount: "" });
      showToast("Transfer successful! Balances updated.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = Object.values(balances).reduce((s, b) => s + (b || 0), 0);
  const activeAccounts = accounts.filter((a) => a.status === "ACTIVE");

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Mono:wght@400;500&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root {
      --gold: #e8b86d;
      --gold-dim: #c89a52;
      --gold-glow: rgba(232,184,109,0.18);
      --bg: #07091a;
      --surface: #0f1526;
      --card: #131d33;
      --card2: #1a2540;
      --border: rgba(255,255,255,0.07);
      --border-gold: rgba(232,184,109,0.2);
      --text: #edf0ff;
      --muted: #8891a4;
      --dim: #3d4559;
      --green: #34d399;
      --red: #f87171;
      --blue: #60a5fa;
    }
    body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); }
    button { cursor:pointer; font-family:'DM Sans',sans-serif; }
    input,select { font-family:'DM Sans',sans-serif; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes slideIn { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    .anim-up { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both }
    .anim-in { animation:fadeIn .3s ease both }
    .anim-slide { animation:slideIn .4s cubic-bezier(.22,1,.36,1) both }
    .delay-1 { animation-delay:.06s }
    .delay-2 { animation-delay:.12s }
    .delay-3 { animation-delay:.18s }
    .delay-4 { animation-delay:.24s }
    .gold-btn {
      background: linear-gradient(135deg, #e8b86d 0%, #c89a52 100%);
      color: #1a0e00; font-weight:600; border:none; border-radius:11px;
      padding:14px 28px; font-size:15px; letter-spacing:.2px;
      transition:all .22s; display:inline-flex; align-items:center; gap:8px;
    }
    .gold-btn:hover { transform:translateY(-1px); box-shadow:0 8px 28px rgba(232,184,109,.3); }
    .gold-btn:active { transform:translateY(0); }
    .gold-btn:disabled { opacity:.55; cursor:not-allowed; transform:none; }
    .outline-btn {
      border:1px solid var(--border-gold); color:var(--gold); background:transparent;
      border-radius:11px; padding:12px 22px; font-size:14px; font-weight:500;
      transition:all .2s;
    }
    .outline-btn:hover { background:var(--gold-glow); border-color:rgba(232,184,109,.45); }
    .outline-btn:disabled { opacity:.5; cursor:not-allowed; }
    .ghost-btn {
      border:1px solid var(--border); color:var(--muted); background:transparent;
      border-radius:9px; padding:8px 16px; font-size:13px; font-weight:500;
      transition:all .2s;
    }
    .ghost-btn:hover { border-color:rgba(255,255,255,.14); color:var(--text); }
    .field-label { display:block; font-size:12.5px; color:var(--muted); font-weight:500; letter-spacing:.4px; margin-bottom:8px; text-transform:uppercase; }
    .field-input {
      width:100%; background:rgba(255,255,255,.04); border:1px solid var(--border);
      border-radius:10px; padding:13px 16px; color:var(--text); font-size:15px;
      transition:border-color .2s, background .2s; outline:none;
    }
    .field-input:focus { border-color:rgba(232,184,109,.55); background:rgba(232,184,109,.04); }
    .field-input::placeholder { color:var(--dim); }
    .field-input option { background:#1a2540; color:var(--text); }
    .card-surface {
      background:var(--card); border:1px solid var(--border); border-radius:18px;
      transition:border-color .2s, transform .2s;
    }
    .card-surface:hover { border-color:rgba(255,255,255,.12); }
    .card-gold { background:var(--card); border:1px solid var(--border-gold); border-radius:18px; }
    .account-card { transition:transform .2s, border-color .25s, box-shadow .25s; }
    .account-card:hover { transform:translateY(-3px); border-color:rgba(232,184,109,.3); box-shadow:0 12px 40px rgba(0,0,0,.35); }
    .badge {
      display:inline-flex; align-items:center; gap:5px;
      font-size:10.5px; font-weight:600; letter-spacing:.7px; text-transform:uppercase;
      padding:4px 10px; border-radius:20px;
    }
    .badge-active { background:rgba(52,211,153,.12); color:#34d399; }
    .badge-frozen { background:rgba(96,165,250,.12); color:#60a5fa; }
    .badge-closed { background:rgba(248,113,113,.12); color:#f87171; }
    .overlay {
      position:fixed; inset:0; background:rgba(0,0,0,.78); backdrop-filter:blur(6px);
      z-index:100; display:flex; align-items:center; justify-content:center; padding:24px;
    }
    .modal {
      background:var(--surface); border:1px solid var(--border-gold);
      border-radius:22px; padding:44px; width:100%; max-width:480px;
      animation:fadeUp .35s cubic-bezier(.22,1,.36,1) both;
      max-height:90vh; overflow-y:auto;
    }
    .toast {
      position:fixed; top:24px; right:24px; z-index:200;
      padding:14px 20px; border-radius:13px; font-size:14px; font-weight:500;
      max-width:380px; animation:slideIn .3s ease;
      display:flex; align-items:center; gap:10px;
    }
    .toast-success { background:rgba(52,211,153,.13); border:1px solid rgba(52,211,153,.28); color:#6ee7b7; }
    .toast-error { background:rgba(248,113,113,.13); border:1px solid rgba(248,113,113,.28); color:#fca5a5; }
    .divider { height:1px; background:var(--border); }
    .spinner { animation:pulse 1.4s infinite; }
    .stat-item { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px 24px; }
    .mono { font-family:'DM Mono',monospace; }
    .serif { font-family:'Playfair Display',serif; }
    .scroll-hidden::-webkit-scrollbar { display:none; }
    .send-quick { font-size:12px; color:var(--gold); background:none; border:none; cursor:pointer; font-weight:500; opacity:.8; transition:opacity .2s; }
    .send-quick:hover { opacity:1; }
    .nav-tab { padding:10px 20px; border-radius:10px; font-size:14px; font-weight:500; color:var(--muted); transition:all .2s; border:none; background:none; }
    .nav-tab.active { background:rgba(232,184,109,.1); color:var(--gold); }
    .nav-tab:hover:not(.active) { color:var(--text); }
  `;

  return (
    <>
      <style>{css}</style>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          {toast.msg}
        </div>
      )}

      {view === "auth" ? (
        <AuthPage />
      ) : (
        <Dashboard />
      )}
    </>
  );

  /* ─────────────── AUTH PAGE ─────────────── */
  function AuthPage() {
    return (
      <div style={{ minHeight: "100vh", display: "flex" }}>
        {/* Left: Branding */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 80px",
            background:
              "radial-gradient(ellipse 60% 70% at 20% 60%, rgba(232,184,109,.09) 0%, transparent 70%)",
            borderRight: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative rings */}
          <div
            style={{
              position: "absolute",
              right: -120,
              top: "50%",
              transform: "translateY(-50%)",
              width: 480,
              height: 480,
              borderRadius: "50%",
              border: "1px solid rgba(232,184,109,.07)",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: -40,
              top: "50%",
              transform: "translateY(-50%)",
              width: 320,
              height: 320,
              borderRadius: "50%",
              border: "1px solid rgba(232,184,109,.07)",
            }}
          />

          <div style={{ maxWidth: 520, position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <div
              style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 72 }}
              className="anim-up"
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "linear-gradient(135deg, #e8b86d, #a06820)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  boxShadow: "0 4px 20px rgba(232,184,109,.3)",
                }}
              >
                ⟁
              </div>
              <span
                className="serif"
                style={{ fontSize: 24, fontWeight: 700, color: "var(--gold)", letterSpacing: "-.3px" }}
              >
                Ledger
              </span>
            </div>

            <h1
              className="serif anim-up delay-1"
              style={{ fontSize: 58, fontWeight: 700, color: "var(--text)", lineHeight: 1.08, marginBottom: 28 }}
            >
              Money moves.<br />
              <span style={{ color: "var(--gold)" }}>Records</span><br />
              don't lie.
            </h1>

            <p className="anim-up delay-2" style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.75, maxWidth: 400, marginBottom: 56 }}>
              A double-entry ledger system with atomic transactions, real-time balance derivation, and idempotent transfers.
            </p>

            <div className="anim-up delay-3" style={{ display: "flex", gap: 12 }}>
              {[
                { icon: "⬡", title: "Double-Entry", sub: "Ledger-based" },
                { icon: "⚡", title: "Atomic Txns", sub: "ACID compliant" },
                { icon: "⚲", title: "Idempotent", sub: "Safe retries" },
              ].map(({ icon, title, sub }) => (
                <div
                  key={title}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,.03)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "18px 16px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 22, color: "var(--gold)", marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 11, color: "var(--dim)" }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div
          style={{
            width: 500,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 56px",
            background: "rgba(0,0,0,.2)",
          }}
        >
          <div className="anim-up">
            <h2
              className="serif"
              style={{ fontSize: 34, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}
            >
              {authMode === "login" ? "Welcome back" : "Get started"}
            </h2>
            <p style={{ color: "var(--dim)", fontSize: 14, marginBottom: 40 }}>
              {authMode === "login"
                ? "Enter your credentials to access your portfolio"
                : "Create an account to start tracking your finances"}
            </p>

            <form onSubmit={handleAuth}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
                {authMode === "register" && (
                  <div>
                    <label className="field-label">Full Name</label>
                    <input
                      className="field-input"
                      type="text"
                      placeholder="Arjun Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="field-label">Email Address</label>
                  <input
                    className="field-input"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-label">Password</label>
                  <input
                    className="field-input"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  {authMode === "register" && (
                    <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 6 }}>
                      Minimum 6 characters
                    </p>
                  )}
                </div>
              </div>

              <button type="submit" className="gold-btn" style={{ width: "100%" }} disabled={loading}>
                {loading ? (
                  <span className="spinner">Processing...</span>
                ) : authMode === "login" ? (
                  "Sign In →"
                ) : (
                  "Create Account →"
                )}
              </button>
            </form>

            <div
              style={{ height: "1px", background: "var(--border)", margin: "28px 0" }}
            />

            <p style={{ textAlign: "center", color: "var(--dim)", fontSize: 14 }}>
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--gold)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {authMode === "login" ? "Register free" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────── DASHBOARD ─────────────── */
  function Dashboard() {
    const [activeTab, setActiveTab] = useState("accounts");

    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Top Nav */}
        <header
          style={{
            padding: "0 40px",
            height: 68,
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(7,9,26,.9)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: "linear-gradient(135deg, #e8b86d, #a06820)",
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                ⟁
              </div>
              <span
                className="serif"
                style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)" }}
              >
                Ledger
              </span>
            </div>
            <nav style={{ display: "flex", gap: 4 }}>
              {["accounts", "overview"].map((tab) => (
                <button
                  key={tab}
                  className={`nav-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 16px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(232,184,109,.3), rgba(232,184,109,.1))",
                  border: "1px solid var(--border-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--gold)",
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: "var(--dim)" }}>{user?.email}</div>
              </div>
            </div>
            <button className="ghost-btn" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "48px 40px", maxWidth: 1300, margin: "0 auto", width: "100%" }}>
          {activeTab === "accounts" ? (
            <AccountsTab />
          ) : (
            <OverviewTab />
          )}
        </main>

        {/* Modals */}
        {modal === "transfer" && <TransferModal />}
        {modal === "create" && <CreateAccountModal />}
      </div>
    );

    function AccountsTab() {
      return (
        <>
          {/* Hero Balance */}
          <div
            className="anim-up"
            style={{
              background:
                "linear-gradient(135deg, rgba(232,184,109,.08) 0%, rgba(232,184,109,.02) 50%, rgba(99,102,241,.05) 100%)",
              border: "1px solid var(--border-gold)",
              borderRadius: 24,
              padding: "44px 52px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 40,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background decoration */}
            <div
              style={{
                position: "absolute",
                right: -60,
                top: -60,
                width: 280,
                height: 280,
                borderRadius: "50%",
                background: "rgba(232,184,109,.04)",
                border: "1px solid rgba(232,184,109,.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 20,
                top: 20,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "rgba(232,184,109,.04)",
                border: "1px solid rgba(232,184,109,.06)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <p
                style={{
                  fontSize: 11.5,
                  color: "var(--muted)",
                  fontWeight: 600,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                Total Portfolio Balance
              </p>
              {globalLoading ? (
                <div
                  className="spinner mono"
                  style={{ fontSize: 48, color: "var(--dim)", fontWeight: 400 }}
                >
                  Loading...
                </div>
              ) : (
                <div
                  className="mono"
                  style={{ fontSize: 56, fontWeight: 500, color: "var(--text)", letterSpacing: "-1.5px", lineHeight: 1 }}
                >
                  {formatCurrency(totalBalance)}
                </div>
              )}
              <p style={{ color: "var(--dim)", fontSize: 14, marginTop: 14 }}>
                {accounts.length} account{accounts.length !== 1 ? "s" : ""} ·{" "}
                {activeAccounts.length} active · INR
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 1 }}>
              <button className="outline-btn" onClick={() => setModal("create")}>
                + New Account
              </button>
              <button
                className="gold-btn"
                onClick={() => setModal("transfer")}
                disabled={activeAccounts.length < 2}
                title={activeAccounts.length < 2 ? "Need at least 2 active accounts" : ""}
              >
                ↗ Send Money
              </button>
            </div>
          </div>

          {/* Section Header */}
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}
          >
            <h2
              className="serif"
              style={{ fontSize: 24, fontWeight: 600, color: "var(--text)" }}
            >
              Your Accounts
            </h2>
            <button
              className="ghost-btn"
              onClick={() => fetchAccounts(token)}
              style={{ fontSize: 13 }}
            >
              ↻ Refresh
            </button>
          </div>

          {/* Account Cards */}
          {accounts.length === 0 && !globalLoading ? (
            <div
              className="card-surface anim-up"
              style={{ padding: "72px", textAlign: "center" }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  background: "var(--gold-glow)",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  margin: "0 auto 24px",
                  color: "var(--gold)",
                }}
              >
                ◉
              </div>
              <p
                className="serif"
                style={{ fontSize: 22, color: "var(--text)", marginBottom: 12 }}
              >
                No accounts yet
              </p>
              <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 32, maxWidth: 320, margin: "0 auto 32px" }}>
                Create your first account to start managing your finances.
              </p>
              <button className="gold-btn" onClick={() => setModal("create")}>
                Create First Account →
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: 22,
              }}
            >
              {accounts.map((acc, i) => (
                <div
                  key={acc._id}
                  className={`card-surface account-card anim-up delay-${Math.min(i + 1, 4)}`}
                  style={{ padding: "30px", position: "relative", overflow: "hidden" }}
                >
                  {/* Card chip decoration */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 120,
                      height: 120,
                      background:
                        acc.status === "ACTIVE"
                          ? "radial-gradient(circle, rgba(232,184,109,.07) 0%, transparent 70%)"
                          : "radial-gradient(circle, rgba(96,165,250,.05) 0%, transparent 70%)",
                      borderRadius: "0 18px 0 100%",
                    }}
                  />

                  {/* Header */}
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--dim)",
                          fontWeight: 600,
                          letterSpacing: ".8px",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        Account ID
                      </p>
                      <p
                        className="mono"
                        style={{ fontSize: 13.5, color: "var(--muted)", letterSpacing: ".5px" }}
                      >
                        {shortId(acc._id)}
                      </p>
                    </div>
                    <span className={`badge badge-${acc.status?.toLowerCase()}`}>
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "currentColor",
                          display: "inline-block",
                        }}
                      />
                      {acc.status}
                    </span>
                  </div>

                  {/* Balance */}
                  <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 12, color: "var(--dim)", marginBottom: 10 }}>Available Balance</p>
                    {balances[acc._id] !== undefined ? (
                      <p
                        className="mono"
                        style={{ fontSize: 34, fontWeight: 500, color: "var(--text)", letterSpacing: "-1px" }}
                      >
                        {formatCurrency(balances[acc._id])}
                      </p>
                    ) : (
                      <p
                        className="spinner mono"
                        style={{ fontSize: 26, color: "var(--dim)" }}
                      >
                        Fetching...
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    style={{
                      paddingTop: 18,
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--dim)" }}>
                      {acc.currency} ·{" "}
                      {new Date(acc.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    {acc.status === "ACTIVE" && (
                      <button
                        className="send-quick"
                        onClick={() => {
                          setTransfer({ ...transfer, fromAccount: acc._id });
                          setModal("transfer");
                        }}
                      >
                        Send ↗
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    function OverviewTab() {
      return (
        <>
          <h2
            className="serif anim-up"
            style={{ fontSize: 28, fontWeight: 600, color: "var(--text)", marginBottom: 32 }}
          >
            Portfolio Overview
          </h2>

          {/* Stats Grid */}
          <div
            className="anim-up delay-1"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 36 }}
          >
            {[
              { label: "Total Balance", value: formatCurrency(totalBalance), icon: "₹", accent: true },
              { label: "Total Accounts", value: accounts.length, icon: "⬡" },
              { label: "Active Accounts", value: activeAccounts.length, icon: "◉" },
              {
                label: "Frozen / Closed",
                value: accounts.length - activeAccounts.length,
                icon: "⊘",
              },
            ].map(({ label, value, icon, accent }) => (
              <div
                key={label}
                className="stat-item"
                style={
                  accent
                    ? { background: "var(--card-gold, var(--card))", borderColor: "var(--border-gold)" }
                    : {}
                }
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".6px" }}>
                    {label}
                  </p>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: accent ? "var(--gold-glow)" : "rgba(255,255,255,.04)",
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      color: accent ? "var(--gold)" : "var(--muted)",
                    }}
                  >
                    {icon}
                  </div>
                </div>
                <p
                  className="mono"
                  style={{ fontSize: accent ? 26 : 36, fontWeight: 500, color: accent ? "var(--gold)" : "var(--text)", letterSpacing: "-0.5px" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Account Details Table */}
          <div
            className="card-surface anim-up delay-2"
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Account Ledger</h3>
              <button
                className="outline-btn"
                style={{ padding: "8px 16px", fontSize: 13 }}
                onClick={() => setModal("create")}
              >
                + Add Account
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Account ID", "Status", "Currency", "Balance", "Created", ""].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "14px 24px",
                          textAlign: "left",
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "var(--dim)",
                          textTransform: "uppercase",
                          letterSpacing: ".7px",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ padding: "40px", textAlign: "center", color: "var(--dim)", fontSize: 14 }}
                      >
                        No accounts found
                      </td>
                    </tr>
                  ) : (
                    accounts.map((acc, i) => (
                      <tr
                        key={acc._id}
                        style={{
                          borderBottom: i < accounts.length - 1 ? "1px solid var(--border)" : "none",
                          transition: "background .15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      >
                        <td style={{ padding: "16px 24px" }}>
                          <span className="mono" style={{ fontSize: 13.5, color: "var(--muted)" }}>
                            {shortId(acc._id)}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span className={`badge badge-${acc.status?.toLowerCase()}`}>
                            {acc.status}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", color: "var(--muted)", fontSize: 14 }}>
                          {acc.currency}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span className="mono" style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
                            {balances[acc._id] !== undefined ? formatCurrency(balances[acc._id]) : "—"}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", color: "var(--dim)", fontSize: 13 }}>
                          {new Date(acc.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          {acc.status === "ACTIVE" && (
                            <button
                              className="send-quick"
                              onClick={() => {
                                setTransfer({ ...transfer, fromAccount: acc._id });
                                setModal("transfer");
                              }}
                            >
                              Transfer ↗
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }

    function TransferModal() {
      const availableFrom = activeAccounts;
      const availableTo = activeAccounts.filter((a) => a._id !== transfer.fromAccount);
      const fromBal = balances[transfer.fromAccount];

      return (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "var(--gold-glow)",
                  border: "1px solid var(--border-gold)",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: "var(--gold)",
                }}
              >
                ↗
              </div>
              <div>
                <h3 className="serif" style={{ fontSize: 26, fontWeight: 700, color: "var(--text)" }}>
                  Transfer Funds
                </h3>
                <p style={{ fontSize: 13, color: "var(--dim)" }}>
                  Takes ~15 seconds to process
                </p>
              </div>
            </div>

            <div style={{ height: 1, background: "var(--border)", margin: "28px 0" }} />

            <form onSubmit={handleTransfer}>
              <div style={{ display: "flex", flexDirection: "column", gap: 22, marginBottom: 32 }}>
                {/* From */}
                <div>
                  <label className="field-label">From Account</label>
                  <select
                    className="field-input"
                    value={transfer.fromAccount}
                    onChange={(e) => setTransfer({ ...transfer, fromAccount: e.target.value, toAccount: "" })}
                    required
                  >
                    <option value="">Select source account</option>
                    {availableFrom.map((a) => (
                      <option key={a._id} value={a._id}>
                        {shortId(a._id)} — {formatCurrency(balances[a._id] || 0)}
                      </option>
                    ))}
                  </select>
                  {transfer.fromAccount && fromBal !== undefined && (
                    <p style={{ fontSize: 12, color: "var(--dim)", marginTop: 7 }}>
                      Available:{" "}
                      <span className="mono" style={{ color: "var(--muted)" }}>
                        {formatCurrency(fromBal)}
                      </span>
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "var(--gold-glow)",
                      border: "1px solid var(--border-gold)",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--gold)",
                      fontSize: 18,
                    }}
                  >
                    ↓
                  </div>
                </div>

                {/* To */}
                <div>
                  <label className="field-label">To Account</label>
                  <select
                    className="field-input"
                    value={transfer.toAccount}
                    onChange={(e) => setTransfer({ ...transfer, toAccount: e.target.value })}
                    required
                  >
                    <option value="">Select destination account</option>
                    {availableTo.map((a) => (
                      <option key={a._id} value={a._id}>
                        {shortId(a._id)} — {formatCurrency(balances[a._id] || 0)}
                      </option>
                    ))}
                  </select>
                  {availableTo.length === 0 && transfer.fromAccount && (
                    <p style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>
                      No other active accounts available
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="field-label">Amount</label>
                  <div style={{ position: "relative" }}>
                    <span
                      className="mono"
                      style={{
                        position: "absolute",
                        left: 16,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--muted)",
                        fontSize: 16,
                        pointerEvents: "none",
                      }}
                    >
                      ₹
                    </span>
                    <input
                      className="field-input mono"
                      type="number"
                      placeholder="0.00"
                      min="1"
                      step="0.01"
                      value={transfer.amount}
                      onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                      required
                      style={{ paddingLeft: 36 }}
                    />
                  </div>
                  {transfer.fromAccount && transfer.amount && fromBal !== undefined && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 12, color: "var(--dim)" }}>
                        After transfer:{" "}
                        <span className="mono" style={{ color: parseFloat(transfer.amount) > fromBal ? "var(--red)" : "var(--green)" }}>
                          {formatCurrency(fromBal - parseFloat(transfer.amount || 0))}
                        </span>
                      </span>
                      {parseFloat(transfer.amount) > fromBal && (
                        <span style={{ fontSize: 12, color: "var(--red)" }}>Insufficient balance</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  type="button"
                  className="outline-btn"
                  style={{ flex: 1 }}
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-btn"
                  style={{ flex: 2 }}
                  disabled={
                    loading ||
                    !transfer.fromAccount ||
                    !transfer.toAccount ||
                    !transfer.amount ||
                    parseFloat(transfer.amount) > (fromBal || 0)
                  }
                >
                  {loading ? <span className="spinner">Processing...</span> : "Confirm Transfer →"}
                </button>
              </div>

              <p style={{ textAlign: "center", fontSize: 12, color: "var(--dim)", marginTop: 18 }}>
                Transactions are atomic and idempotent. A unique key is generated per request.
              </p>
            </form>
          </div>
        </div>
      );
    }

    function CreateAccountModal() {
      return (
        <div className="overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 420, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                width: 72,
                height: 72,
                background: "var(--gold-glow)",
                border: "1px solid var(--border-gold)",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                margin: "0 auto 24px",
                color: "var(--gold)",
              }}
            >
              +
            </div>
            <h3 className="serif" style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", marginBottom: 14 }}>
              Create New Account
            </h3>
            <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.75, marginBottom: 12 }}>
              A new INR account will be created and linked to your profile.
            </p>
            <p style={{ color: "var(--dim)", fontSize: 13, marginBottom: 36 }}>
              Status will default to <span style={{ color: "var(--green)", fontWeight: 500 }}>ACTIVE</span>. Use the system endpoint to fund it with initial balance.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="outline-btn" style={{ flex: 1 }} onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="gold-btn" style={{ flex: 2 }} onClick={handleCreateAccount} disabled={loading}>
                {loading ? <span className="spinner">Creating...</span> : "Create Account →"}
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}