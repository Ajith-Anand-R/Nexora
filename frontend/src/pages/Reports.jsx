import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import { Download, BarChart2, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

function MetricBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="font-bold text-slate-800">{value}</span>
      </div>
      <div className="progress-track h-2">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Reports() {
  const [metrics, setMetrics] = useState(null);
  const [utilization, setUtilization] = useState(null);
  const [roiData, setRoiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportType, setExportType] = useState('vehicles');

  const fetchReports = async () => {
    try {
      setLoading(true); setError('');
      const [dashData, utilData, roi] = await Promise.all([
        api.get('/api/reports/dashboard'),
        api.get('/api/reports/fleet-utilization'),
        api.get('/api/reports/vehicle-roi')
      ]);
      setMetrics(dashData.metrics);
      setUtilization(utilData);
      setRoiData(roi);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleCsvExport = async () => {
    try {
      const csvText = await api.get(`/api/reports/export/csv?type=${exportType}`);
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Nexora_${exportType}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export CSV');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="fade-up">
          <div className="skeleton h-8 w-64 mb-2" />
          <div className="skeleton h-4 w-80" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-80 rounded-2xl lg:col-span-2" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm">{error}</div>;
  }

  const kpis = [
    { label: 'Total Operating Spend', value: fmt(metrics?.totalCost), sub: 'Fuel + Expenses', icon: '💰', color: 'from-indigo-500 to-violet-500' },
    { label: 'Fleet Utilization', value: `${metrics?.utilization || 0}%`, sub: `${metrics?.activeVehicles || 0} of ${metrics?.totalVehicles || 0} active`, icon: '📊', color: 'from-cyan-500 to-sky-500' },
    { label: 'Active Trips', value: metrics?.activeTrips || 0, sub: 'Dispatched deliveries', icon: '🚛', color: 'from-emerald-500 to-teal-500' },
    { label: 'Vehicles In Shop', value: metrics?.inShopVehicles || 0, sub: 'Under maintenance', icon: '🔧', color: 'from-amber-500 to-orange-500' },
  ];

  const maxRegionCount = Math.max(...(utilization?.tripsByRegion?.map(r => r.count) || [1]));
  const regionColors = ['linear-gradient(90deg, #6366f1, #8b5cf6)', 'linear-gradient(90deg, #06b6d4, #0ea5e9)', 'linear-gradient(90deg, #10b981, #14b8a6)', 'linear-gradient(90deg, #f59e0b, #f97316)'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 fade-up">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Analytics & <span className="gradient-text">Reports</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Operational performance analysis and compliance summaries.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={exportType} onChange={(e) => setExportType(e.target.value)}
            className="select-premium text-sm"
          >
            <option value="vehicles">Vehicles CSV</option>
            <option value="drivers">Drivers CSV</option>
            <option value="trips">Trips CSV</option>
          </select>
          <button onClick={handleCsvExport} className="btn-primary cursor-pointer text-sm">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 fade-up-1">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className="glass-premium rounded-2xl p-5 card-3d click-tactile"
            style={{ animation: `fade-up 0.6s ${i * 60}ms cubic-bezier(0.23,1,0.32,1) both` }}
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center text-xl mb-3`}
              style={{ boxShadow: '0 4px 12px -4px rgba(99,102,241,0.35)' }}
            >
              {k.icon}
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">{k.label}</div>
            <div className="text-2xl font-display font-bold text-slate-900 mb-0.5">{k.value}</div>
            <div className="text-xs text-slate-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROI Table */}
        <div className="glass-premium rounded-2xl overflow-hidden lg:col-span-2 fade-up">
          <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(226,232,240,0.8)' }}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <BarChart2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Asset ROI & Profitability</h3>
              <p className="text-xs text-slate-400">Revenue vs. operating costs per vehicle</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            {roiData.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No ROI data available.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono" style={{ borderBottom: '1px solid rgba(226,232,240,0.8)' }}>
                    <th className="px-5 py-3 text-left">Vehicle</th>
                    <th className="px-5 py-3 text-left">Odometer</th>
                    <th className="px-5 py-3 text-left">Distance</th>
                    <th className="px-5 py-3 text-left">Revenue</th>
                    <th className="px-5 py-3 text-left">Cost</th>
                    <th className="px-5 py-3 text-left">Net Profit</th>
                    <th className="px-5 py-3 text-right">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {roiData.map((v, i) => (
                    <tr
                      key={v.registrationNumber}
                      className="hover:bg-indigo-50/40 transition-colors"
                      style={{ animation: `fade-up 0.5s ${i * 30}ms cubic-bezier(0.23,1,0.32,1) both` }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-indigo-600 text-xs">{v.registrationNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{v.nameModel}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{v.odometer ? `${v.odometer.toLocaleString()} km` : '0 km'}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{v.distance ? `${v.distance.toLocaleString()} km` : '0 km'}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{fmt(v.revenue)}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{fmt(v.cost)}</td>
                      <td className={`px-5 py-3.5 font-bold text-xs ${v.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <div className="flex items-center gap-1">
                          {v.profit >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {fmt(v.profit)}
                        </div>
                      </td>
                      <td className={`px-5 py-3.5 text-right font-bold text-sm ${v.roi >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {v.roi}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-5 fade-up">
          {/* Trips by Region */}
          <div className="glass-premium rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h3 className="font-display font-bold text-slate-900 text-sm">Trips by Region</h3>
              </div>
            </div>
            <div className="space-y-3">
              {utilization?.tripsByRegion?.length ? (
                utilization.tripsByRegion.map((r, i) => (
                  <MetricBar
                    key={r.region}
                    label={r.region}
                    value={`${r.count} trips`}
                    max={maxRegionCount}
                    color={regionColors[i % regionColors.length]}
                  />
                ))
              ) : (
                <div className="text-slate-400 text-sm text-center py-4">No region data yet.</div>
              )}
            </div>
          </div>

          {/* Asset Availability */}
          <div className="glass-premium rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <BarChart2 className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="font-display font-bold text-slate-900 text-sm">Asset Availability</h3>
            </div>
            <div className="space-y-2">
              {utilization?.vehicles?.length ? (
                utilization.vehicles.map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: i < utilization.vehicles.length - 1 ? '1px solid rgba(226,232,240,0.6)' : 'none' }}>
                    <div>
                      <span className="text-xs font-semibold text-slate-700">{v.type}</span>
                      <span className="ml-1.5">
                        <span className={`badge text-[9px] ${
                          v.status === 'Available' ? 'badge-emerald'
                            : v.status === 'On Trip' ? 'badge-cyan'
                            : v.status === 'In Shop' ? 'badge-amber'
                            : 'badge-slate'
                        }`}>{v.status}</span>
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{v.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-sm text-center py-4">No vehicle data.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
