import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus, Fuel, Receipt } from 'lucide-react';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="glass-premium rounded-2xl p-4 flex items-center gap-4 click-tactile hover-spring">
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg flex-shrink-0`}
        style={{ boxShadow: '0 4px 12px -4px rgba(99,102,241,0.3)' }}
      >
        {icon}
      </div>
      <div>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">{label}</div>
        <div className="text-xl font-display font-bold text-slate-900">{value}</div>
      </div>
    </div>
  );
}

function LogRow({ log, type, index }) {
  return (
    <tr
      className="hover:bg-indigo-50/40 transition-colors"
      style={{ animation: `fade-up 0.5s ${index * 25}ms cubic-bezier(0.23,1,0.32,1) both` }}
    >
      {type === 'fuel' ? (
        <>
          <td className="px-5 py-3.5">
            <span className="font-mono text-xs font-semibold text-indigo-600">
              {log.vehicle?.registrationNumber || `#${log.vehicleId}`}
            </span>
          </td>
          <td className="px-5 py-3.5 font-semibold text-slate-700">{log.liters} L</td>
          <td className="px-5 py-3.5 font-bold text-emerald-600">${(log.cost || 0).toLocaleString()}</td>
          <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">
            {log.trip ? `Trip #${log.tripId}` : '—'}
          </td>
          <td className="px-5 py-3.5 text-slate-400 text-xs">
            {log.loggedAt ? new Date(log.loggedAt).toLocaleDateString() : log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '—'}
          </td>
        </>
      ) : (
        <>
          <td className="px-5 py-3.5">
            <span className="font-mono text-xs font-semibold text-indigo-600">
              {log.vehicle?.registrationNumber || `#${log.vehicleId}`}
            </span>
          </td>
          <td className="px-5 py-3.5">
            <span className="badge badge-indigo text-[10px]">{log.category}</span>
          </td>
          <td className="px-5 py-3.5 font-bold text-emerald-600">${(log.amount || 0).toLocaleString()}</td>
          <td className="px-5 py-3.5 text-slate-500 text-sm max-w-xs truncate">{log.description || '—'}</td>
          <td className="px-5 py-3.5 text-slate-400 text-xs">
            {log.loggedAt ? new Date(log.loggedAt).toLocaleDateString() : log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '—'}
          </td>
        </>
      )}
    </tr>
  );
}

export default function FuelExpenses() {
  const { user } = useContext(AuthContext);
  const canAddFuel = ['FleetManager', 'Driver', 'FinancialAnalyst'].includes(user?.role);
  const canAddExpense = ['FleetManager', 'FinancialAnalyst'].includes(user?.role);
  const canLogAnything = canAddFuel || canAddExpense;

  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('fuel');

  const [showModal, setShowModal] = useState(false);
  const [expenseType, setExpenseType] = useState('fuel');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');
  const [category, setCategory] = useState('toll');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true); setError('');
      const [fl, ex] = await Promise.all([api.get('/api/fuel-logs'), api.get('/api/expenses')]);
      setFuelLogs(fl); setExpenses(ex);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const [vd, td] = await Promise.all([api.get('/api/vehicles'), api.get('/api/trips')]);
      setVehicles(vd.filter(v => v.status !== 'Retired')); setTrips(td);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddModal = (type = 'fuel') => {
    fetchResources(); setExpenseType(type); setSelectedVehicleId('');
    setLiters(''); setFuelCost(''); setSelectedTripId('');
    setCategory('toll'); setAmount(''); setDescription('');
    setFormError(''); setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('');
    if (!selectedVehicleId) { setFormError('Please select a vehicle.'); return; }
    try {
      if (expenseType === 'fuel') {
        await api.post('/api/fuel-logs', {
          vehicleId: Number(selectedVehicleId),
          tripId: selectedTripId ? Number(selectedTripId) : null,
          liters: Number(liters), cost: Number(fuelCost)
        });
        setSuccess('Fuel log registered!');
      } else {
        await api.post('/api/expenses', {
          vehicleId: Number(selectedVehicleId),
          category, amount: Number(amount), description: description.trim()
        });
        setSuccess('Expense logged!');
      }
      setShowModal(false); fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to log');
    }
  };

  const vehicleTrips = trips.filter(t => t.vehicleId === Number(selectedVehicleId));
  const totalFuelCost = fuelLogs.reduce((s, l) => s + (l.cost || 0), 0);
  const totalFuelLiters = fuelLogs.reduce((s, l) => s + (l.liters || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  const inp = "input-premium text-sm";
  const sel = "select-premium text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Fuel & <span className="gradient-text">Expenses</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Log refueling events and auxiliary transit expenses.</p>
        </div>
        {canLogAnything && (
          <div className="flex gap-2 flex-wrap">
            {canAddFuel && (
              <button onClick={() => openAddModal('fuel')} className="btn-primary cursor-pointer text-sm">
                <Plus className="h-4 w-4" /> Log Refuel
              </button>
            )}
            {canAddExpense && (
              <button onClick={() => openAddModal('expense')} className="btn-ghost cursor-pointer text-sm">
                <Plus className="h-4 w-4" /> Log Expense
              </button>
            )}
          </div>
        )}
      </div>

      {success && <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold fade-in">{success}</div>}
      {error && <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm fade-in">{error}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 fade-up-1">
        <StatCard icon="⛽" label="Total Fuel Cost" value={`$${totalFuelCost.toLocaleString()}`} color="from-indigo-500 to-violet-500" />
        <StatCard icon="💧" label="Total Liters" value={`${totalFuelLiters.toFixed(0)} L`} color="from-cyan-500 to-sky-500" />
        <StatCard icon="💸" label="Other Expenses" value={`$${totalExpenses.toLocaleString()}`} color="from-rose-500 to-pink-500" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { key: 'fuel', label: 'Refuel Logs', icon: '⛽' },
          { key: 'expenses', label: 'Other Expenses', icon: '💸' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === t.key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-premium rounded-2xl overflow-hidden fade-up">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeTab === 'fuel' ? (
              fuelLogs.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No fuel logs recorded.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="px-5 py-3 text-left">Vehicle</th>
                      <th className="px-5 py-3 text-left">Liters</th>
                      <th className="px-5 py-3 text-left">Cost</th>
                      <th className="px-5 py-3 text-left">Trip</th>
                      <th className="px-5 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {fuelLogs.map((log, i) => <LogRow key={log.id} log={log} type="fuel" index={i} />)}
                  </tbody>
                </table>
              )
            ) : (
              expenses.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-sm">No expenses logged.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="px-5 py-3 text-left">Vehicle</th>
                      <th className="px-5 py-3 text-left">Category</th>
                      <th className="px-5 py-3 text-left">Amount</th>
                      <th className="px-5 py-3 text-left">Description</th>
                      <th className="px-5 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expenses.map((log, i) => <LogRow key={log.id} log={log} type="expense" index={i} />)}
                  </tbody>
                </table>
              )
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900">
                  {expenseType === 'fuel' ? 'Log Refueling' : 'Log Expense'}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  {expenseType === 'fuel' ? 'Record a fuel top-up event.' : 'Record an auxiliary expense.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {formError && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">{formError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Vehicle</label>
                <select value={selectedVehicleId} onChange={(e) => setSelectedVehicleId(e.target.value)} className={sel} required>
                  <option value="">Select vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber} – {v.nameModel}</option>)}
                </select>
              </div>

              {expenseType === 'fuel' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Liters</label>
                      <input type="number" step="0.1" required value={liters} onChange={(e) => setLiters(e.target.value)} className={inp} placeholder="e.g. 60.5" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Cost ($)</label>
                      <input type="number" step="0.01" required value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} className={inp} placeholder="e.g. 120.00" />
                    </div>
                  </div>
                  {vehicleTrips.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Trip (optional)</label>
                      <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className={sel}>
                        <option value="">No associated trip</option>
                        {vehicleTrips.map(t => <option key={t.id} value={t.id}>#{t.id} – {t.source} → {t.destination}</option>)}
                      </select>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className={sel}>
                      <option value="toll">Toll</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Amount ($)</label>
                    <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className={inp} placeholder="e.g. 45.00" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Description</label>
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inp} placeholder="e.g. Highway toll at exit 42" />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary flex-1 cursor-pointer">
                  {expenseType === 'fuel' ? '⛽ Log Fuel' : '💸 Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
