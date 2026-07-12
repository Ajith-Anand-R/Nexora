import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus, Play, CheckCircle2 } from 'lucide-react';

export default function Trips() {
  const { user } = useContext(AuthContext);
  const isDispatcher = user?.role === 'Driver'; // Driver role acts as Dispatcher

  const [trips, setTrips] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dispatch Modal State
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [routeStart, setRouteStart] = useState('');
  const [routeEnd, setRouteEnd] = useState('');
  const [startOdometer, setStartOdometer] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [dispatchError, setDispatchError] = useState('');

  // Completion Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState('');
  const [completeError, setCompleteError] = useState('');

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.get('/api/trips');
      setTrips(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      // Fetch vehicles and drivers to find those available
      const vehiclesData = await api.get('/api/vehicles?status=Available');
      const driversData = await api.get('/api/drivers?status=Available');
      setAvailableVehicles(vehiclesData);
      setAvailableDrivers(driversData);
    } catch (err) {
      console.error('Failed to load dispatch resources', err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const openDispatchModal = () => {
    fetchResources();
    setSelectedVehicleId('');
    setSelectedDriverId('');
    setRouteStart('');
    setRouteEnd('');
    setStartOdometer('');
    setCargoWeight('');
    setPlannedDistance('');
    setDispatchError('');
    setShowDispatchModal(true);
  };

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    const vehicle = availableVehicles.find(v => v.id === Number(vehicleId));
    if (vehicle) {
      setStartOdometer(vehicle.odometer.toString());
    } else {
      setStartOdometer('');
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    setDispatchError('');

    if (!selectedVehicleId || !selectedDriverId) {
      setDispatchError('Please select a vehicle and a driver');
      return;
    }

    try {
      await api.post('/api/trips', {
        vehicleId: Number(selectedVehicleId),
        driverId: Number(selectedDriverId),
        source: routeStart.trim(),
        destination: routeEnd.trim(),
        cargoWeight: Number(cargoWeight),
        plannedDistance: Number(plannedDistance),
        startOdometer: Number(startOdometer)
      });

      setSuccess('Trip draft created successfully');
      setShowDispatchModal(false);
      fetchTrips();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setDispatchError(err.message || 'Failed to create trip draft');
    }
  };

  const handleDispatchTrip = async (id) => {
    try {
      await api.put(`/api/trips/${id}/dispatch`);
      setSuccess('Trip dispatched successfully');
      fetchTrips();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to dispatch trip');
    }
  };

  const handleStartTrip = async (id) => {
    try {
      await api.put(`/api/trips/${id}/start`);
      setSuccess('Trip status updated to En Route');
      fetchTrips();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to start trip');
    }
  };

  const handleCancelTrip = async (id) => {
    try {
      await api.put(`/api/trips/${id}/cancel`);
      setSuccess('Trip cancelled successfully');
      fetchTrips();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel trip');
    }
  };

  const openCompleteModal = (trip) => {
    setCompletingTrip(trip);
    setFinalOdometer('');
    setCompleteError('');
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    setCompleteError('');

    const finalOdoNum = Number(finalOdometer);
    if (finalOdoNum < completingTrip.startOdometer) {
      setCompleteError(`Final odometer cannot be less than starting odometer (${completingTrip.startOdometer} km)`);
      return;
    }

    try {
      await api.put(`/api/trips/${completingTrip.id}/complete`, {
        finalOdometer: finalOdoNum
      });

      setSuccess('Trip marked as Completed successfully');
      setShowCompleteModal(false);
      fetchTrips();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setCompleteError(err.message || 'Failed to complete trip');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Dispatched':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'En Route':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Completed':
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
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Trips Dispatch</h2>
          <p className="text-sm text-slate-400">Dispatch and track active transport deliveries and transit status.</p>
        </div>
        {isDispatcher && (
          <button
            onClick={openDispatchModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/10 active:translate-y-[1px] transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Dispatch Trip
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

      {/* Trips List */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : trips.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No trips dispatched yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">ID</th>
                  <th className="p-4">Vehicle</th>
                  <th className="p-4">Driver</th>
                  <th className="p-4">Route</th>
                  <th className="p-4">Cargo Weight</th>
                  <th className="p-4">Distance (P / A)</th>
                  <th className="p-4">Odometer (S / F)</th>
                  <th className="p-4">Status</th>
                  {isDispatcher && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {trips.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-semibold text-white">{t.id}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{t.vehicleReg}</div>
                      <div className="text-xs text-slate-500">{t.vehicleModel}</div>
                    </td>
                    <td className="p-4">{t.driverName}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-slate-200">{t.source}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-slate-200">{t.destination}</span>
                      </div>
                    </td>
                    <td className="p-4">{t.cargoWeight} kg</td>
                    <td className="p-4">
                      <span className="text-slate-300">{t.plannedDistance} km</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className="text-slate-400">{t.actualDistance ? `${t.actualDistance} km` : '—'}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-slate-300">Start: {t.startOdometer} km</div>
                      {t.finalOdometer && <div className="text-xs text-slate-500">Final: {t.finalOdometer} km</div>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    {isDispatcher && (
                      <td className="p-4 text-right space-x-2">
                        {t.status === 'Draft' && (
                          <button
                            onClick={() => handleDispatchTrip(t.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 text-xs font-semibold transition-all"
                          >
                            Dispatch
                          </button>
                        )}
                        {t.status === 'Dispatched' && (
                          <>
                            <button
                              onClick={() => handleStartTrip(t.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 border border-blue-500/20 text-xs font-semibold transition-all"
                            >
                              <Play className="h-3 w-3" />
                              Start
                            </button>
                            <button
                              onClick={() => handleCancelTrip(t.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {t.status === 'En Route' && (
                          <button
                            onClick={() => openCompleteModal(t)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 text-xs font-semibold transition-all"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Complete
                          </button>
                        )}
                        {(t.status === 'Completed' || t.status === 'Cancelled') && (
                          <span className="text-xs text-slate-500 font-medium">{t.status}</span>
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

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4">Dispatch New Cargo Trip</h3>

            {dispatchError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {dispatchError}
              </div>
            )}

            <form onSubmit={handleDispatchSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Vehicle (Available Only)
                </label>
                <select
                  required
                  value={selectedVehicleId}
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Vehicle --</option>
                  {availableVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} - {v.nameModel} ({v.type}) [Odo: {v.odometer} km]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Driver (Available Only)
                </label>
                <select
                  required
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Choose Driver --</option>
                  {availableDrivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} [Safety: {d.safetyScore}/100]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Start Location
                  </label>
                  <input
                    type="text"
                    required
                    value={routeStart}
                    onChange={(e) => setRouteStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Seattle Depot"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Destination
                  </label>
                  <input
                    type="text"
                    required
                    value={routeEnd}
                    onChange={(e) => setRouteEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Portland Hub"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 5000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Planned Distance (km)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={plannedDistance}
                    onChange={(e) => setPlannedDistance(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="e.g. 350"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Starting Odometer Reading (km)
                </label>
                <input
                  type="number"
                  required
                  value={startOdometer}
                  onChange={(e) => setStartOdometer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Will autofill from vehicle selection"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-2">Complete Trip #{completingTrip?.id}</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter final odometer details to release vehicle <strong>{completingTrip?.vehicleReg}</strong> and driver <strong>{completingTrip?.driverName}</strong>.
            </p>

            {completeError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {completeError}
              </div>
            )}

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Starting Odometer (km)
                </label>
                <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 text-sm">
                  {completingTrip?.startOdometer} km
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Final Odometer Reading (km)
                </label>
                <input
                  type="number"
                  required
                  value={finalOdometer}
                  onChange={(e) => setFinalOdometer(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Must be greater than start"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold"
                >
                  Complete Trip & Release Assets
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
