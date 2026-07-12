import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import {
  LayoutDashboard,
  Truck,
  UserCheck,
  Compass,
  Wrench,
  Flame,
  BarChart3,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const ROLE_CONFIG = {
  FleetManager:    { label: 'Fleet Manager',    color: 'badge-emerald' },
  Driver:          { label: 'Dispatcher',        color: 'badge-cyan'    },
  SafetyOfficer:   { label: 'Safety Officer',    color: 'badge-amber'   },
  FinancialAnalyst:{ label: 'Financial Analyst', color: 'badge-violet'  },
};

const NAV_ICONS = {
  Dashboard:          LayoutDashboard,
  Vehicles:           Truck,
  Drivers:            UserCheck,
  Trips:              Compass,
  Maintenance:        Wrench,
  'Fuel & Expenses':  Flame,
  'Reports & Analytics': BarChart3,
};

const NAV_COLORS = {
  Dashboard:          'from-indigo-500 to-violet-500',
  Vehicles:           'from-cyan-500 to-sky-500',
  Drivers:            'from-emerald-500 to-teal-500',
  Trips:              'from-blue-500 to-indigo-500',
  Maintenance:        'from-amber-500 to-orange-500',
  'Fuel & Expenses':  'from-rose-500 to-pink-500',
  'Reports & Analytics': 'from-violet-500 to-purple-500',
};

function NavItem({ link, isActive }) {
  const Icon = NAV_ICONS[link.name] || LayoutDashboard;
  const gradColors = NAV_COLORS[link.name] || 'from-indigo-500 to-violet-500';

  return (
    <a
      href={link.hash}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
        isActive
          ? 'nav-active text-indigo-700'
          : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
      }`}
      style={{ textDecoration: 'none' }}
    >
      {/* Icon container with gradient */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        isActive
          ? `bg-gradient-to-br ${gradColors} shadow-glow-sm`
          : 'bg-slate-100 group-hover:bg-slate-200'
      }`}>
        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-600'}`} />
      </div>

      <span className="flex-1 truncate">{link.name}</span>

      {isActive && (
        <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
      )}

      {/* Active glow accent bar */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full" />
      )}
    </a>
  );
}

export default function Sidebar({ currentPath }) {
  const { user, logout } = useContext(AuthContext);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!user) return null;

  const { role } = user;
  const roleConfig = ROLE_CONFIG[role] || { label: role, color: 'badge-slate' };

  const links = [
    { name: 'Dashboard',   hash: '#dashboard'   },
    { name: 'Vehicles',    hash: '#vehicles'     },
    { name: 'Drivers',     hash: '#drivers'      },
    { name: 'Trips',       hash: '#trips'        },
    { name: 'Maintenance', hash: '#maintenance'  },
  ];
  if (role !== 'SafetyOfficer') {
    links.push({ name: 'Fuel & Expenses', hash: '#fuel-expenses' });
  }
  links.push({ name: 'Reports & Analytics', hash: '#reports' });

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
  };

  // Avatar initials
  const initials = user.name
    ? user.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <aside
      className="w-64 flex-shrink-0 h-screen sticky top-0 flex flex-col z-10"
      style={{
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(226, 232, 240, 0.7)',
        boxShadow: '4px 0 24px -4px rgba(99, 102, 241, 0.06), 1px 0 0 rgba(226, 232, 240, 0.5)',
      }}
    >
      {/* ── Brand Logo ─────────────────────────────────── */}
      <div className="p-5 pb-4" style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.6)' }}>
        <div className="flex items-center gap-3">
          {/* 3D Logo Icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 float-card"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 12px -2px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
          <div>
            <h1 className="font-display font-bold text-base leading-tight">
              <span className="gradient-text">Transit</span>
              <span className="text-slate-800">Ops</span>
            </h1>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold font-mono">
              Logistics Portal
            </div>
          </div>
        </div>
      </div>

      {/* ── User Profile ────────────────────────────────── */}
      <div className="p-4" style={{ borderBottom: '1px solid rgba(226, 232, 240, 0.5)' }}>
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              boxShadow: '0 2px 8px -2px rgba(99,102,241,0.35)',
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-slate-800 truncate">{user.name || 'User'}</div>
            <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
          </div>
        </div>
        <div className="mt-2.5">
          <span className={`badge ${roleConfig.color}`}>{roleConfig.label}</span>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 font-mono">
          Navigation
        </div>
        {links.map((link) => {
          const isActive =
            currentPath === link.hash ||
            (currentPath === '' && link.hash === '#dashboard');
          return (
            <NavItem key={link.hash} link={link} isActive={isActive} />
          );
        })}
      </nav>

      {/* ── Logout ──────────────────────────────────────── */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <LogOut className="h-4 w-4" />
          </div>
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
}
