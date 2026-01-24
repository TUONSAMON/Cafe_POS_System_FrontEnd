import React, { useState } from 'react';
import { useLang } from '../context/LangContext';
import { Trash2, Plus, X } from 'lucide-react';

export default function Staff() {
  const { lang } = useLang();
  
  // 1. State for Staff List
  const [staffs, setStaffs] = useState([
    { id: 1, name: 'John Doe', position: 'Manager' },
    { id: 2, name: 'Jane Smith', position: 'Barista' },
    { id: 3, name: 'Emily Johnson', position: 'Cashier' },
  ]);

  // 2. State for Modal and Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
  });

  // 3. Logic to add staff
  const handleAddStaff = (e) => {
    e.preventDefault();
    const newStaff = {
      ...formData,
      id: Date.now(),
    };

    setStaffs([...staffs, newStaff]);
    setIsModalOpen(false);
    setFormData({ name: '', position: '' });
  };

  // 4. Logic to delete staff
  const deleteStaff = (id) => {
    setStaffs(staffs.filter(staff => staff.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black dark:text-white">
          {lang === 'en' ? 'Staff Management' : 'ការគ្រប់គ្រងបុគ្គលិក'}
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all"
        >
          <Plus size={20}/> {lang === 'en' ? 'Add Staff' : 'បន្ថែមបុគ្គលិក'}
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-slate-800/50 text-[14px] uppercase tracking-widest font-black text-gray-400">
            <tr>
              <th className="px-8 py-4">{lang === 'en' ? 'Name' : 'ឈ្មោះ'}</th>
              <th className="px-8 py-4">{lang === 'en' ? 'Position' : 'តំណែង'}</th>
              <th className="px-8 py-4 text-right">{lang === 'en' ? 'Actions' : 'សកម្មភាព'}</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {staffs.map((staff) => (
              <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/20 transition-colors">
                <td className="px-8 py-5 font-bold dark:text-white">{staff.name}</td>
                <td className="px-8 py-5 text-gray-500">{staff.position}</td>
                <td className="px-8 py-5 text-right flex justify-end gap-2">
                  <button 
                    onClick={() => deleteStaff(staff.id)}
                    className="p-2 text-gray-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-4xl shadow-2xl border dark:border-slate-800 overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black dark:text-white">
                  {lang === 'en' ? 'New Staff Member' : 'បុគ្គលិកថ្មី'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Position</label>
                  <select 
                    required
                    className="w-full bg-gray-50 dark:bg-slate-800 border-none rounded-2xl p-4 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                  >
                    <option value="">Select Position</option>
                    <option value="Manager">Manager</option>
                    <option value="Barista">Barista</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Chef">Chef</option>
                  </select>
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all"
                  >
                    Save Staff
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}