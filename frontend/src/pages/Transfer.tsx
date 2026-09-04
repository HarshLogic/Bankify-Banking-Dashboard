import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Send } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Transfer() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await api.get('/accounts');
        const fetchedAccounts = response.data.accounts || [];
        
        const accountsWithBalance = await Promise.all(
          fetchedAccounts.map(async (acc: any) => {
            try {
              const balanceRes = await api.get(`/accounts/balance/${acc._id}`);
              return { ...acc, balance: balanceRes.data.balance };
            } catch (e) {
              return { ...acc, balance: 0 };
            }
          })
        );
        
        setAccounts(accountsWithBalance);
        if (accountsWithBalance.length > 0) {
          setFromAccountId(accountsWithBalance[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch accounts');
      }
    };
    fetchAccounts();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const idempotencyKey = `transfer-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await api.post('/transactions', {
        fromAccount: fromAccountId,
        toAccount: toAccountId,
        amount: Number(amount),
        idempotencyKey: idempotencyKey
      });
      setSuccess('Transfer successful!');
      setAmount('');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">Transfer Money</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Send funds securely to any account.</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
            <Send className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></div>
            {success}
          </motion.div>
        )}

        <form onSubmit={handleTransfer} className="space-y-8 relative z-10">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">From Account</label>
            <select
              value={fromAccountId}
              onChange={(e) => setFromAccountId(e.target.value)}
              required
              className="w-full px-4 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all text-lg font-medium"
            >
              <option value="" disabled>Select an account</option>
              {accounts.map(acc => (
                <option key={acc._id} value={acc._id}>
                  {acc.status} ({acc._id}) - {acc.balance !== undefined ? acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'} {acc.currency}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-center -my-6 relative z-20">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md shadow-indigo-500/20">
              <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 rotate-90 md:rotate-0" />
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Recipient Account ID</label>
            <input
              type="text"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value.trim())}
              required
              placeholder="Paste 24-character Account ID"
              className="w-full px-4 py-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all font-mono tracking-widest text-lg"
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Amount to Transfer</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                step="any"
                placeholder="0.00"
                className="w-full pl-12 pr-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-4xl font-black text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-lg font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                Processing Transfer...
              </span>
            ) : 'Confirm Transfer'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
