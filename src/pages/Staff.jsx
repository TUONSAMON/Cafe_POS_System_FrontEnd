import React, { useEffect, useMemo, useState } from 'react';
import { useLang } from '../context/LangContext';
import translations from '../translations/index';
import {
  Trash2,
  Plus,
  X,
  Search,
  Edit2,
  Users,
  Briefcase,
  Phone,
  Mail,
  DollarSign,
  UserCircle2,
  Camera,
  BadgeCheck,
  UserX,
  Wallet
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const STAFF_API = `${API_BASE}/api/staff`;

const POSITION_OPTIONS = ['Manager', 'Barista', 'Cashier', 'Chef', 'Waiter', 'Supervisor'];

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="18" fill="%236b7280">No Image</text></svg>';

export default function Staff() {
  const { lang } = useLang();
  const t = (key) => translations?.[lang]?.staff?.[key] || key;

  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    phone: '',
    email: '',
    salary: '',
    status: 'ACTIVE',
    image: ''
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const url = search.trim()
        ? `${STAFF_API}?search=${encodeURIComponent(search.trim())}`
        : STAFF_API;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch staff');

      const data = await res.json();
      setStaffs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffs([]);
      alert(t('errorFetch'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const resetForm = () => {
    setFormData({
      fullName: '',
      position: '',
      phone: '',
      email: '',
      salary: '',
      status: 'ACTIVE',
      image: ''
    });
    setEditingStaffId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaffId(staff.staffId);
    setFormData({
      fullName: staff.fullName || '',
      position: staff.position || '',
      phone: staff.phone || '',
      email: staff.email || '',
      salary: staff.salary ?? '',
      status: staff.status || 'ACTIVE',
      image: staff.image || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();

    const payload = {
      fullName: formData.fullName,
      position: formData.position,
      phone: formData.phone || null,
      email: formData.email || null,
      salary: formData.salary === '' ? null : Number(formData.salary),
      status: formData.status,
      image: formData.image || null
    };

    try {
      const res = await fetch(
        editingStaffId ? `${STAFF_API}/${editingStaffId}` : STAFF_API,
        {
          method: editingStaffId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) throw new Error('Failed to save staff');

      await fetchStaff();
      setIsModalOpen(false);
      resetForm();
      alert(t('saveSuccess'));
    } catch (error) {
      console.error('Error saving staff:', error);
      alert(t('errorSave'));
    }
  };

  const deleteStaff = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`${STAFF_API}/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete staff');

      await fetchStaff();
      alert(t('deleteSuccess'));
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert(t('errorDelete'));
    }
  };

  const stats = useMemo(() => {
    const active = staffs.filter((s) => String(s.status).toUpperCase() === 'ACTIVE').length;
    const totalSalary = staffs.reduce((sum, s) => sum + Number(s.salary || 0), 0);

    return {
      total: staffs.length,
      active,
      inactive: staffs.length - active,
      totalSalary
    };
  }, [staffs]);

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-4xl p-8 bg-linear-to-r from-slate-900 via-indigo-900 to-cyan-800 text-white shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-cyan-200 text-sm font-semibold tracking-[0.2em] uppercase">
              {t('title')}
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">{t('title')}</h1>
            <p className="mt-3 text-cyan-100 text-lg">{t('subtitle')}</p>
          </div>

          <button
            onClick={openAddModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg"
          >
            <Plus size={20} />
            {t('addStaff')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('total')}</p>
              <h3 className="text-3xl font-black dark:text-white mt-2">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-slate-800">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('activeStaff')}</p>
              <h3 className="text-3xl font-black dark:text-white mt-2">{stats.active}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-slate-800">
              <BadgeCheck className="text-emerald-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('inactiveStaff')}</p>
              <h3 className="text-3xl font-black dark:text-white mt-2">{stats.inactive}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-slate-800">
              <UserX className="text-rose-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{t('monthlyPayroll')}</p>
              <h3 className="text-3xl font-black dark:text-white mt-2">
                ${stats.totalSalary.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-slate-800">
              <Wallet className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-4 shadow-sm">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            className="w-full bg-gray-50 dark:bg-slate-800 rounded-2xl pl-11 pr-4 py-3 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-800/50 text-[14px] uppercase tracking-widest font-black text-gray-400">
            <tr>
              <th className="px-8 py-4">{t('name')}</th>
              <th className="px-8 py-4">{t('position')}</th>
              <th className="px-8 py-4">{t('phone')}</th>
              <th className="px-8 py-4">{t('email')}</th>
              <th className="px-8 py-4">{t('salary')}</th>
              <th className="px-8 py-4">{t('status')}</th>
              <th className="px-8 py-4 text-right">{t('actions')}</th>
            </tr>
          </thead>

          <tbody className="divide-y dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-8 py-10 text-center text-gray-500">
                  {t('loading')}
                </td>
              </tr>
            ) : staffs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-8 py-10 text-center text-gray-500">
                  {t('noStaff')}
                </td>
              </tr>
            ) : (
              staffs.map((staff) => (
                <tr
                  key={staff.staffId}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={staff.image || FALLBACK_IMAGE}
                        alt={staff.fullName}
                        className="w-11 h-11 rounded-2xl object-cover border"
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div className="font-bold dark:text-white">{staff.fullName}</div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-gray-500">{staff.position}</td>
                  <td className="px-8 py-5 text-gray-500">{staff.phone || '-'}</td>
                  <td className="px-8 py-5 text-gray-500">{staff.email || '-'}</td>
                  <td className="px-8 py-5 text-gray-500">
                    {staff.salary != null ? `$${Number(staff.salary).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${String(staff.status).toUpperCase() === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                        }`}
                    >
                      {String(staff.status).toUpperCase() === 'ACTIVE'
                        ? t('active')
                        : t('inactive')}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => deleteStaff(staff.staffId)}
                        className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-4xl shadow-2xl border dark:border-slate-800 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black dark:text-white">
                  {editingStaffId ? t('editStaff') : t('newStaff')}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 dark:bg-slate-800 rounded-3xl p-6 text-center">
                    <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                      {t('profilePreview')}
                    </div>

                    <img
                      src={formData.image || FALLBACK_IMAGE}
                      alt="preview"
                      className="w-36 h-36 rounded-3xl object-cover border mx-auto shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    <div className="mt-4 text-lg font-bold dark:text-white">
                      {formData.fullName || t('noImage')}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formData.position || '-'}
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        {t('staffPhoto')}
                      </label>
                      <div className="relative">
                        <Camera
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="file"
                          accept="image/*"
                          className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl p-4 pl-11 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (!file) return;

                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({ ...formData, image: reader.result });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-black dark:text-white mb-3">{t('basicInfo')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          {t('name')}
                        </label>
                        <input
                          required
                          type="text"
                          className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder={t('name')}
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          {t('position')}
                        </label>
                        <select
                          required
                          className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        >
                          <option value="">{t('position')}</option>
                          {POSITION_OPTIONS.map((position) => (
                            <option key={position} value={position}>
                              {lang === 'km' ? t[position.toLowerCase()] || position : position}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black dark:text-white mb-3">{t('contactInfo')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          {t('phone')}
                        </label>
                        <div className="relative">
                          <Phone
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="text"
                            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-11 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder={t('phone')}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          {t('email')}
                        </label>
                        <div className="relative">
                          <Mail
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="email"
                            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-11 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder={t('email')}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black dark:text-white mb-3">{t('employmentInfo')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          {t('salary')}
                        </label>
                        <div className="relative">
                          <DollarSign
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 pl-11 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0.00"
                            value={formData.salary}
                            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          {t('status')}
                        </label>
                        <select
                          className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="ACTIVE">{t('active')}</option>
                          <option value="INACTIVE">{t('inactive')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all"
                    >
                      {editingStaffId ? t('update') : t('save')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}