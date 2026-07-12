import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Redirect happens automatically in AuthContext listener
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20">
          T
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          Transit<span className="text-blue-500">Ops</span>
        </h1>
      </div>

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2 text-center">Welcome Back</h2>
        <p className="text-xs text-slate-500 text-center mb-6">Log in to manage vehicles, drivers, and trips.</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="manager@transitops.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold tracking-wide shadow-lg shadow-blue-600/20 active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick Demo Logins
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <button
              onClick={() => handleDemoLogin('manager@transitops.com', 'manager123')}
              className="p-2 text-left rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="font-semibold text-slate-200">Fleet Manager</div>
              <div className="text-slate-500">manager@transitops.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('dispatcher@transitops.com', 'driver123')}
              className="p-2 text-left rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="font-semibold text-slate-200">Dispatcher (Driver Role)</div>
              <div className="text-slate-500">dispatcher@transitops.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('safety@transitops.com', 'safety123')}
              className="p-2 text-left rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="font-semibold text-slate-200">Safety Officer</div>
              <div className="text-slate-500">safety@transitops.com</div>
            </button>
            <button
              onClick={() => handleDemoLogin('finance@transitops.com', 'finance123')}
              className="p-2 text-left rounded bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-800/40 transition-colors"
            >
              <div className="font-semibold text-slate-200">Financial Analyst</div>
              <div className="text-slate-500">finance@transitops.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
