import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Truck, Users, Compass, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.get('/api/reports/dashboard');
      setMetrics(data.metrics);
    } catch (err) {
      setError('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
        {error}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const cards = [
    { name: 'Active Vehicles', value: metrics.activeVehicles, subtitle: `Out of ${metrics.totalVehicles} registered`, icon: Truck, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { name: 'Active Dispatch Trips', value: metrics.activeTrips, subtitle: 'Currently in progress', icon: Compass, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { name: 'Fleet in Maintenance', value: metrics.inShopVehicles, subtitle: 'Vehicles currently in shop', icon: AlertCircle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { name: 'Active Drivers', value: metrics.activeDrivers, subtitle: `Out of ${metrics.totalDrivers} drivers`, icon: Users, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Estimated Expenditures', value: formatCurrency(metrics.totalCost), subtitle: 'Fuel and toll totals', icon: DollarSign, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { name: 'Fleet Utilization', value: `${metrics.utilization}%`, subtitle: 'Active trips vs total fleet', icon: TrendingUp, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Control Dashboard</h2>
        <p className="text-sm text-slate-400">Welcome to the TransitOps management portal. Here is today's operations summary.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.name} className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover-scale">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.name}</span>
                <div className={`p-2 rounded-lg border ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{card.value}</div>
              <div className="text-xs text-slate-500 font-medium">{card.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Fleet Utilization Progress Chart card */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-800/80">
        <h3 className="text-lg font-bold text-white mb-2">Operations Status Summary</h3>
        <p className="text-xs text-slate-500 mb-6">Visual percentage representation of active assets vs available reserve capacity.</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
              <span>Fleet Utilization</span>
              <span>{metrics.utilization}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${metrics.utilization}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 text-center border-t border-slate-800/50">
            <div>
              <div className="text-xl font-bold text-emerald-400">
                {metrics.totalVehicles - metrics.activeVehicles - metrics.inShopVehicles}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Available</div>
            </div>
            <div>
              <div className="text-xl font-bold text-blue-400">
                {metrics.activeVehicles}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">On Road</div>
            </div>
            <div>
              <div className="text-xl font-bold text-amber-400">
                {metrics.inShopVehicles}
              </div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">In Maintenance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
