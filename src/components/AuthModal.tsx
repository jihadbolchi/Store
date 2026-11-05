import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import {
  X,
  Mail,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
  } = useStore();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters.');
          setIsLoading(false);
          return;
        }
        const result = await signUpWithEmail(email, password, name);
        if (result.success) {
          setIsAuthModalOpen(false);
        } else {
          setErrorMessage(result.error || 'Failed to create account.');
        }
      } else if (mode === 'signin') {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          setIsAuthModalOpen(false);
        } else {
          setErrorMessage(result.error || 'Invalid email or password.');
        }
      } else if (mode === 'forgot_password') {
        if (!email.trim()) {
          setErrorMessage('Please enter your registered email address.');
          setIsLoading(false);
          return;
        }
        const result = await sendPasswordReset(email);
        if (result.success) {
          setSuccessNotice('A password reset link has been dispatched to your email.');
        } else {
          setErrorMessage(result.message || 'Unable to send password reset link.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-stone-200/90 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setErrorMessage(null);
            setSuccessNotice(null);
          }}
          className="absolute top-5 right-5 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img
              src="/assets/aistudio/IMG-20261105-WA0000_cdc70869.jpg"
              alt="Dhaka Art Nook"
              className="h-12 w-auto object-contain"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading">
            {mode === 'signin' && 'Sign In to Your Account'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'forgot_password' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            {mode === 'signin' && 'Enter your email address and password to sign in.'}
            {mode === 'signup' && 'Join Dhaka Art Nook for express ordering and saved details.'}
            {mode === 'forgot_password' && 'Enter your account email to receive a password reset link.'}
          </p>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
            {successNotice}
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Authentication Form (Email + Password only) */}
        <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="font-bold text-stone-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Asif Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C6E]"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-stone-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C6E]"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-stone-700">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMessage(null);
                      setSuccessNotice(null);
                    }}
                    className="text-[11px] text-[#005C6E] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005C6E]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#005C6E] hover:bg-[#004b5a] active:scale-[0.99] text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            <span>
              {isLoading
                ? 'Processing...'
                : mode === 'signin'
                ? 'Sign In'
                : mode === 'signup'
                ? 'Create Account'
                : 'Send Password Reset Link'}
            </span>
            {mode === 'forgot_password' ? (
              <KeyRound className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>

          {/* Mode Switchers */}
          <div className="text-center pt-2 text-stone-600 text-xs">
            {mode === 'signin' && (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessNotice(null);
                  }}
                  className="font-bold text-[#005C6E] hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </span>
            )}

            {mode === 'signup' && (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessNotice(null);
                  }}
                  className="font-bold text-[#005C6E] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}

            {mode === 'forgot_password' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessNotice(null);
                }}
                className="font-bold text-[#005C6E] hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
