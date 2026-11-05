import React, { useState } from 'react';
import { X, Sparkles, User, Mail, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser } = useFashion();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginUser(email, name);
      setEmail('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginUser('alex@elizeefashion.com', 'Alexandre Laurent');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#faf8f5] rounded-3xl p-8 border border-[#ded5c7] shadow-2xl text-[#1c1a17]">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 p-2 rounded-full text-[#7a7165] hover:text-[#1c1a17] hover:bg-[#ede6da] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#22211e] text-[#faf9f6] mb-3 shadow-md">
            <span className="font-serif text-2xl">E</span>
          </div>
          <h3 className="font-serif text-3xl font-semibold tracking-wide text-[#1c1a17]">
            {isSignUp ? 'Join ELIZEE Atelier' : 'Welcome Back'}
          </h3>
          <p className="text-xs text-[#70675a] mt-1.5 max-w-xs mx-auto">
            One-time login experience. Your personal digital wardrobe and AI styling profile stay synchronized across all sessions.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#8a7e70]" />
                <input
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d6ccbd] rounded-xl text-sm text-[#1c1a17] placeholder-[#a89d8f] focus:outline-none focus:ring-2 focus:ring-[#22211e] transition-all"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#8a7e70]" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#d6ccbd] rounded-xl text-sm text-[#1c1a17] placeholder-[#a89d8f] focus:outline-none focus:ring-2 focus:ring-[#22211e] transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#22211e] hover:bg-[#383530] text-[#faf9f6] text-xs uppercase tracking-widest font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <span>{isSignUp ? 'Create My Stylist Account' : 'Sign In Securely'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center">
          <div className="flex-1 border-t border-[#ded5c7]" />
          <span className="px-3 text-[11px] uppercase tracking-wider text-[#8a7e70]">or instant access</span>
          <div className="flex-1 border-t border-[#ded5c7]" />
        </div>

        {/* Demo Account Button */}
        <button
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-[#f0ebe1] hover:bg-[#e6dec\-d] border border-[#d3c7b5] text-[#292521] text-xs font-medium rounded-xl transition-all flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-7 h-7 rounded-full bg-[#3d3830] text-white flex items-center justify-center text-xs font-serif font-bold">
              AL
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight">One-Click Demo Account</p>
              <p className="text-[10px] text-[#786e61]">Preloaded with Wardrobe & Stylist History</p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-[#a07855]" />
        </button>

        {/* Toggle sign in / sign up */}
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
            }}
            className="text-xs text-[#70675a] hover:text-[#1c1a17] transition-colors"
          >
            {isSignUp ? (
              <>
                Already have an account? <span className="font-semibold underline">Sign In</span>
              </>
            ) : (
              <>
                New to ELIZEE? <span className="font-semibold underline">Create Wardrobe Account</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-[#eee7db] flex items-center justify-center gap-2 text-[10px] text-[#8c8273]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#5e7d58]" />
          <span>Zero-friction persistence. Remembers you until logout.</span>
        </div>
      </div>
    </div>
  );
};
