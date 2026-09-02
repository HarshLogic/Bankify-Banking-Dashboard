import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Moon, Sun, Wallet } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Bankify</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <Link to="/login" className="text-sm font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="text-sm font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow pt-16">
        <Outlet />
      </main>
      
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} Bankify. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
