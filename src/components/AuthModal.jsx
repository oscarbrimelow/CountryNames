import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthModal = ({ isOpen, onClose, user }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new window.firebase.auth.GoogleAuthProvider();
      await window.auth.signInWithPopup(provider);
      onClose();
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await window.auth.signOut();
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950/50">
          <h2 className="text-xl font-bold text-slate-100">
            {user ? 'Account' : 'Sign In'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          {user ? (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-emerald-400">
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium text-slate-200">{user.email}</p>
                <p className="text-sm text-slate-500">Member since {new Date(user.metadata.creationTime).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <div className="mt-2">
                <p className="text-center text-slate-400 text-sm mb-6">
                  Sign in to save your progress and compete on the leaderboard.
                </p>

                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-3 bg-white text-zinc-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-3 shadow-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                    <path d="M12 4.81c1.6 0 3.05.55 4.11 1.56l3.08-3.09C17.46 1.48 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

window.AuthModal = AuthModal;
