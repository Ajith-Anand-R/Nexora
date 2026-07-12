import React, { useContext, useState, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Home from './pages/Home.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Drivers from './pages/Drivers.jsx';
import Trips from './pages/Trips.jsx';
import Maintenance from './pages/Maintenance.jsx';
import FuelExpenses from './pages/FuelExpenses.jsx';
import Reports from './pages/Reports.jsx';

function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-orb-1" />
      <div className="aurora-orb-2" />
    </div>
  );
}

function LoadingScreen() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return p + Math.floor(Math.random() * 15) + 5;
      });
    }, 120);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)' }}>
      <AuroraBackground />
      <div className="flex flex-col items-center gap-8 fade-in relative z-10">
        {/* Orbital 3D Planetary Loader */}
        <div className="relative w-28 h-28 flex items-center justify-center perspective-container">
          {/* Outer Orbit Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500/80 orbit-ring-1" />
          {/* Middle Orbit Ring */}
          <div className="absolute inset-3 rounded-full border border-dashed border-cyan-500/30 border-r-cyan-500/90 orbit-ring-2" />
          {/* Inner Ring */}
          <div className="absolute inset-6 rounded-full border border-violet-500/20 border-b-violet-500/80 orbit-ring-1" style={{ animationDuration: '2s' }} />
          {/* Central Pulsating Core */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-300/50 flex items-center justify-center pulse-core">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
              <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="font-display font-black text-3xl tracking-tight text-slate-800">
            Nexora<span className="text-indigo-600">.</span>
          </div>
          <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ESTABLISHING SECURE INTERFACE {Math.min(percent, 100)}%
          </div>
          {/* Dynamic loading progress bar */}
          <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mx-auto border border-slate-200/50">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300" style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 fade-up">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <div>
        <div className="text-lg font-display font-bold text-slate-800 text-center mb-1">Access Restricted</div>
        <div className="text-slate-500 text-sm text-center">Your role does not have permission to view Fuel &amp; Expenses.</div>
      </div>
    </div>
  );
}

function MainApp() {
  const { user, loading } = useContext(AuthContext);
  const [path, setPath] = useState(window.location.hash || '#home');

  useEffect(() => {
    const handleHashChange = () => setPath(window.location.hash || '#home');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) return <LoadingScreen />;

  // Unauthenticated routing
  if (!user) {
    if (path === '#login') {
      return <Login />;
    }
    // Default unauthenticated view is Home
    if (path !== '#home') {
      window.location.hash = '#home';
      return null;
    }
    return <Home />;
  }

  // Authenticated routing redirections
  if (path === '#login' || path === '#home') {
    window.location.hash = '#dashboard';
    return null;
  }

  const renderPage = () => {
    switch (path) {
      case '#dashboard':    return <Dashboard />;
      case '#vehicles':     return <Vehicles />;
      case '#drivers':      return <Drivers />;
      case '#trips':        return <Trips />;
      case '#maintenance':  return <Maintenance />;
      case '#fuel-expenses':
        if (user.role === 'SafetyOfficer') return <AccessDenied />;
        return <FuelExpenses />;
      case '#reports':      return <Reports />;
      default:              return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 40%, #eef2ff 100%)' }}>
      <AuroraBackground />
      <Sidebar currentPath={path} />
      <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto w-full">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
