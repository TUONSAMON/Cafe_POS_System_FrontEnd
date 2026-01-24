import React from 'react';
import { useLang } from '../context/LangContext';
export default function TableMap() {
  const { lang } = useLang();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6].map(t => (
        <div key={t} className={`h-40 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 ${t === 2 ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 dark:text-white'}`}>
          <span className="text-3xl font-black">T-{t}</span>
          <span className="text-xs uppercase font-bold opacity-60">{t === 2 ? 'Occupied' : 'Available'}</span>
        </div>
      ))}
    </div>
  );
}