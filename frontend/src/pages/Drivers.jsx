import React, { useState, useEffect, useContext } from 'react';
import { api } from '../utils/api.js';
import { AuthContext } from '../context/AuthContext.jsx';
import { Plus, Edit2, ShieldAlert } from 'lucide-react';

export default function Drivers() {
  const { user } = useContext(AuthContext);
  const canEdit = user?.role === 'FleetManager' || user?.role === 'SafetyOfficer';
  const isSafetyOfficer = user?.role === 'SafetyOfficer';

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form Fields
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
      setLoading(true);
      setError('');
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

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter, searchQuery]);

  const openAddModal = () => {
    setModalMode('add');
    setName('');
    setLicense('');
    setLicenseCategory('Class A');
    setLicenseExpiryDate('');
    setPhone('');
    setStatus('Available');
    setSafetyScore('100');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (driver) => {
    setModalMode('edit');
    setEditingId(driver.id);
    setName(driver.name);
    setLicense(driver.licenseNumber);
    setLicenseCategory(driver.licenseCategory || 'Class A');
    setLicenseExpiryDate(driver.licenseExpiryDate ? driver.licenseExpiryDate.split('T')[0] : '');
    setPhone(driver.contactNumber || '');
    setStatus(driver.status);
    setSafetyScore(driver.safetyScore.toString());
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const body = {
      name: name.trim(),
      licenseNumber: license.trim(),
      licenseCategory,
      licenseExpiryDate,
      contactNumber: phone.trim(),
      status,
      safetyScore: Number(safetyScore)
    };

    try {
      if (modalMode === 'add') {
        await api.post('/api/drivers', body);
        setSuccess('Driver registered successfully');
      } else {
        await api.put(`/api/drivers/${editingId}`, body);
        setSuccess('Driver details updated successfully');
      }
      setShowModal(false);
      fetchDrivers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to save driver');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'On Trip':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'Suspended':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Sick':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Drivers Directory</h2>
          <p className="text-sm text-slate-400">View and update driver profiles, availability status, and safety ratings.</p>
        </div>
        {canEdit && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/10 active:translate-y-[1px] transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Add Driver
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
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Search Driver</label>
          <input
            type="text"
            placeholder="Search by name or license number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Filter by Availability</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="Suspended">Suspended</option>
            <option value="Sick">Sick</option>
          </select>
        </div>
      </div>

      {/* Drivers List */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-sm">No drivers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Driver Name</th>
                  <th className="p-4">License Number</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">License Expiry</th>
                  <th className="p-4">Contact Number</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Safety Score</th>
                  {canEdit && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                {drivers.map((d) => {
                  const isExpired = d.licenseExpiryDate ? new Date(d.licenseExpiryDate) < new Date() : false;
                  return (
                    <tr key={d.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="p-4 font-semibold text-white">{d.name}</td>
                      <td className="p-4 font-mono text-xs">{d.licenseNumber}</td>
                      <td className="p-4 font-semibold text-slate-300">{d.licenseCategory || '—'}</td>
                      <td className="p-4">
                        <span className={isExpired ? "text-rose-400 font-bold flex items-center gap-1" : "text-slate-300"}>
                          {isExpired && <ShieldAlert className="h-3.5 w-3.5 inline text-rose-400" />}
                          {d.licenseExpiryDate ? d.licenseExpiryDate.split('T')[0] : '—'}
                        </span>
                      </td>
                      <td className="p-4">{d.contactNumber || d.phoneNumber || '—'}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className={`p-4 font-bold ${getScoreColor(d.safetyScore)}`}>
                        {d.safetyScore}/100
                      </td>
                    {canEdit && (
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openEditModal(d)}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Edit Driver"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-4">
              {modalMode === 'add' ? 'Register New Driver' : 'Edit Driver Details'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSafetyOfficer || modalMode === 'edit'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    License Number
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSafetyOfficer || modalMode === 'edit'}
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    placeholder="e.g. DL-9823423"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSafetyOfficer}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    placeholder="e.g. 555-0199"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={isSafetyOfficer}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="Available">Available</option>
                    <option value="On Trip">On Trip</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Sick">Sick</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    License Category
                  </label>
                  <select
                    value={licenseCategory}
                    onChange={(e) => setLicenseCategory(e.target.value)}
                    disabled={isSafetyOfficer || modalMode === 'edit'}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="Class A">Class A (Combination vehicle)</option>
                    <option value="Class B">Class B (Heavy straight vehicle)</option>
                    <option value="Class C">Class C (Commercial vehicle)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    License Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    disabled={isSafetyOfficer || modalMode === 'edit'}
                    value={licenseExpiryDate}
                    onChange={(e) => setLicenseExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Safety & Compliance</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Safety Score (0 - 100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={safetyScore}
                      onChange={(e) => setSafetyScore(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>

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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
