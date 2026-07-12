import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { 
  LayoutDashboard, 
  Truck, 
  UserCheck, 
  Compass, 
  Wrench, 
  Flame, 
  BarChart3, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ currentPath }) {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  // Determine which links are visible based on RBAC matrix
  const links = [
    { name: 'Dashboard', hash: '#dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', hash: '#vehicles', icon: Truck },
    { name: 'Drivers', hash: '#drivers', icon: UserCheck },
    { name: 'Trips', hash: '#trips', icon: Compass },
    { name: 'Maintenance', hash: '#maintenance', icon: Wrench }
  ];

  // Safety Officer doesn't have fuel/expense view
  if (role !== 'SafetyOfficer') {
    links.push({ name: 'Fuel & Expenses', hash: '#fuel-expenses', icon: Flame });
  }

  links.push({ name: 'Reports & Analytics', hash: '#reports', icon: BarChart3 });

  // Custom styling for role badge
  const getRoleBadgeClass = () => {
    switch (role) {
      case 'FleetManager':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Driver':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'SafetyOfficer':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'FinancialAnalyst':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getRoleDisplayName = () => {
    switch (role) {
      case 'FleetManager': return 'Fleet Manager';
      case 'Driver': return 'Dispatcher'; // Per design notes, Driver role behaves as Dispatcher
      case 'SafetyOfficer': return 'Safety Officer';
      case 'FinancialAnalyst': return 'Financial Analyst';
      default: return role;
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Header Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
            T
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              TransitOps
            </h1>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Logistics Portal</span>
          </div>
        </div>

        {/* User profile details */}
        <div className="p-5 border-b border-slate-800/50 bg-slate-950/20">
          <div className="text-sm font-medium text-slate-300 truncate">{user.name}</div>
          <div className="text-xs text-slate-500 truncate mb-2">{user.email}</div>
          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${getRoleBadgeClass()}`}>
            {getRoleDisplayName()}
          </span>
        </div>

        {/* Navigation list */}
        <nav className="p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.hash || (currentPath === '' && link.hash === '#dashboard');
            return (
              <a
                key={link.hash}
                href={link.hash}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {link.name}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Logout button footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
