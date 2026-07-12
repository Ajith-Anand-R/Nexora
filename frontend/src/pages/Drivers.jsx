import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus, Edit2, ShieldAlert, UserCheck } from 'lucide-react';

const STATUS_CFG = {
  Available:  { cls: 'badge-emerald', dot: 'bg-emerald-500' },
  'On Trip':  { cls: 'badge-cyan',    dot: 'bg-cyan-500'    },
  Suspended:  { cls: 'badge-rose',    dot: 'bg-rose-500'    },
  Sick:       { cls: 'badge-amber',   dot: 'bg-amber-500'   },
};

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-cyan-500 to-sky-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-violet-500 to-purple-500',
];

function getScoreConfig(score) {
  if (score >= 90) return { color: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Excellent' };
  if (score >= 75) return { color: 'text-amber-600',   bg: 'bg-amber-500',   label: 'Good' };
  return           { color: 'text-rose-600',    bg: 'bg-rose-500',    label: 'Review Needed' };
}

function DriverCard({ driver, canEdit, index, onEdit }) {
  const statusCfg = STATUS_CFG[driver.status] || STATUS_CFG.Available;
  const scoreCfg = getScoreConfig(driver.safetyScore);
  const isExpired = driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate) < new Date() : false;
  const initials = driver.name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || '??';
  const grad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

  const expiryDaysLeft = driver.licenseExpiryDate
    ? Math.ceil((new Date(driver.licenseExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className="glass rounded-2xl p-5 border border-slate-100 card-3d"
      style={{ animation: `fade-up 0.6s ${index * 40}ms cubic-bezier(0.23,1,0.32,1) both` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0`}
          style={{ boxShadow: '0 4px 12px -4px rgba(99,102,241,0.35)' }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-slate-900 truncate">{driver.name}</div>
          <div className="font-mono text-xs text-slate-500 mt-0.5">{driver.licenseNumber}</div>
        </div>
        <span className={`badge ${statusCfg.cls} flex items-center gap-1`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {driver.status}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-slate-50/80 rounded-xl px-3 py-2">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-0.5">Category</div>
          <div className="text-sm font-semibold text-slate-700">{driver.licenseCategory || '—'}</div>
        </div>
        <div className="bg-slate-50/80 rounded-xl px-3 py-2">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-0.5">Phone</div>
          <div className="text-sm font-semibold text-slate-700 truncate">{driver.contactNumber || driver.phoneNumber || '—'}</div>
        </div>
        <div className={`rounded-xl px-3 py-2 col-span-2 ${isExpired ? 'bg-rose-50' : 'bg-slate-50/80'}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-0.5">License Expiry</div>
              <div className={`text-sm font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>
                {driver.licenseExpiryDate ? driver.licenseExpiryDate.split('T')[0] : '—'}
              </div>
            </div>
            {expiryDaysLeft !== null && (
              <span className={`text-xs font-bold ${isExpired ? 'text-rose-600' : expiryDaysLeft < 30 ? 'text-amber-600' : 'text-slate-400'}`}>
                {isExpired ? '⚠ Expired' : `${expiryDaysLeft}d left`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Safety Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Safety Score</span>
          <span className={`text-xs font-bold ${scoreCfg.color}`}>{driver.safetyScore}/100 · {scoreCfg.label}</span>
        </div>
        <div className="progress-track h-2">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${driver.safetyScore}%`,
              background: driver.safetyScore >= 90
                ? 'linear-gradient(90deg, #10b981, #059669)'
                : driver.safetyScore >= 75
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #ef4444, #dc2626)',
              transitionDuration: '1s',
            }}
          />
        </div>
      </div>

      {/* Edit */}
      {canEdit && (
        <button
          onClick={() => onEdit(driver)}
          className="btn-ghost w-full text-xs py-2 cursor-pointer"
          style={{ borderTop: '1px solid rgba(226,232,240,0.8)', paddingTop: '12px', marginTop: '4px', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        >
          <Edit2 className="h-3.5 w-3.5" />
          Edit Driver
        </button>
      )}
    </div>
  );
}

export default function Drivers() {
  const { user } = useContext(AuthContext);
  const canEdit = user?.role === 'FleetManager' || user?.role === 'SafetyOfficer';
  const isSafetyOfficer = user?.role === 'SafetyOfficer';

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [licenseCategory, setLicenseCategory] = useState('Class A');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('Available');
  const [safetyScore, setSafetyScore] = useState('100');
  const [formError, setFormError] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true); setError('');
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      const data = await api.get(`/api/drivers?${params.toString()}`);
      setDrivers(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, [statusFilter, searchQuery]);

  const openAddModal = () => {
    setModalMode('add'); setName(''); setLicense(''); setLicenseCategory('Class A');
    setLicenseExpiryDate(''); setPhone(''); setStatus('Available'); setSafetyScore('100');
    setFormError(''); setShowModal(true);
  };

  const openEditModal = (d) => {
    setModalMode('edit'); setEditingId(d.id); setName(d.name);
    setLicense(d.licenseNumber); setLicenseCategory(d.licenseCategory || 'Class A');
    setLicenseExpiryDate(d.licenseExpiryDate ? d.licenseExpiryDate.split('T')[0] : '');
    setPhone(d.contactNumber || ''); setStatus(d.status);
    setSafetyScore(d.safetyScore.toString()); setFormError(''); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setFormError('');
    const body = {
      name: name.trim(), licenseNumber: license.trim(), licenseCategory,
      licenseExpiryDate, contactNumber: phone.trim(), status, safetyScore: Number(safetyScore)
    };
    try {
      if (modalMode === 'add') await api.post('/api/drivers', body);
      else await api.put(`/api/drivers/${editingId}`, body);
      setSuccess(modalMode === 'add' ? 'Driver registered!' : 'Driver updated!');
      setShowModal(false); fetchDrivers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to save driver');
    }
  };

  const inp = "input-premium text-sm";
  const sel = "select-premium text-sm";
  const FL = ({ label, children }) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 font-mono">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 fade-up">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Drivers <span className="gradient-text">Directory</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">Manage driver profiles, availability, and safety ratings.</p>
        </div>
        {canEdit && (
          <button onClick={openAddModal} className="btn-primary cursor-pointer">
            <Plus className="h-4 w-4" /> Add Driver
          </button>
        )}
      </div>

      {success && <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-semibold fade-in">{success}</div>}
      {error && <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm fade-in">{error}</div>}

      {/* Filters */}
      <div className="glass rounded-2xl p-4 border border-slate-100 fade-up-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Search Driver</label>
            <div className="relative">
              <input type="text" placeholder="Name or license number..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} className={`${inp} pl-9`} />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-mono">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={sel}>
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Suspended">Suspended</option>
              <option value="Sick">Sick</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-slate-100">
              <div className="flex gap-3 mb-4"><div className="skeleton w-12 h-12 rounded-xl" /><div className="flex-1"><div className="skeleton h-4 w-32 mb-2" /><div className="skeleton h-3 w-24" /></div></div>
              <div className="grid grid-cols-2 gap-2 mb-3">{[...Array(4)].map((_, j) => <div key={j} className="skeleton h-10 rounded-xl" />)}</div>
              <div className="skeleton h-2 rounded-full" />
            </div>
          ))}
        </div>
      ) : drivers.length === 0 ? (
        <div className="glass rounded-2xl p-12 border border-slate-100 text-center fade-up">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-50 flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-slate-300" />
          </div>
          <div className="text-slate-600 font-semibold mb-1">No drivers found</div>
          <div className="text-slate-400 text-sm">Try adjusting your search or filters.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drivers.map((d, i) => (
            <DriverCard key={d.id} driver={d} canEdit={canEdit} index={i} onEdit={openEditModal} />
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
                  {modalMode === 'add' ? 'Register New Driver' : 'Edit Driver Details'}
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  {modalMode === 'add' ? 'Add a driver to the directory.' : 'Update driver information.'}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {formError && <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium">{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FL label="Driver Name">
                  <input type="text" required disabled={isSafetyOfficer || modalMode === 'edit'} value={name} onChange={(e) => setName(e.target.value)} className={`${inp} disabled:opacity-50`} placeholder="John Doe" />
                </FL>
                <FL label="License Number">
                  <input type="text" required disabled={isSafetyOfficer || modalMode === 'edit'} value={license} onChange={(e) => setLicense(e.target.value)} className={`${inp} disabled:opacity-50`} placeholder="DL-9823423" />
                </FL>
                <FL label="Contact Number">
                  <input type="text" required disabled={isSafetyOfficer} value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inp} disabled:opacity-50`} placeholder="555-0199" />
                </FL>
                <FL label="Status">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isSafetyOfficer} className={`${sel} disabled:opacity-50`}>
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Sick">Sick</option>
                  </select>
                </FL>
                <FL label="License Category">
                  <select value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)} disabled={isSafetyOfficer || modalMode === 'edit'} className={`${sel} disabled:opacity-50`}>
                    <option value="Class A">Class A</option>
                    <option value="Class B">Class B</option>
                    <option value="Class C">Class C</option>
                  </select>
                </FL>
                <FL label="Expiry Date">
                  <input type="date" required disabled={isSafetyOfficer || modalMode === 'edit'} value={licenseExpiryDate} onChange={(e) => setLicenseExpiryDate(e.target.value)} className={`${inp} disabled:opacity-50`} />
                </FL>
              </div>
              <FL label={`Safety Score (0-100) — currently ${safetyScore}`}>
                <input type="number" min="0" max="100" required value={safetyScore} onChange={(e) => setSafetyScore(e.target.value)} className={inp} />
              </FL>
              <div className="flex gap-3 pt-4" style={{ borderTop: '1px solid rgba(226,232,240,0.8)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost flex-1 cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary flex-1 cursor-pointer">
                  {modalMode === 'add' ? 'Register Driver' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
