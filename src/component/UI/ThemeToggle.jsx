import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import translations from '../../translations';
import { useLang } from '../../context/LangContext';
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  const { lang } = useLang();
  const t = (key) => translations[lang]?.ThemeToggle?.[key] || key;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white"
    >
      {isDark ? t('LightMode') : t('DarkMode')}
    </button>
  );
}