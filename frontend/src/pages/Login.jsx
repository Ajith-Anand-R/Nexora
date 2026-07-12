import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

const DEMO_ACCOUNTS = [
  {
    role: 'Fleet Manager',
    email: 'manager@transitops.com',
    password: 'manager123',
    icon: '🚛',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
    text: 'text-emerald-700',
  },
  {
    role: 'Dispatcher',
    email: 'dispatcher@transitops.com',
    password: 'driver123',
    icon: '📡',
    color: 'from-cyan-500 to-sky-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100',
    text: 'text-cyan-700',
  },
  {
    role: 'Safety Officer',
    email: 'safety@transitops.com',
    password: 'safety123',
    icon: '🛡️',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    text: 'text-amber-700',
  },
  {
    role: 'Financial Analyst',
    email: 'finance@transitops.com',
    password: 'finance123',
    icon: '📊',
    color: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    border: 'border-violet-100',
    text: 'text-violet-700',
  },
];

const STATS = [
  { label: 'Active Vehicles', value: '120+' },
  { label: 'Daily Trips',     value: '450+' },
  { label: 'Fleet Uptime',    value: '99.2%' },
];

function FeaturePill({ icon, text, delay = 0 }) {
  return (
    <div
      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium border border-white/25 fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(null);

  // Consume prefilled demo credentials from landing page
  React.useEffect(() => {
    const prefilledEmail = sessionStorage.getItem('prefilled_email');
    const prefilledPassword = sessionStorage.getItem('prefilled_password');
    const prefilledRole = sessionStorage.getItem('prefilled_role');
    if (prefilledEmail && prefilledPassword) {
      setEmail(prefilledEmail);
      setPassword(prefilledPassword);
      setSelectedDemo(prefilledRole);
      sessionStorage.removeItem('prefilled_email');
      sessionStorage.removeItem('prefilled_password');
      sessionStorage.removeItem('prefilled_role');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = (account) => {
    setSelectedDemo(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#f8fafc' }}>
      {/* ── Left Panel: Immersive 3D Visual ─────────────── */}
      <div
        className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center p-12 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 40%, #0891b2 100%)',
        }}
      >
        {/* Background mesh orbs */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', animation: 'orb-float-1 14s ease-in-out infinite' }} />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)', animation: 'orb-float-2 18s ease-in-out infinite' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.5) 0%, transparent 70%)', animation: 'orb-float-3 22s ease-in-out infinite' }} />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Glassmorphic Volumetric 3D Cube */}
          <div className="perspective-container flex justify-center items-center h-40 mb-6">
            <div className="building-3d scale-[1.3] relative" style={{
              '--size': '45px',
              '--height': '80px',
              '--top-color': 'linear-gradient(135deg, #ffffff, #c7d2fe)',
              '--left-color': 'rgba(255,255,255,0.25)',
              '--right-color': 'rgba(255,255,255,0.12)',
              transform: 'rotateX(54.7deg) rotateZ(-45deg) translateZ(0px)',
              transformStyle: 'preserve-3d',
              animation: 'card-float 6s ease-in-out infinite'
            }}>
              <div className="building-face building-left" style={{ border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.15)' }} />
              <div className="building-face building-right" style={{ border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.08)' }} />
              <div className="building-face building-top flex items-center justify-center text-[10px] font-bold text-indigo-700 font-mono" style={{ border: '1.5px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.85)' }}>
                NX
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-display font-black text-white mb-4 tracking-tight fade-up">
            Nexora
          </h1>
          <p className="text-white/70 text-lg font-medium mb-12 max-w-sm mx-auto fade-up-1">
            Enterprise fleet operations powered by real-time intelligence
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <FeaturePill icon="🚚" text="Fleet Tracking" delay={200} />
            <FeaturePill icon="⚡" text="Real-time Data" delay={300} />
            <FeaturePill icon="📊" text="Analytics" delay={400} />
            <FeaturePill icon="🔒" text="Role-based Access" delay={500} />
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 fade-up-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4 text-center"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <div className="text-2xl font-display font-bold text-white">{s.value}</div>
                <div className="text-white/60 text-xs font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ──────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        {/* Mobile brand */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl grad-primary flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <span className="font-display font-black text-xl gradient-text">Nexora</span>
        </div>

        <div className="w-full max-w-md p-8 rounded-3xl glass-premium fade-up">
          {/* Form Header */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">Welcome back</h2>
              <p className="text-slate-500 text-xs">Sign in to your logistics dashboard</p>
            </div>
            <button
              onClick={() => window.location.hash = '#home'}
              className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/35 px-2.5 py-1.5 rounded-xl click-tactile"
            >
              ← Back to Home
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 fade-in">
              <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-rose-700 text-xs font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium py-2 text-sm"
                placeholder="you@nexora.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-premium pr-10 py-2 text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 click-tactile flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Demo Logins */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-slate-200/80" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Quick Demo</span>
              <div className="flex-1 h-px bg-slate-200/80" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoSelect(acc)}
                  className={`group text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer click-tactile ${acc.bg} ${acc.border} hover:shadow-premium ${selectedDemo === acc.role ? 'ring-2 ring-indigo-400 border-transparent shadow-glow-sm bg-indigo-50/50' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-6.5 h-6.5 rounded-lg bg-gradient-to-br ${acc.color} flex items-center justify-center shadow-sm`}>
                      <span className="text-xs">{acc.icon}</span>
                    </div>
                    <span className={`text-[10px] font-black ${acc.text} font-mono`}>{acc.role}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate font-mono">{acc.email}</div>
                  {selectedDemo === acc.role && (
                    <div className="text-[9px] text-indigo-600 font-bold mt-1">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            {selectedDemo && (
              <p className="text-center text-[10px] font-medium text-slate-400 mt-3 fade-in">
                Credentials filled — click <strong>Sign In</strong> to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
