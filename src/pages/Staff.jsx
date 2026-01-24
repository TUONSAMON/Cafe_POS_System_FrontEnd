import React from 'react';
import { useLang } from '../context/LangContext';

export default function Staff() {
  const { lang } = useLang();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold dark:text-white">
        {lang === 'en' ? 'Staff Management' : 'ការគ្រប់គ្រងបុគ្គលិក'}
      </h1>
      <p className="text-slate-500 mt-2">Staff list coming soon...</p>
    </div>
  );
}