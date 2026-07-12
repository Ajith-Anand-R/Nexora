import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Download, BarChart2, ShieldCheck, DollarSign } from 'lucide-react';

export default function Reports() {
  const { user } = useContext(AuthContext);
  const isSafetyOfficer = user?.role === 'SafetyOfficer';

  const [metrics, setMetrics] = useState(null);
  const [utilization, setUtilization] = useState(null);
  const [roiData, setRoiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportType, setExportType] = useState('vehicles');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashData, utilData, roiDataResponse] = await Promise.all([
        api.get('/api/reports/dashboard'),
        api.get('/api/reports/fleet-utilization'),
        api.get('/api/reports/vehicle-roi')
      ]);
      setMetrics(dashData.metrics);
      setUtilization(utilData);
      setRoiData(roiDataResponse);
    } catch (err) {
      setError(err.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCsvExport = async () => {
    try {
      const csvText = await api.get(`/api/reports/export/csv?type=${exportType}`);
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `TransitOps_${exportType}_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export CSV report');
    }
  };

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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Compliance & Analytics</h2>
          <p className="text-sm text-slate-400">Compliance audit summaries and operational performance analysis.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="vehicles">Export Vehicles CSV</option>
            <option value="drivers">Export Drivers CSV</option>
            <option value="trips">Export Trips CSV</option>
          </select>
          <button
            onClick={handleCsvExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg active:translate-y-[1px] transition-all duration-150"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Total Operating Spend</div>
          <div className="text-2xl font-black text-white mb-1">{formatCurrency(metrics?.totalCost || 0)}</div>
          <div className="text-xs text-slate-500 font-medium">Fuel purchases + Auxiliary expenses</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Fleet Utilization</div>
          <div className="text-2xl font-bold text-blue-400 mb-1">{metrics?.utilization || 0}%</div>
          <div className="text-xs text-slate-500 font-medium">{metrics?.activeVehicles || 0} of {metrics?.totalVehicles || 0} active vehicles</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Active Trips</div>
          <div className="text-2xl font-bold text-indigo-400 mb-1">{metrics?.activeTrips || 0}</div>
          <div className="text-xs text-slate-500 font-medium">Dispatched cargo deliveries</div>
        </div>
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80">
          <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Vehicles In Shop</div>
          <div className="text-2xl font-bold text-amber-500 mb-1">{metrics?.inShopVehicles || 0}</div>
          <div className="text-xs text-slate-500 font-medium">Active repairs or tuning</div>
        </div>
      </div>

      {/* Grid for Vehicle ROI Metrics & Fleet Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle ROI Analysis (2 cols) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-bold text-white">Asset ROI & Profitability Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-950/20 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="p-3">Vehicle</th>
                  <th className="p-3">Odometer</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3">Operating Cost</th>
                  <th className="p-3">Net Profit</th>
                  <th className="p-3 text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30 text-slate-300">
                {roiData.map((v) => (
                  <tr key={v.registrationNumber} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-3">
                      <div className="font-mono font-semibold text-white">{v.registrationNumber}</div>
                      <div className="text-[10px] text-slate-500">{v.nameModel}</div>
                    </td>
                    <td className="p-3">{v.odometer ? `${v.odometer.toLocaleString()} km` : '0 km'}</td>
                    <td className="p-3">{v.distance ? `${v.distance.toLocaleString()} km` : '0 km'}</td>
                    <td className="p-3 text-slate-400">{formatCurrency(v.revenue)}</td>
                    <td className="p-3 text-slate-400">{formatCurrency(v.cost)}</td>
                    <td className={`p-3 font-semibold ${v.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(v.profit)}
                    </td>
                    <td className={`p-3 text-right font-bold ${v.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {v.roi}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regional & Status Distribution (1 col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
          {/* Trips by Region */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <h3 className="text-base font-bold text-white">Trips By Region</h3>
            </div>
            <div className="divide-y divide-slate-800/40 text-xs">
              {utilization?.tripsByRegion.map((region) => (
                <div key={region.region} className="flex justify-between py-2">
                  <span className="text-slate-400 capitalize">{region.region}</span>
                  <span className="font-semibold text-white">{region.count} trips</span>
                </div>
              ))}
              {(!utilization?.tripsByRegion || utilization.tripsByRegion.length === 0) && (
                <div className="text-slate-500 py-2 text-center">No regions logged yet.</div>
              )}
            </div>
          </div>

          {/* Vehicles by Type / Status */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-500" />
              <h3 className="text-base font-bold text-white">Asset Availability</h3>
            </div>
            <div className="divide-y divide-slate-800/40 text-xs">
              {utilization?.vehicles.map((v, i) => (
                <div key={i} className="flex justify-between py-2">
                  <span className="text-slate-400">{v.type} ({v.status})</span>
                  <span className="font-semibold text-white">{v.count} units</span>
                </div>
              ))}
              {(!utilization?.vehicles || utilization.vehicles.length === 0) && (
                <div className="text-slate-500 py-2 text-center">No active vehicles.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
