const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")           

const app = express()

/* ─── CORS ─── */
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use(express.json())
app.use(cookieParser())

/* ─── Routes ─── */
const authRouter        = require("./routes/auth.routes")
const accountRouter     = require("./routes/account.routes")
const transactionRoutes = require("./routes/transaction.routes")

app.get("/", (req, res) => {
  res.send("Ledger Service is up and running")
})

app.use("/api/auth",         authRouter)
app.use("/api/accounts",     accountRouter)
app.use("/api/transactions", transactionRoutes)

module.exports = app