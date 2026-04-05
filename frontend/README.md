# ⟁ Ledger — Full-Stack Banking Dashboard

> A production-grade double-entry ledger system with atomic transfers, real-time balance derivation, and an immutable audit trail — built on Node.js, Express, MongoDB, and React.

---

## 📌 What is this project?

Ledger is a full-stack **financial ledger application** that simulates how real banks track money. Unlike simple balance fields, every rupee is tracked as an immutable CREDIT or DEBIT entry in a ledger. Balances are derived by summing entries — never stored directly — making the system tamper-evident and auditable. Transfers are ACID-compliant using MongoDB sessions, meaning they either fully succeed or fully fail with no partial states.

### 6-line project summary

1. **Double-Entry Accounting** — Every transaction writes two ledger entries (DEBIT + CREDIT); balances are computed on-the-fly from these immutable records.
2. **Atomic Transactions** — Transfers use MongoDB sessions with `startTransaction()` and `commitTransaction()`, so money never disappears mid-transfer.
3. **Idempotent Requests** — Every transfer requires a unique `idempotencyKey`; retrying the same key returns the original result instead of charging twice.
4. **JWT Authentication** — Users register/login to receive a 3-day JWT token; protected routes validate this token via `authMiddleware` on every request.
5. **System User Funding** — A special `authSystemUserMiddleware` guards the initial-funds endpoint, which simulates a bank crediting an account from an external source.
6. **Real-Time Balances** — Account balances are never stored; the frontend queries each account's balance fresh from ledger aggregations every time you load or refresh.

---

## 🗂 Project Structure

```
├── backend-ledger-main/          # Your Node.js / Express backend
│   ├── src/
│   │   ├── app.js                ← Add CORS here (see setup step 3)
│   │   ├── config/db.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── account.controller.js
│   │   │   └── transaction.controller.js
│   │   ├── middleware/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   ├── user.model.js
│   │   │   ├── account.model.js
│   │   │   ├── transaction.model.js
│   │   │   ├── ledger.model.js
│   │   │   └── blackList.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── account.routes.js
│   │   │   └── transaction.routes.js
│   │   └── services/
│   │       └── email.service.js
│   └── server.js
│
└── ledger-frontend/              # React + Vite frontend (this folder)
    ├── src/
    │   ├── api/
    │   │   └── client.js         ← All API calls in one place
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── AccountCard.jsx
    │   │   ├── TransferModal.jsx
    │   │   ├── CreateAccountModal.jsx
    │   │   ├── InitialFundsModal.jsx
    │   │   └── Toast.jsx
    │   ├── pages/
    │   │   ├── AuthPage.jsx
    │   │   └── Dashboard.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

---

## ⚡ Quick Setup

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

---

### Step 1 — Set up the Backend

```bash
cd backend-ledger-main
npm install
npm install cors          # ← Required for frontend connection
```

Create a `.env` file in `backend-ledger-main/`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ledger
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173

# Optional: Email service (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
```

**Update `src/app.js`** — replace it with the contents of `backend-app.js` in this folder (adds CORS config), or manually add:

```js
const cors = require("cors")

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))
```

Start the backend:

```bash
npm start
# or
node server.js
```

Backend runs at **http://localhost:3000** ✅

---

### Step 2 — Set up the Frontend

```bash
cd ledger-frontend
npm install
```

Create a `.env` file (copy from `.env.example`):

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at **http://localhost:5173** ✅

---

### Step 3 — Open in Browser

Visit **http://localhost:5173** and register a new account.

---

## 🔌 API Endpoints Reference

### Auth
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/auth/register` | `{ email, password, name }` | None |
| POST | `/api/auth/login` | `{ email, password }` | None |
| POST | `/api/auth/logout` | — | Bearer token |

### Accounts
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/accounts` | — | Bearer token |
| GET | `/api/accounts` | — | Bearer token |
| GET | `/api/accounts/balance/:accountId` | — | Bearer token |

### Transactions
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/transactions` | `{ fromAccount, toAccount, amount, idempotencyKey }` | Bearer token |
| POST | `/api/transactions/system/initial-funds` | `{ toAccount, amount, idempotencyKey }` | System user JWT |

---

## 🏦 System User Setup (for funding accounts)

The initial funds endpoint requires a "system user" — a special admin account that represents the bank itself.

1. In **MongoDB Compass**, open your database → `users` collection
2. Manually insert a document:
```json
{
  "email": "system@ledger.internal",
  "name": "System Bank",
  "password": "$2a$10...",
  "systemUser": true
}
```
> To get a hashed password, temporarily add a console.log in `user.model.js` or use the register route (then manually set `systemUser: true` in Compass).

3. Call `POST /api/auth/login` with the system user's credentials
4. Copy the returned JWT token
5. Paste it into the **Fund Account** tab in the dashboard

---

## 🧠 How the Ledger Works

```
Transfer ₹1000 from Account A → Account B

Ledger entries created:
┌─────────────────────────────────────────────┐
│ account: A  │ type: DEBIT  │ amount: 1000  │
│ account: B  │ type: CREDIT │ amount: 1000  │
└─────────────────────────────────────────────┘

Balance of A = SUM(CREDIT) - SUM(DEBIT) = -1000
Balance of B = SUM(CREDIT) - SUM(DEBIT) = +1000

Ledger entries are IMMUTABLE — they can never be
edited or deleted. This is enforced at the Mongoose
middleware level.
```

---

## 🎨 Frontend Features

| Feature | Tab | Description |
|---------|-----|-------------|
| Register / Login | Auth Page | JWT-based auth with localStorage persistence |
| View Accounts | Accounts | Cards showing live balance for each account |
| Create Account | Accounts | Creates a new INR account (ACTIVE by default) |
| Send Money | Transfer | Atomic transfer with balance validation |
| Fund Account | Fund Account | System user endpoint to add initial funds |
| Portfolio Stats | Overview | Total balance, account count, status breakdown |
| Balance Chart | Overview | Bar showing each account's % of total portfolio |

---

## 🛠 Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JSON Web Tokens (JWT)
- bcryptjs (password hashing)
- Nodemailer (email notifications)

**Frontend**
- React 18
- Vite 6
- DM Sans + Playfair Display + DM Mono (Google Fonts)
- Pure CSS with CSS custom properties

---

## 🚀 Deployment

### Backend → Render / Railway
1. Push backend to GitHub
2. Set environment variables: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`
3. Deploy — note your backend URL (e.g. `https://your-app.onrender.com`)

### Frontend → Vercel / Netlify
1. Push frontend to GitHub
2. Set environment variable: `VITE_API_URL=https://your-app.onrender.com`
3. Update backend `FRONTEND_URL` to your Vercel URL
4. Deploy

---

## 📝 License

MIT
