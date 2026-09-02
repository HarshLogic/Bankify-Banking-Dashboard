import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CreditCard, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { api } from '../services/api';

interface Account {
  _id: string;
  status: string;
  currency: string;
  balance?: number;
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts');
      const fetchedAccounts = response.data.accounts || [];
      
      // Fetch balance for each account
      const accountsWithBalance = await Promise.all(
        fetchedAccounts.map(async (acc: Account) => {
          try {
            const balanceRes = await api.get(`/accounts/balance/${acc._id}`);
            return { ...acc, balance: balanceRes.data.balance };
          } catch (e) {
            return { ...acc, balance: 0 };
          }
        })
      );
      
      setAccounts(accountsWithBalance);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async () => {
    try {
      await api.post('/accounts');
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-2">
            My Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Manage your finances with ease.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleCreateAccount}
            className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl font-semibold transition-all group"
          >
            <Plus className="w-5 h-5 mr-2 text-indigo-500 group-hover:scale-110 transition-transform" /> New Account
          </button>
          <Link 
            to="/transfer"
            className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 text-white rounded-xl font-semibold transition-all hover:-translate-y-1"
          >
            <ArrowUpRight className="w-5 h-5 mr-2" /> Transfer Funds
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {accounts.length === 0 ? (
            <div className="col-span-full py-20 px-4 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-600">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
                <CreditCard className="w-10 h-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Accounts Found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                You don't have any active accounts yet. Open your first account to start managing your money.
              </p>
              <button onClick={handleCreateAccount} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                Open Account Now
              </button>
            </div>
          ) : (
            accounts.map((account, index) => (
              <motion.div
                key={account._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className="group relative bg-gradient-to-br from-indigo-950 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-3xl p-8 shadow-2xl overflow-hidden border border-slate-800 text-white"
              >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-emerald-500/20 rounded-full blur-2xl -z-10"></div>
                
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
                      {account.status}
                    </span>
                    <p className="font-mono text-sm tracking-widest text-slate-400 opacity-80">
                      ID: {account._id.slice(-8)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/5">
                    <CreditCard className="w-6 h-6 text-indigo-400" />
                  </div>
                </div>

                <div className="relative z-10">
                  <p className="text-sm font-medium text-slate-400 mb-2">Available Balance</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-4xl md:text-5xl font-black tracking-tight">
                      {account.balance !== undefined ? account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                    </h3>
                    <span className="text-xl font-bold text-slate-400">{account.currency}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
