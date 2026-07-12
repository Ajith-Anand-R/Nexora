import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus } from 'lucide-react';

export default function FuelExpenses() {
  const { user } = useContext(AuthContext);
  const canAdd = user?.role === 'FleetManager' || user?.role === 'Driver';

  const [fuelLogs, setFuelLogs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' | 'expenses'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [expenseType, setExpenseType] = useState('fuel'); // 'fuel' | 'expense'
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  
  // Fuel fields
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');

  // Expense fields
  const [category, setCategory] = useState('toll'); // 'toll' | 'other'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const [formError, setFormError] = useState('');

  const canAddFuel = ['FleetManager', 'Driver', 'FinancialAnalyst'].includes(user?.role);
  const canAddExpense = ['FleetManager', 'FinancialAnalyst'].includes(user?.role);
  const canLogAnything = canAddFuel || canAddExpense;

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [fuelLogsData, expensesData] = await Promise.all([
        api.get('/api/fuel-logs'),
        api.get('/api/expenses')
      ]);
      setFuelLogs(fuelLogsData);
      setExpenses(expensesData);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiclesAndTrips = async () => {
    try {
      const [vData, tData] = await Promise.all([
        api.get('/api/vehicles'),
        api.get('/api/trips')
      ]);
      setVehicles(vData.filter(v => v.status !== 'Retired'));
      setTrips(tData);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = (type = 'fuel') => {
    fetchVehiclesAndTrips();
    setExpenseType(type);
    setSelectedVehicleId('');
    setLiters('');
    setFuelCost('');
    setSelectedTripId('');
    setCategory('toll');
    setAmount('');
    setDescription('');
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedVehicleId) {
      setFormError('Please select a vehicle');
      return;
    }

    try {
      if (expenseType === 'fuel') {
        await api.post('/api/fuel-logs', {
          vehicleId: Number(selectedVehicleId),
          tripId: selectedTripId ? Number(selectedTripId) : null,
          liters: Number(liters),
          cost: Number(fuelCost)
        });
        setSuccess('Fuel log registered successfully');
      } else {
        await api.post('/api/expenses', {
          vehicleId: Number(selectedVehicleId),
          category,
          amount: Number(amount),
          description: description.trim()
        });
        setSuccess('Expense logged successfully');
      }

      setShowModal(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to log expenses');
    }
  };

  // Filter trips for selected vehicle
  const vehicleTrips = trips.filter(t => t.vehicleId === Number(selectedVehicleId));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Fuel & Expenses</h2>
          <p className="text-sm text-slate-400">Log refueling events and auxiliary transit expenses.</p>
        </div>
        {canLogAnything && (
          <div className="flex gap-2">
            {canAddFuel && (
              <button
                onClick={() => openAddModal('fuel')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg active:translate-y-[1px] transition-all"
              >
                <Plus className="h-4 w-4" />
                Log Refuel
              </button>
            )}
            {canAddExpense && (
              <button
                onClick={() => openAddModal('expense')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold border border-slate-700 shadow-lg active:translate-y-[1px] transition-all"
              >
                <Plus className="h-4 w-4" />
                Log Expense
              </button>
            )}
          </div>
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

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('fuel')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'fuel' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Refuel Logs
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'expenses' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Other Expenses
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeTab === 'fuel' ? (
          // Fuel Logs Table
          fuelLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No refuel logs registered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Log ID</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Liters Refueled</th>
                    <th className="p-4">Total Cost</th>
                    <th className="p-4">Linked Trip ID</th>
                    <th className="p-4">Date Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                  {fuelLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-semibold text-white">#{log.id}</td>
                      <td className="p-4 font-semibold text-white">{log.vehicleReg}</td>
                      <td className="p-4">{log.liters} L</td>
                      <td className="p-4 text-emerald-400 font-bold">${log.cost.toFixed(2)}</td>
                      <td className="p-4 text-xs font-mono text-slate-400">{log.tripId ? `#${log.tripId}` : '—'}</td>
                      <td className="p-4 font-mono text-xs">{log.date ? log.date.split(' ')[0] : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Expenses Table
          expenses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No expenses logged yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Expense ID</th>
                    <th className="p-4">Vehicle</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Date Logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-semibold text-white">#{exp.id}</td>
                      <td className="p-4 font-semibold text-white">{exp.vehicleReg}</td>
                      <td className="p-4 capitalize">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          exp.category === 'toll' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          exp.category === 'maintenance' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                        }`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 text-emerald-400 font-bold">${exp.amount.toFixed(2)}</td>
                      <td className="p-4 text-xs text-slate-400 max-w-xs truncate">{exp.description}</td>
                      <td className="p-4 font-mono text-xs">{exp.date ? exp.date.split(' ')[0] : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Log Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4">
              {expenseType === 'fuel' ? 'Log Refuel Event' : 'Log auxiliary Expense'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Vehicle
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

              {expenseType === 'fuel' ? (
                // Refuel fields
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Fuel Quantity (Liters)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={liters}
                        onChange={(e) => setLiters(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="e.g. 50"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Fuel Purchase Cost ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={fuelCost}
                        onChange={(e) => setFuelCost(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="e.g. 75.50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Link to Trip (Optional)
                    </label>
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value="">-- Do Not Link --</option>
                      {vehicleTrips.map(t => (
                        <option key={t.id} value={t.id}>
                          Trip #{t.id} ({t.source} → {t.destination}) [Status: {t.status}]
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                // Expense fields
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Expense Category
                      </label>
                      <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="toll">Toll Gate Cost</option>
                        <option value="other">Other Expense</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="e.g. 15.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Expense Description
                    </label>
                    <input
                      type="text"
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="e.g. Toll gate fee I-95"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
