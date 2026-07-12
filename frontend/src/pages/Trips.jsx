import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus, Play, CheckCircle2, Navigation, MapPin } from 'lucide-react';

const STATUS_CFG = {
  Pending:    { cls: 'badge-slate',   dot: 'bg-slate-400',    icon: '⏳' },
  Dispatched: { cls: 'badge-indigo',  dot: 'bg-indigo-500',   icon: '📡' },
  'En Route': { cls: 'badge-cyan',    dot: 'bg-cyan-500',     icon: '🚛' },
  Completed:  { cls: 'badge-emerald', dot: 'bg-emerald-500',  icon: '✅' },
  Cancelled:  { cls: 'badge-rose',    dot: 'bg-rose-500',     icon: '❌' },
};

function TripCard({ trip, canDispatch, onDispatch, onStart, onCancel, onComplete, index }) {
  const s = STATUS_CFG[trip.status] || STATUS_CFG.Pending;
  return (
    <div
      className="glass-premium rounded-2xl p-5 card-3d click-tactile hover-spring"
      style={{ animation: `fade-up 0.6s ${index * 35}ms cubic-bezier(0.23,1,0.32,1) both` }}
    >
      {/* Route header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{s.icon}</span>
            <span className="font-display font-bold text-slate-900 text-sm truncate">
              {trip.source || '—'} → {trip.destination || '—'}
            </span>
          </div>
          <div className="font-mono text-xs text-slate-500">#{trip.id}</div>
        </div>
        <span className={`badge ${s.cls} flex items-center gap-1 flex-shrink-0`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {trip.status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'Vehicle',   value: trip.vehicle?.registrationNumber || `#${trip.vehicleId}` },
          { label: 'Driver',    value: trip.driver?.name || `#${trip.driverId}` },
          { label: 'Cargo',     value: trip.cargoWeight ? `${trip.cargoWeight} kg` : '—' },
          { label: 'Distance',  value: trip.plannedDistance ? `${trip.plannedDistance} km` : '—' },
          { label: 'Start Odo', value: trip.startOdometer ? `${trip.startOdometer.toLocaleString()} km` : '—' },
          { label: 'End Odo',   value: trip.endOdometer ? `${trip.endOdometer.toLocaleString()} km` : '—' },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50/80 rounded-xl px-3 py-2">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-0.5">{s.label}</div>
            <div className="text-sm font-semibold text-slate-700 truncate">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Date */}
      {trip.createdAt && (
        <div className="text-xs text-slate-400 mb-3 font-mono">
          Created {new Date(trip.createdAt).toLocaleDateString()}
        </div>
      )}

      {/* Action buttons */}
      {canDispatch && (
        <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}>
          {trip.status === 'Pending' && (
            <>
              <button onClick={() => onDispatch(trip.id)} className="btn-primary text-xs py-2 flex-1 cursor-pointer">
                <Navigation className="h-3.5 w-3.5" /> Dispatch
              </button>
              <button onClick={() => onCancel(trip.id)} className="btn-danger text-xs py-2 flex-1 cursor-pointer">Cancel</button>
            </>
          )}
          {trip.status === 'Dispatched' && (
            <button onClick={() => onStart(trip.id)} className="btn-primary text-xs py-2 flex-1 cursor-pointer">
              <Play className="h-3.5 w-3.5" /> Start Trip
            </button>
          )}
          {trip.status === 'En Route' && (
            <button onClick={() => onComplete(trip)} className="btn-primary text-xs py-2 flex-1 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Trips() {
  const { user } = useContext(AuthContext);
  const canDispatch = ['FleetManager', 'Driver', 'Dispatcher'].includes(user?.role);

  const [trips, setTrips] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dispatch modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [routeStart, setRouteStart] = useState('');
  const [routeEnd, setRouteEnd] = useState('');
  const [startOdometer, setStartOdometer] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [dispatchError, setDispatchError] = useState('');

  // Complete modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(null);
  const [finalOdometer, setFinalOdometer] = useState('');
  const [completeError, setCompleteError] = useState('');

  const [statusFilter, setStatusFilter] = useState('');

  const fetchTrips = async () => {
    try {
      setLoading(true); setError('');
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get(`/api/trips${params}`);
      setTrips(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const [vd, dd] = await Promise.all([
        api.get('/api/vehicles?status=Available'),
        api.get('/api/drivers?status=Available'),
      ]);
      setAvailableVehicles(vd);
      setAvailableDrivers(dd);
    } catch (err) {
      console.error('Failed to load dispatch resources', err);
    }
  };

  useEffect(() => { fetchTrips(); }, [statusFilter]);

  const openDispatchModal = () => {
    fetchResources();
    setSelectedVehicleId(''); setSelectedDriverId(''); setRouteStart('');
    setRouteEnd(''); setStartOdometer(''); setCargoWeight('');
    setPlannedDistance(''); setDispatchError(''); setShowDispatchModal(true);
  };

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicleId(vehicleId);
    const v = availableVehicles.find(v => v.id === Number(vehicleId));
    setStartOdometer(v ? v.odometer.toString() : '');
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault(); setDispatchError('');
    if (!selectedVehicleId || !selectedDriverId) { setDispatchError('Select a vehicle and driver.'); return; }
    try {
      await api.post('/api/trips', {
        vehicleId: Number(selectedVehicleId), driverId: Number(selectedDriverId),
        source: routeStart.trim(), destination: routeEnd.trim(),
        cargoWeight: Number(cargoWeight), plannedDistance: Number(plannedDistance),
        startOdometer: Number(startOdometer)
      });
      setSuccess('Trip draft created!');
      setShowDispatchModal(false); fetchTrips();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setDispatchError(err.message || 'Failed to create trip');
    }
  };

  const handleDispatchTrip = async (id) => {
    try { await api.put(`/api/trips/${id}/dispatch`); setSuccess('Trip dispatched!'); fetchTrips(); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.message); }
  };
  const handleStartTrip = async (id) => {
    try { await api.put(`/api/trips/${id}/start`); setSuccess('Trip En Route!'); fetchTrips(); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.message); }
  };
  const handleCancelTrip = async (id) => {
    if (!window.confirm('Cancel this trip?')) return;
    try { await api.put(`/api/trips/${id}/cancel`); setSuccess('Trip cancelled.'); fetchTrips(); setTimeout(() => setSuccess(''), 3000); }
    catch (err) { setError(err.message); }
  };

  const openCompleteModal = (trip) => {
    setCompletingTrip(trip); setFinalOdometer(''); setCompleteError(''); setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault(); setCompleteError('');
    const finalOdo = Number(finalOdometer);
    if (finalOdo < completingTrip.startOdometer) {
      setCompleteError(`Final odometer must be ≥ ${completingTrip.startOdometer} km`); return;
    }
    try {
      await api.put(`/api/trips/${completingTrip.id}/complete`, { finalOdometer: finalOdo });
      setSuccess('Trip completed!'); setShowCompleteModal(false); fetchTrips();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setCompleteError(err.message || 'Failed to complete trip');
    }
  };

  const inp = "input-premium text-sm";
  const sel = "select-premium text-sm";

  const statusGroups = ['Pending', 'Dispatched', 'En Route', 'Completed', 'Cancelled'];
  const filteredTrips = trips;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Trips <span className="gradient-text">Dispatch</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Dispatch, track, and complete transport deliveries.</p>
        </div>
        {canDispatch && (
          <button onClick={openDispatchModal} className="btn-primary cursor-pointer">
            <Plus className="h-4 w-4" /> New Trip
          </button>
        )}
      </div>

      {success && <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold fade-in">{success}</div>}
      {error && <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm fade-in">{error}</div>}

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 fade-up-1">
        {['', ...statusGroups].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              statusFilter === s
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                : 'bg-white/80 text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {s || 'All Trips'}
          </button>
        ))}
      </div>

      {/* Trip grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-premium rounded-2xl p-5">
              <div className="skeleton h-4 w-48 mb-2" />
              <div className="skeleton h-3 w-16 mb-4" />
              <div className="grid grid-cols-2 gap-2 mb-3">{[...Array(4)].map((_, j) => <div key={j} className="skeleton h-10 rounded-xl" />)}</div>
            </div>
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="glass-premium rounded-2xl p-12 text-center fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Navigation className="w-8 h-8 text-slate-300" />
          </div>
          <div className="text-slate-600 font-semibold mb-1">No trips found</div>
          <div className="text-slate-400 text-sm">Try a different filter or create a new trip.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip, i) => (
            <TripCard
              key={trip.id} trip={trip} canDispatch={canDispatch} index={i}
              onDispatch={handleDispatchTrip} onStart={handleStartTrip}
              onCancel={handleCancelTrip} onComplete={openCompleteModal}
            />
          ))}
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDispatchModal(false)}>
          <div className="modal-box max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900">Create New Trip</h3>
                <p className="text-slate-500 text-sm mt-0.5">Assign vehicle, driver and route details.</p>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {dispatchError && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">{dispatchError}</div>}
            <form onSubmit={handleDispatchSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Vehicle</label>
                  <select value={selectedVehicleId} onChange={(e) => handleVehicleChange(e.target.value)} className={sel} required>
                    <option value="">Select vehicle...</option>
                    {availableVehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber} – {v.nameModel}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Driver</label>
                  <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className={sel} required>
                    <option value="">Select driver...</option>
                    {availableDrivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Origin</label>
                  <input type="text" required value={routeStart} onChange={(e) => setRouteStart(e.target.value)} className={inp} placeholder="Departure city" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Destination</label>
                  <input type="text" required value={routeEnd} onChange={(e) => setRouteEnd(e.target.value)} className={inp} placeholder="Arrival city" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Start Odometer (km)</label>
                  <input type="number" required value={startOdometer} onChange={(e) => setStartOdometer(e.target.value)} className={inp} placeholder="Auto-filled from vehicle" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Planned Distance (km)</label>
                  <input type="number" required value={plannedDistance} onChange={(e) => setPlannedDistance(e.target.value)} className={inp} placeholder="e.g. 450" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Cargo Weight (kg)</label>
                  <input type="number" required value={cargoWeight} onChange={(e) => setCargoWeight(e.target.value)} className={inp} placeholder="e.g. 800" />
                </div>
              </div>
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}>
                <button type="button" onClick={() => setShowDispatchModal(false)} className="btn-ghost flex-1 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary flex-1 cursor-pointer">Create Trip Draft</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && completingTrip && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCompleteModal(false)}>
          <div className="modal-box max-w-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900">Complete Trip</h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  {completingTrip.source} → {completingTrip.destination}
                </p>
              </div>
              <button onClick={() => setShowCompleteModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs">
              Start odometer: <strong>{completingTrip.startOdometer?.toLocaleString()} km</strong>
            </div>
            {completeError && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">{completeError}</div>}
            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">Final Odometer Reading (km)</label>
                <input type="number" required value={finalOdometer} onChange={(e) => setFinalOdometer(e.target.value)} className={inp} placeholder={`≥ ${completingTrip.startOdometer}`} />
              </div>
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}>
                <button type="button" onClick={() => setShowCompleteModal(false)} className="btn-ghost flex-1 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary flex-1 cursor-pointer" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
