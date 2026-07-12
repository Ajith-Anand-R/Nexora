import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus, Edit2, ShieldAlert, Truck, Search, Filter } from 'lucide-react';

const STATUS_CONFIG = {
  Available:  { cls: 'badge-emerald', dot: 'bg-emerald-500' },
  'On Trip':  { cls: 'badge-cyan',    dot: 'bg-cyan-500'    },
  'In Shop':  { cls: 'badge-amber',   dot: 'bg-amber-500'   },
  Retired:    { cls: 'badge-slate',   dot: 'bg-slate-400'   },
};

const TYPE_ICON = {
  Van:        '🚐',
  Semi:       '🚛',
  'Box Truck':'📦',
};

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">{label}</label>
      {children}
    </div>
  );
}

function VehicleCard({ vehicle, isManager, onEdit, onRetire }) {
  const statusCfg = STATUS_CONFIG[vehicle.status] || STATUS_CONFIG.Retired;
  const icon = TYPE_ICON[vehicle.type] || '🚗';

  return (
    <div className="glass-premium rounded-2xl p-5 card-3d fade-up group hover-spring click-tactile">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl text-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', border: '1px solid #c7d2fe' }}
          >
            {icon}
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 text-sm">{vehicle.nameModel}</div>
            <div className="font-mono text-xs text-indigo-600 font-semibold">{vehicle.registrationNumber}</div>
          </div>
        </div>
        <span className={`badge ${statusCfg.cls} flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {vehicle.status}
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'Type',     value: vehicle.type },
          { label: 'Region',   value: vehicle.region },
          { label: 'Capacity', value: `${vehicle.maxLoadCapacity.toLocaleString()} kg` },
          { label: 'Odometer', value: `${vehicle.odometer.toLocaleString()} km` },
          { label: 'Value',    value: `$${vehicle.acquisitionCost.toLocaleString()}` },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50/80 rounded-xl px-3 py-2">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-0.5">{s.label}</div>
            <div className="text-sm font-semibold text-slate-700 truncate">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {isManager && vehicle.status !== 'Retired' && (
        <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}>
          <button
            onClick={() => onEdit(vehicle)}
            className="btn-ghost flex-1 text-xs py-2 cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </button>
          <button
            onClick={() => onRetire(vehicle.id)}
            className="btn-danger flex-1 text-xs py-2 cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Retire
          </button>
        </div>
      )}
    </div>
  );
}

export default function Vehicles() {
  const { user } = useContext(AuthContext);
  const isManager = user?.role === 'FleetManager';

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [regNum, setRegNum] = useState('');
  const [model, setModel] = useState('');
  const [type, setType] = useState('Van');
  const [capacity, setCapacity] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [region, setRegion] = useState('North');
  const [status, setStatus] = useState('Available');
  const [formError, setFormError] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      if (regionFilter) params.append('region', regionFilter);
      const data = await api.get(`/api/vehicles?${params.toString()}`);
      setVehicles(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, [statusFilter, typeFilter, regionFilter]);

  const openAddModal = () => {
    setModalMode('add'); setRegNum(''); setModel(''); setType('Van');
    setCapacity(''); setOdometer(''); setCost(''); setRegion('North');
    setStatus('Available'); setFormError(''); setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setModalMode('edit'); setEditingId(vehicle.id);
    setRegNum(vehicle.registrationNumber); setModel(vehicle.nameModel);
    setType(vehicle.type); setCapacity(vehicle.maxLoadCapacity);
    setOdometer(vehicle.odometer); setCost(vehicle.acquisitionCost);
    setRegion(vehicle.region); setStatus(vehicle.status);
    setFormError(''); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    const body = {
      registrationNumber: regNum.trim(), nameModel: model.trim(), type,
      maxLoadCapacity: Number(capacity), odometer: Number(odometer),
      acquisitionCost: Number(cost), region, status
    };
    try {
      if (modalMode === 'add') await api.post('/api/vehicles', body);
      else await api.put(`/api/vehicles/${editingId}`, body);
      setSuccess(modalMode === 'add' ? 'Vehicle registered!' : 'Vehicle updated!');
      setShowModal(false);
      fetchVehicles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to save vehicle');
    }
  };

  const handleRetire = async (id) => {
    if (!window.confirm('Permanently retire this vehicle? This cannot be undone.')) return;
    try {
      await api.put(`/api/vehicles/${id}/retire`);
      setSuccess('Vehicle retired.');
      fetchVehicles();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to retire vehicle');
    }
  };

  const inputCls = "input-premium text-sm";
  const selectCls = "select-premium text-sm";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Vehicles <span className="gradient-text">Registry</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">View and manage the active transport fleet.</p>
        </div>
        {isManager && (
          <button onClick={openAddModal} className="btn-primary cursor-pointer">
            <Plus className="h-4 w-4" />
            Add Vehicle
          </button>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold flex items-center gap-2 fade-in">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm font-semibold fade-in">{error}</div>
      )}

      {/* Filter Bar */}
      <div className="glass-premium rounded-2xl p-4 fade-up-1">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="In Shop">In Shop</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectCls}>
              <option value="">All Types</option>
              <option value="Van">Van</option>
              <option value="Semi">Semi</option>
              <option value="Box Truck">Box Truck</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Region</label>
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className={selectCls}>
              <option value="">All Regions</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-premium rounded-2xl p-5">
              <div className="flex gap-3 mb-4">
                <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-32 mb-2" />
                  <div className="skeleton h-3 w-20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[...Array(4)].map((_, j) => <div key={j} className="skeleton h-12 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="glass-premium rounded-2xl p-12 text-center fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Truck className="w-8 h-8 text-slate-300" />
          </div>
          <div className="text-slate-600 font-semibold mb-1">No vehicles found</div>
          <div className="text-slate-400 text-sm">Try adjusting your filters or add a new vehicle.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} isManager={isManager} onEdit={openEditModal} onRetire={handleRetire} />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-display font-bold text-slate-900">
                  {modalMode === 'add' ? 'Register New Vehicle' : 'Edit Vehicle'}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  {modalMode === 'add' ? 'Add a new vehicle to the fleet.' : 'Update vehicle details.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">{formError}</div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Registration No.">
                  <input type="text" required disabled={modalMode === 'edit'} value={regNum} onChange={(e) => setRegNum(e.target.value)} className={`${inputCls} disabled:opacity-50`} placeholder="e.g. Van-05" />
                </FormField>
                <FormField label="Model Name">
                  <input type="text" required value={model} onChange={(e) => setModel(e.target.value)} className={inputCls} placeholder="e.g. Ford Transit 2023" />
                </FormField>
                <FormField label="Vehicle Type">
                  <select value={type} onChange={(e) => setType(e.target.value)} className={selectCls}>
                    <option value="Van">Van</option>
                    <option value="Semi">Semi</option>
                    <option value="Box Truck">Box Truck</option>
                  </select>
                </FormField>
                <FormField label="Max Capacity (kg)">
                  <input type="number" required value={capacity} onChange={(e) => setCapacity(e.target.value)} className={inputCls} placeholder="1500" />
                </FormField>
                <FormField label="Odometer (km)">
                  <input type="number" required value={odometer} onChange={(e) => setOdometer(e.target.value)} className={inputCls} placeholder="12000" />
                </FormField>
                <FormField label="Acquisition Cost ($)">
                  <input type="number" required value={cost} onChange={(e) => setCost(e.target.value)} className={inputCls} placeholder="42000" />
                </FormField>
                <FormField label="Region">
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className={selectCls}>
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                  </select>
                </FormField>
                <FormField label="Status">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={modalMode === 'edit' && status === 'Retired'} className={`${selectCls} disabled:opacity-50`}>
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="In Shop">In Shop</option>
                    <option value="Retired">Retired</option>
                  </select>
                </FormField>
              </div>
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary flex-1 cursor-pointer">
                  {modalMode === 'add' ? 'Register Vehicle' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
