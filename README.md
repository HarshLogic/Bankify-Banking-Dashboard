# 🏦 Bankify

![Bankify Banner](https://img.shields.io/badge/Bankify-Banking_Dashboard-indigo?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)

Bankify is a modern, full-stack banking dashboard application featuring a beautiful 3D-animated frontend and a highly secure, ledger-based transaction backend.

## ✨ Features

### 🎨 Frontend
- **Stunning 3D UI:** Uses `@react-three/fiber` and Framer Motion for immersive, smooth 3D card animations and transitions.
- **Modern Dashboard:** View all your active accounts, check available balances, and seamlessly navigate your finances.
- **Dark/Light Mode:** Full theming support via Tailwind CSS for comfortable viewing at any time of day.
- **Responsive Design:** Optimized for mobile, tablet, and desktop devices.
- **Secure Transfers:** Real-time money transfers using 24-character Account IDs.

### ⚙️ Backend
- **Ledger-Based Accounting:** Balances are strictly calculated through immutable CREDIT and DEBIT ledger entries, ensuring zero data corruption or balance inconsistencies.
- **Idempotency:** Transactions require unique idempotency keys to completely eliminate the risk of accidental double-spending.
- **Secure Authentication:** JWT-based user authentication (Login/Register) using secure HTTP-only cookies.
- **Atomic Transactions:** Uses MongoDB replica set sessions and transactions (`session.startTransaction()`) to guarantee that money is never lost during network failures.

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 (Vite)
- TypeScript
- Tailwind CSS
- Framer Motion (Animations)
- React Three Fiber & Drei (3D Graphics)
- Lucide React (Icons)
- Axios

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Nodemailer (Email notifications)
- bcrypt (Password hashing)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster (Replica set required for ACID transactions)

### 1. Clone the repository
```bash
git clone https://github.com/HarshLogic/Bankify-Banking-Dashboard.git
cd Bankify-Banking-Dashboard
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file inside the `backend` directory with the following variables:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```bash
npm start
```
*(The backend will run on `http://localhost:3000`)*

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
```
*(The frontend will run on `http://localhost:5173`)*

---

## 📖 How to use the Transfer System
1. **Register** a new account and log in.
2. Go to your **Dashboard** and copy your 24-character **Account ID**.
3. Create a second account (or use a friend's Account ID).
4. Go to the **Transfer** page, paste the 24-character Recipient ID, enter the amount, and send!

---

## 🛡️ Security & Architecture Notes
Bankify handles money safely by avoiding standard database updates for balances. Instead of doing `balance = balance - 100`, the system creates a permanent `DEBIT` ledger entry for the sender and a `CREDIT` ledger entry for the receiver. The account's total balance is then dynamically derived by aggregating all historical ledger entries. This double-entry bookkeeping pattern is the industry standard for financial software. 

## 👨‍💻 Author
**HarshLogic**
