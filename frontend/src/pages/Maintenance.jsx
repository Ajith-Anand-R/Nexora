import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus, Play, CheckCircle2 } from 'lucide-react';

export default function Maintenance() {
  const { user } = useContext(AuthContext);
  const isManager = user?.role === 'FleetManager';

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State for New Maintenance
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [addError, setAddError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const data = await api.get(`/api/maintenance?${params.toString()}`);
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableVehicles = async () => {
    try {
      // Show available vehicles only
      const data = await api.get('/api/vehicles?status=Available');
      setVehicles(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const openAddModal = () => {
    fetchAvailableVehicles();
    setSelectedVehicleId('');
    setDescription('');
    setCost('');
    setAddError('');
    setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!selectedVehicleId) {
      setAddError('Please select a vehicle');
      return;
    }

    try {
      await api.post('/api/maintenance', {
        vehicleId: Number(selectedVehicleId),
        description: description.trim(),
        cost: Number(cost)
      });

      setSuccess('Vehicle sent to shop successfully');
      setShowAddModal(false);
      fetchLogs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setAddError(err.message || 'Failed to start maintenance');
    }
  };

  const handleCloseMaintenance = async (id) => {
    try {
      await api.put(`/api/maintenance/${id}/close`);
      setSuccess('Maintenance closed and vehicle returned to Available status');
      fetchLogs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to close maintenance');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'Closed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Maintenance Logs</h2>
          <p className="text-sm text-slate-400">Track active repairs, shop costs, and workshop history.</p>
        </div>
        {isManager && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/10 active:translate-y-[1px] transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Send Vehicle to Shop
          </button>
        )}
      </div>

      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Filter by Shop Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="">All Logs</option>
            <option value="Active">Active</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Maintenance Logs List */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No maintenance records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Log ID</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Repair Cost</th>
                  <th className="p-4">Status</th>
                  {isManager && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-semibold text-white">#{log.id}</td>
                    <td className="p-4 font-semibold text-white">{log.vehicleReg}</td>
                    <td className="p-4 text-xs text-slate-400 max-w-xs truncate" title={log.description}>{log.description}</td>
                    <td className="p-4 font-mono text-xs">{log.startDate ? log.startDate.split(' ')[0] : '—'}</td>
                    <td className="p-4 font-mono text-xs">{log.endDate ? log.endDate.split(' ')[0] : '—'}</td>
                    <td className="p-4 font-semibold">
                      {log.cost !== null ? `$${log.cost.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    {isManager && (
                      <td className="p-4 text-right">
                        {log.status === 'Active' && (
                          <button
                            onClick={() => handleCloseMaintenance(log.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-all"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Close Maintenance
                          </button>
                        )}
                        {log.status === 'Closed' && (
                          <span className="text-xs text-slate-500 font-medium">Logged</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Start Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4">Send Vehicle to Shop</h3>

            {addError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Vehicle (Available Only)
                </label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} - {v.nameModel} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Maintenance / Repair Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Describe parts replacements, oil changes, tire rotations, or body repairs..."
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Estimated Repair Cost ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. 250"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
                >
                  Send to Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
