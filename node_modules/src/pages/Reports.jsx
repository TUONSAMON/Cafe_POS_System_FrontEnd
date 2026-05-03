import React from 'react';
export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 h-64 flex items-end justify-between gap-2">
          {[40, 70, 45, 90, 65, 85, 30].map((h, i) => (
            <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-indigo-500 rounded-t-lg" />
          ))}
        </div>
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 h-64 flex items-center justify-center">
           <div className="w-32 h-32 rounded-full border-16 border-indigo-500 border-t-slate-200" />
        </div>
      </div>
    </div>
  );
}