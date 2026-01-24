import React, { useState } from 'react';
import { useLang } from '../context/LangContext';

export default function Tables() {
  const { lang } = useLang();

  // 1. Initialize Table Data with State
  const [tables, setTables] = useState([
    { id: 1, name: 'T-1', status: 'AVAILABLE' },
    { id: 2, name: 'T-2', status: 'OCCUPIED' },
    { id: 3, name: 'T-3', status: 'AVAILABLE' },
    { id: 4, name: 'T-4', status: 'AVAILABLE' },
    { id: 5, name: 'T-5', status: 'AVAILABLE' },
    { id: 6, name: 'T-6', status: 'AVAILABLE' },
  ]);

  // 2. Logic to toggle status
  const toggleTableStatus = (id) => {
    setTables(tables.map(table => {
      if (table.id === id) {
        return {
          ...table,
          status: table.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE'
        };
      }
      return table;
    }));
  };

  // 3. Calculate Statistics
  const totalTables = tables.length;
  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED').length;
  const availableCount = tables.filter(t => t.status === 'AVAILABLE').length;

  return (
    <div className="space-y-8">
      {/* Table Statistics Bar */}
      <div className="flex gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex-1">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">
            {lang === 'en' ? 'Available Tables' : 'តុទំនេរ'}
          </p>
          <h3 className="text-3xl font-black text-emerald-500">{availableCount}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex-1">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">
            {lang === 'en' ? 'Occupied Tables' : 'តុកំពុងប្រើប្រាស់'}
          </p>
          <h3 className="text-3xl font-black text-indigo-500">{occupiedCount}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex-1">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">
            {lang === 'en' ? 'Total' : 'សរុប'}
          </p>
          <h3 className="text-3xl font-black text-white">{totalTables}</h3>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <button
            key={table.id}
            onClick={() => toggleTableStatus(table.id)}
            className={`
              relative h-48 rounded-4xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-2
              ${table.status === 'OCCUPIED' 
                ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-900/20 text-white' 
                : 'bg-slate-900/50 border-slate-800 text-gray-400 hover:border-slate-600 hover:bg-slate-800/50'}
            `}
          >
            <span className="text-4xl font-black tracking-tighter">
              {table.name}
            </span>
            <span className={`text-xs font-bold tracking-[0.2em] uppercase ${table.status === 'OCCUPIED' ? 'text-indigo-200' : 'text-gray-500'}`}>
              {table.status === 'AVAILABLE' 
                ? (lang === 'en' ? 'AVAILABLE' : 'ទំនេរ') 
                : (lang === 'en' ? 'OCCUPIED' : 'មិនទំនេរ')}
            </span>
            
            {/* Small status indicator dot */}
            <div className={`absolute top-6 right-6 w-3 h-3 rounded-full ${table.status === 'OCCUPIED' ? 'bg-white animate-pulse' : 'bg-slate-700'}`} />
          </button>
        ))}
      </div>
    </div>
  );
}