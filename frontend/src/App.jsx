import React, { useContext, useState, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Vehicles from './pages/Vehicles.jsx';
import Drivers from './pages/Drivers.jsx';
import Trips from './pages/Trips.jsx';
import Maintenance from './pages/Maintenance.jsx';
import FuelExpenses from './pages/FuelExpenses.jsx';
import Reports from './pages/Reports.jsx';

function MainApp() {
  const { user, loading } = useContext(AuthContext);
  const [path, setPath] = useState(window.location.hash || '#dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      setPath(window.location.hash || '#dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <div>Loading TransitOps...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // If the hash is anything other than login, force it to login
    if (path !== '#login') {
      window.location.hash = '#login';
    }
    return <Login />;
  }

  // If authenticated and tries to hit #login, redirect to dashboard
  if (path === '#login') {
    window.location.hash = '#dashboard';
    return null;
  }

  // Router matching
  const renderPage = () => {
    switch (path) {
      case '#dashboard':
        return <Dashboard />;
      case '#vehicles':
        return <Vehicles />;
      case '#drivers':
        return <Drivers />;
      case '#trips':
        return <Trips />;
      case '#maintenance':
        return <Maintenance />;
      case '#fuel-expenses':
        // Safety officer shouldn't access fuel-expenses
        if (user.role === 'SafetyOfficer') {
          return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <div className="text-rose-400 text-lg font-semibold">Access Denied</div>
              <div className="text-slate-500 text-sm">Your role does not have permission to view Fuel & Expenses.</div>
            </div>
          );
        }
        return <FuelExpenses />;
      case '#reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar currentPath={path} />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {renderPage()}
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
