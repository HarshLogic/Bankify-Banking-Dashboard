import React from 'react';
import { motion } from 'framer-motion';
import ThreeDCard from '../components/ThreeDCard';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Banking for the Next Generation
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
                Experience seamless, secure, and lightning-fast financial management. Bankify puts the power of your money back in your hands.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-900 dark:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full transition-colors">
                  Sign In
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 w-full h-[400px] lg:h-[600px]"
            >
              <ThreeDCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Bankify?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We combine cutting-edge technology with banking fundamentals to give you the best experience possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Shield className="w-8 h-8 text-indigo-500" />}
              title="Bank-grade Security"
              description="Your money and data are protected by industry-leading encryption and security protocols."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-yellow-500" />}
              title="Instant Transfers"
              description="Send and receive money instantly across the globe with zero hidden fees."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-emerald-500" />}
              title="Global Access"
              description="Access your funds anywhere, anytime with our modern web platform."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"
    >
      <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
