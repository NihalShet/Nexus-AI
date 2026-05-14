import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Chrome } from 'lucide-react';
import { loginWithGoogle } from '../lib/firebase';

export default function Login() {
  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl p-12 shadow-2xl shadow-black/5 border border-black/5 flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-black/10">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-4 text-[var(--color-brand-primary)]">
          Nexus AI Studio
        </h1>
        <p className="text-[var(--color-brand-secondary)] font-medium mb-10 leading-relaxed">
          Your creative powerhouse for writing, coding, and imagining. Sign in to start your journey.
        </p>

        <button 
          onClick={loginWithGoogle}
          className="w-full group relative flex items-center justify-center gap-3 bg-black text-white py-4 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-black/20"
        >
          <Chrome className="w-5 h-5 transition-transform group-hover:rotate-12" />
          Sign in with Google
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="mt-12 pt-8 border-t border-black/5 w-full">
          <p className="text-[10px] text-black/30 font-bold uppercase tracking-widest leading-loose">
            Secure, professional, and powerful AI at your fingertips.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
