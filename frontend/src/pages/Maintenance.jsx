import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus, CheckCircle2, Wrench } from 'lucide-react';

const STATUS_CFG = {
  Active: { cls: 'badge-amber',   dot: 'bg-amber-500',   icon: '🔧' },
  Closed: { cls: 'badge-emerald', dot: 'bg-emerald-500', icon: '✅' },
};

function MaintenanceCard({ log, isManager, onClose, index }) {
  const s = STATUS_CFG[log.status] || STATUS_CFG.Closed;
  const daysActive = log.openedAt
    ? Math.ceil((new Date() - new Date(log.openedAt)) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className="glass rounded-2xl p-5 border border-slate-100 card-3d"
      style={{ animation: `fade-up 0.6s ${index * 35}ms cubic-bezier(0.23,1,0.32,1) both` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '1px solid #fcd34d' }}
          >
            {s.icon}
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 text-sm">
              {log.vehicle?.registrationNumber || `Vehicle #${log.vehicleId}`}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              {log.vehicle?.nameModel || '—'}
            </div>
          </div>
        </div>
        <span className={`badge ${s.cls} flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {log.status}
        </span>
      </div>

      {/* Description */}
      <div className="bg-slate-50/80 rounded-xl px-3 py-2.5 mb-3">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1">Work Description</div>
        <div className="text-sm text-slate-700 leading-relaxed">{log.description || '—'}</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-50/80 rounded-xl px-3 py-2">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-0.5">Cost</div>
          <div className="text-sm font-bold text-indigo-600">${(log.cost || 0).toLocaleString()}</div>
        </div>
        <div className="bg-slate-50/80 rounded-xl px-3 py-2">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-0.5">
            {log.status === 'Active' ? 'Days Active' : 'Duration'}
          </div>
          <div className={`text-sm font-bold ${log.status === 'Active' ? 'text-amber-600' : 'text-slate-700'}`}>
            {log.status === 'Active' && daysActive !== null ? `${daysActive}d` : log.closedAt ? new Date(log.closedAt).toLocaleDateString() : '—'}
          </div>
        </div>
        <div className="bg-slate-50/80 rounded-xl px-3 py-2 col-span-2">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-0.5">Opened</div>
          <div className="text-sm font-semibold text-slate-700">
            {log.openedAt ? new Date(log.openedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
          </div>
        </div>
      </div>

      {/* Action */}
      {isManager && log.status === 'Active' && (
        <button
          onClick={() => onClose(log.id)}
          className="btn-primary w-full text-xs py-2 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Close Maintenance
        </button>
      )}
    </div>
  );
}

export default function Maintenance() {
  const { user } = useContext(AuthContext);
  const isManager = user?.role === 'FleetManager';

  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState('');
  const [addError, setAddError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true); setError('');
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get(`/api/maintenance${params}`);
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const data = await api.get('/api/vehicles?status=Available');
      setVehicles(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchLogs(); }, [statusFilter]);

  const openAddModal = () => {
    fetchVehicles(); setSelectedVehicleId(''); setDescription(''); setCost(''); setAddError(''); setShowAddModal(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault(); setAddError('');
    if (!selectedVehicleId) { setAddError('Please select a vehicle.'); return; }
    try {
      await api.post('/api/maintenance', {
        vehicleId: Number(selectedVehicleId),
        description: description.trim(),
        cost: Number(cost)
      });
      setSuccess('Vehicle sent to shop!');
      setShowAddModal(false); fetchLogs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setAddError(err.message || 'Failed to start maintenance');
    }
  };

  const handleClose = async (id) => {
    try {
      await api.put(`/api/maintenance/${id}/close`);
      setSuccess('Maintenance closed, vehicle returned to Available!');
      fetchLogs(); setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to close maintenance');
    }
  };

  // Summary stats
  const activeLogs = logs.filter(l => l.status === 'Active');
  const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Maintenance <span className="gradient-text">Logs</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Track active repairs, costs, and workshop history.</p>
        </div>
        {isManager && (
          <button onClick={openAddModal} className="btn-primary cursor-pointer">
            <Plus className="h-4 w-4" /> New Log
          </button>
        )}
      </div>

      {success && <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold fade-in">{success}</div>}
      {error && <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm fade-in">{error}</div>}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 fade-up-1">
        {[
          { label: 'Total Logs',    value: logs.length,         icon: '📋', color: 'from-indigo-500 to-violet-500' },
          { label: 'Active',        value: activeLogs.length,   icon: '🔧', color: 'from-amber-500 to-orange-500' },
          { label: 'Total Cost',    value: `$${totalCost.toLocaleString()}`, icon: '💰', color: 'from-emerald-500 to-teal-500' },
        ].map((k) => (
          <div key={k.label} className="glass rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center text-lg flex-shrink-0`}
              style={{ boxShadow: '0 4px 12px -4px rgba(99,102,241,0.3)' }}
            >
              {k.icon}
            </div>
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{k.label}</div>
              <div className="text-xl font-display font-bold text-slate-900">{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {['', 'Active', 'Closed'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              statusFilter === s
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                : 'bg-white/80 text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {s || 'All Logs'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-slate-100">
              <div className="flex gap-3 mb-4"><div className="skeleton w-10 h-10 rounded-xl" /><div className="flex-1"><div className="skeleton h-4 w-32 mb-2" /><div className="skeleton h-3 w-20" /></div></div>
              <div className="skeleton h-16 rounded-xl mb-2" />
              <div className="grid grid-cols-2 gap-2">{[...Array(2)].map((_, j) => <div key={j} className="skeleton h-10 rounded-xl" />)}</div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-slate-100 text-center fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Wrench className="w-8 h-8 text-slate-300" />
          </div>
          <div className="text-slate-600 font-semibold mb-1">No maintenance logs</div>
          <div className="text-slate-400 text-sm">All vehicles are in good shape!</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {logs.map((log, i) => (
            <MaintenanceCard key={log.id} log={log} isManager={isManager} onClose={handleClose} index={i} />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900">Send Vehicle to Shop</h3>
                <p className="text-slate-500 text-sm mt-0.5">Log a new maintenance job.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {addError && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">{addError}</div>}
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Vehicle</label>
                <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className="select-premium text-sm" required>
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber} – {v.nameModel}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Work Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
                  className="input-premium text-sm resize-none" placeholder="e.g. Full brake inspection and pad replacement..." />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Estimated Cost ($)</label>
                <input type="number" required value={cost} onChange={(e) => setCost(e.target.value)} className="input-premium text-sm" placeholder="e.g. 450" />
              </div>
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-ghost flex-1 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary flex-1 cursor-pointer">Log Maintenance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
