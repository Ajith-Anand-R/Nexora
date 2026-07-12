import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Truck, Users, Compass, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

function PageHeader({ user }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const name = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="fade-up mb-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{greeting}, {name} 👋</p>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Operations <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold font-mono text-emerald-700 fade-in"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Online
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton w-10 h-10 rounded-xl" />
      </div>
      <div className="skeleton h-8 w-20 mb-2" />
      <div className="skeleton h-3 w-36" />
    </div>
  );
}

const CARD_CONFIG = [
  {
    key: 'activeVehicles',
    name: 'Active Vehicles',
    getSubtitle: (m) => `${m.totalVehicles - m.activeVehicles} available`,
    Icon: Truck,
    gradClass: 'from-cyan-500 to-sky-500',
    textColor: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-100',
    glow: 'rgba(14,165,233,0.2)',
    delay: '0ms',
  },
  {
    key: 'activeTrips',
    name: 'Active Trips',
    getSubtitle: () => 'Currently dispatched',
    Icon: Compass,
    gradClass: 'from-indigo-500 to-violet-500',
    textColor: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-100',
    glow: 'rgba(99,102,241,0.2)',
    delay: '50ms',
  },
  {
    key: 'inShopVehicles',
    name: 'In Maintenance',
    getSubtitle: () => 'Fleet under service',
    Icon: AlertCircle,
    gradClass: 'from-amber-500 to-orange-500',
    textColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100',
    glow: 'rgba(245,158,11,0.2)',
    delay: '100ms',
  },
  {
    key: 'activeDrivers',
    name: 'Active Drivers',
    getSubtitle: (m) => `${m.totalDrivers} drivers total`,
    Icon: Users,
    gradClass: 'from-emerald-500 to-teal-500',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
    glow: 'rgba(16,185,129,0.2)',
    delay: '150ms',
  },
  {
    key: 'totalCost',
    name: 'Est. Expenditures',
    format: (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v),
    getSubtitle: () => 'Fuel & toll totals',
    Icon: DollarSign,
    gradClass: 'from-rose-500 to-pink-500',
    textColor: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-100',
    glow: 'rgba(239,68,68,0.2)',
    delay: '200ms',
  },
  {
    key: 'utilization',
    name: 'Fleet Utilization',
    format: (v) => `${v}%`,
    getSubtitle: () => 'Active vs. total fleet',
    Icon: TrendingUp,
    gradClass: 'from-violet-500 to-purple-500',
    textColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-100',
    glow: 'rgba(139,92,246,0.2)',
    delay: '250ms',
  },
];

function KpiCard({ config, value, subtitle }) {
  const { Icon, name, gradClass, bgColor, borderColor, glow, delay } = config;
  const displayValue = config.format ? config.format(value) : value;

  return (
    <div
      className={`glass rounded-2xl p-6 card-3d border ${borderColor} cursor-pointer`}
      style={{ animationDelay: delay, animation: `fade-up 0.6s ${delay} cubic-bezier(0.23,1,0.32,1) both` }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono leading-tight">{name}</span>
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradClass} flex items-center justify-center flex-shrink-0`}
          style={{ boxShadow: `0 4px 12px -2px ${glow}` }}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="text-3xl font-display font-bold text-slate-900 mb-1 count-up" style={{ animation: 'count-up 0.5s ease both' }}>
        {displayValue}
      </div>
      <div className="text-xs text-slate-500 font-medium">{subtitle}</div>

      {/* Bottom accent line */}
      <div className={`mt-4 h-0.5 w-12 rounded-full bg-gradient-to-r ${gradClass}`} />
    </div>
  );
}

function OperationsPanel({ metrics }) {
  const available = metrics.totalVehicles - metrics.activeVehicles - metrics.inShopVehicles;
  const utilPct = metrics.utilization ?? 0;
  const driverPct = metrics.totalDrivers > 0 ? Math.round((metrics.activeDrivers / metrics.totalDrivers) * 100) : 0;

  return (
    <div className="glass rounded-2xl p-6 fade-up-5 border border-slate-100">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-display font-bold text-slate-900">Operations Overview</h3>
        <span className="badge badge-primary">Live</span>
      </div>
      <p className="text-slate-500 text-xs mb-6">Real-time fleet status and capacity breakdown</p>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Available', value: available, color: 'text-emerald-600', ring: 'from-emerald-500 to-teal-500' },
          { label: 'On Road', value: metrics.activeVehicles, color: 'text-sky-600', ring: 'from-cyan-500 to-sky-500' },
          { label: 'In Shop', value: metrics.inShopVehicles, color: 'text-amber-600', ring: 'from-amber-500 to-orange-500' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            {/* Mini ring indicator */}
            <div className="relative w-16 h-16 mx-auto mb-3">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <circle
                  cx="32" cy="32" r="26"
                  fill="none"
                  stroke={`url(#g-${s.label})`}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.round(163 * (s.value / metrics.totalVehicles))} 163`}
                  style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.23,1,0.32,1)' }}
                />
                <defs>
                  <linearGradient id={`g-${s.label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={s.ring.includes('emerald') ? '#10b981' : s.ring.includes('cyan') ? '#06b6d4' : '#f59e0b'} />
                    <stop offset="100%" stopColor={s.ring.includes('emerald') ? '#059669' : s.ring.includes('cyan') ? '#0ea5e9' : '#d97706'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg font-display font-bold ${s.color}`}>{s.value}</span>
              </div>
            </div>
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider font-mono">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2 font-mono">
            <span>Fleet Utilization</span>
            <span className="text-indigo-600">{utilPct}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${utilPct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2 font-mono">
            <span>Driver Availability</span>
            <span className="text-emerald-600">{driverPct}%</span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${driverPct}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.get('/api/reports/dashboard');
        setMetrics(data.metrics);
      } catch {
        setError('Failed to load dashboard metrics. Please refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="fade-up mb-8">
          <div className="skeleton h-4 w-32 mb-3" />
          <div className="skeleton h-9 w-64 mb-2" />
          <div className="skeleton h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="skeleton h-56 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-up p-5 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-rose-500" />
        </div>
        <div>
          <div className="font-semibold text-rose-700 text-sm">Unable to load data</div>
          <div className="text-rose-500 text-xs mt-0.5">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader user={user} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CARD_CONFIG.map((config) => (
          <KpiCard
            key={config.key}
            config={config}
            value={metrics[config.key]}
            subtitle={config.getSubtitle(metrics)}
          />
        ))}
      </div>

      {/* Operations Overview */}
      <OperationsPanel metrics={metrics} />
    </div>
  );
}
