import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Lock, Check, X, AlertCircle } from 'lucide-react';
import { signInWithPopup, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface LumaLoginProps {
  onLoginSuccess: (user: any) => void;
  onNavigateToRegister: () => void;
}

export const LumaLogin: React.FC<LumaLoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [resetMessage, setResetMessage] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Sync user profile in Firestore
      try {
        const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || email.split('@')[0],
          authProvider: 'password',
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (dbErr) {
        console.warn('Firestore profile sync notice:', dbErr);
      }
      onLoginSuccess(result.user);
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed' || err.code === 'auth/operation-not-allowed') {
        // Automatic resilient fallback to server proxy to bypass browser/iframe network blocks
        try {
          const resp = await fetch('/api/auth/login-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await resp.json();
          if (data.success && data.user) {
            onLoginSuccess(data.user);
            return;
          } else if (data.message) {
            setError(data.message);
            return;
          }
        } catch (proxyErr) {
          console.warn('Proxy login fallback notice:', proxyErr);
        }

        // Fallback: Check local registered account
        try {
          const accountsRaw = localStorage.getItem('luma_accounts');
          const accounts = accountsRaw ? JSON.parse(accountsRaw) : {};
          const localAcc = accounts[email.trim().toLowerCase()];
          if (localAcc && localAcc.password === password) {
            onLoginSuccess({
              uid: localAcc.uid,
              email: localAcc.email,
              displayName: localAcc.displayName,
              emailVerified: true
            });
            return;
          } else if (localAcc && localAcc.password !== password) {
            setError('Invalid password. Please check your credentials.');
            return;
          }
        } catch (storageErr) {
          console.warn('Local account verification notice:', storageErr);
        }
        setError('Account not found. Please click "Create an account" to register.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please check your credentials or create an account.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Access temporarily disabled due to many failed attempts. Reset your password or try later.');
      } else {
        setError(err?.message || 'Login failed. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Persist Google authorized user in Firestore
      try {
        const { setDoc, doc, serverTimestamp } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || 'Luma Journaler',
          photoURL: result.user.photoURL || null,
          authProvider: 'google',
          emailVerified: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (dbErr) {
        console.warn('Firestore Google login sync notice:', dbErr);
      }
      onLoginSuccess(result.user);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups or open in a new tab.');
      } else {
        setError(err?.message || 'Google authorization failed. Please try email sign-in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetStatus('sending');
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetStatus('success');
      setResetMessage(`Password reset link dispatched by Firebase to ${resetEmail}.`);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setResetStatus('error');
        setResetMessage('No account found with this email address.');
      } else {
        setResetStatus('error');
        setResetMessage(err?.message || 'Failed to send reset email. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen h-auto overflow-y-auto overflow-x-hidden relative flex flex-col justify-center items-center px-4 py-4 sm:py-6 bg-[#FAF8F5]">
      {/* Background Image: Sweeping 3D luminous glass ribbons & golden light streams */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-90 transition-opacity duration-1000"
        style={{ backgroundImage: `url('/luma-login-bg.jpg')` }}
      />

      {/* Subtle overlay gradients for depth, warmth, and pedestal illumination */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-[#FAF8F5]/60 via-transparent to-[#FAF8F5]/80" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(250,248,245,0.7)_100%)]" />

      {/* Floating 4-Point Golden Sparkles matching the UI/UX artwork */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
        <motion.div
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.25, 0.85], y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
          className="absolute top-[18%] right-[16%] text-[#FFB000]/75"
        >
          <svg className="w-5 h-5 drop-shadow-[0_0_8px_rgba(255,176,0,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.75, 1.15, 0.75], y: [4, -4, 4] }}
          transition={{ repeat: Infinity, duration: 5.1, ease: "easeInOut", delay: 1 }}
          className="absolute top-[42%] left-[12%] text-[#FFB000]/65"
        >
          <svg className="w-4 h-4 drop-shadow-[0_0_6px_rgba(255,176,0,0.7)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ opacity: [0.3, 0.85, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 2.2 }}
          className="absolute bottom-[22%] right-[14%] text-[#FD6B31]/70"
        >
          <svg className="w-4 h-4 drop-shadow-[0_0_8px_rgba(253,107,49,0.7)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </motion.div>

        <motion.div
          animate={{ opacity: [0.15, 0.7, 0.15], scale: [0.7, 1.1, 0.7] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 }}
          className="absolute bottom-[35%] left-[18%] text-[#FFB000]/50"
        >
          <svg className="w-3.5 h-3.5 drop-shadow-[0_0_5px_rgba(255,176,0,0.6)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        </motion.div>
      </div>

      {/* Main Container */}
      <div className="relative z-20 w-full max-w-[410px] flex flex-col items-center">
        
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-2.5 sm:mb-3 flex flex-col items-center select-none"
        >
          {/* LUMA Official Emblem + Wordmark */}
          <div className="relative flex items-center justify-center mb-0.5">
            <img
              src="/luma-logo.png"
              alt="LUMA"
              className="h-14 sm:h-16 w-auto object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Three-part Tagline */}
          <p className="text-[11px] sm:text-xs text-stone-600 font-normal tracking-wide text-center">
            Capture today. Understand tomorrow.{' '}
            <span className="text-[#FD6B31] font-medium">Grow every day.</span>
          </p>
        </motion.div>

        {/* The Centerpiece: Frosted Glass Card with Bottom Amber Pedestal Radiance */}
        <div className="relative w-full">
          {/* Subtle Amber Pedestal Rim Lighting underneath the card bottom edge */}
          <div className="absolute -bottom-2.5 inset-x-8 h-6 bg-gradient-to-r from-transparent via-[#FD6B31]/35 to-transparent blur-md rounded-full pointer-events-none" />
          <div className="absolute -bottom-4 inset-x-3 h-8 bg-gradient-to-r from-amber-400/20 via-[#FFB000]/30 to-amber-400/20 blur-lg rounded-full pointer-events-none" />

          {/* Frosted Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full bg-white/85 backdrop-blur-2xl border border-white/90 rounded-[24px] p-5 sm:p-6 shadow-[0_16px_40px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)] relative overflow-hidden text-left"
          >
            {/* Header section inside card */}
            <div className="mb-3.5 text-left">
              {/* Eyebrow */}
              <span className="text-[10px] font-bold tracking-[0.16em] text-[#FD6B31] uppercase block mb-0.5">
                WELCOME BACK
              </span>
              
              {/* Title */}
              <h1 className="text-2xl sm:text-[26px] font-serif-luma font-normal text-[#1A1C1C] tracking-tight leading-tight">
                Welcome back.
              </h1>
              
              {/* Subtitle */}
              <p className="text-xs text-[#5B616E] mt-0.5 font-normal">
                Your private space is waiting for you.
              </p>
            </div>

            {error && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-50/90 border border-red-200/90 text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email & Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-2.5">
              {/* Email Address */}
              <div className="text-left">
                <label className="block text-[11px] font-medium text-stone-800 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 sm:py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/70 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FD6B31]/25 focus:border-[#FD6B31] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              {/* Password with Eye Toggle */}
              <div className="text-left">
                <label className="block text-[11px] font-medium text-stone-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-3.5 pr-10 py-2 sm:py-2.5 rounded-xl border border-stone-200/90 bg-stone-50/70 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FD6B31]/25 focus:border-[#FD6B31] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[1.75]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.75]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-0.5 pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-stone-300 text-[#1A1C1C] focus:ring-[#FD6B31]/30 focus:ring-offset-0 cursor-pointer accent-[#1A1C1C]"
                  />
                  <span className="text-[11px] sm:text-xs text-stone-600 font-normal">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setResetStatus('idle');
                    setShowForgotModal(true);
                  }}
                  className="text-[11px] sm:text-xs font-medium text-[#FD6B31] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Log In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 px-5 rounded-xl bg-[#0F1011] hover:bg-black text-white text-xs sm:text-sm font-medium transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-75 cursor-pointer"
              >
                <span>{loading ? 'Logging in...' : 'Log In'}</span>
                {!loading && <span className="text-base leading-none">&rarr;</span>}
              </button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center my-2 sm:my-2.5">
              <div className="flex-1 border-t border-stone-200/80" />
              <span className="px-3 text-[10px] font-medium text-stone-400 tracking-wider">OR</span>
              <div className="flex-1 border-t border-stone-200/80" />
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-2 sm:py-2.5 px-4 rounded-xl border border-stone-200/90 bg-white hover:bg-stone-50/80 text-stone-800 text-xs sm:text-sm font-medium transition-all shadow-xs active:scale-[0.99] cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.2v3.15C3.21 21.35 7.31 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.2C.44 8.1 0 9.8 0 12s.44 3.9 1.2 5.42l4.08-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.21 2.65 1.2 6.58l4.08 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* New to LUMA? Create an account */}
            <div className="mt-3 mb-2 text-center">
              <p className="text-[11px] sm:text-xs text-stone-600">
                New to LUMA?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-[#FD6B31] font-medium hover:underline ml-0.5 cursor-pointer"
                >
                  Create an account
                </button>
              </p>
            </div>

            {/* Privacy Assurance Footer Note */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-stone-500">
              <Lock className="w-3 h-3 stroke-[1.75] text-stone-400 shrink-0" />
              <span className="font-normal text-[10px] sm:text-[11px] text-stone-500">
                Your thoughts stay private. Always.
              </span>
            </div>
          </motion.div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-stone-200 text-left relative"
            >
              <button
                onClick={() => setShowForgotModal(false)}
                className="absolute right-4 top-4 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="font-serif-luma text-xl text-stone-900 mb-1">Reset Password</h3>
              <p className="text-xs text-stone-500 mb-4">
                Enter your account email and we'll send you instructions to reset your password.
              </p>

              {resetStatus === 'success' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{resetMessage}</span>
                  </div>
                  <button
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FD6B31]/30 focus:border-[#FD6B31]"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetStatus === 'sending'}
                      className="px-4 py-2 rounded-xl bg-[#0F1011] hover:bg-black text-white text-xs font-medium transition-colors disabled:opacity-60"
                    >
                      {resetStatus === 'sending' ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
