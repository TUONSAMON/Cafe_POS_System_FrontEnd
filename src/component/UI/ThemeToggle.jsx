import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Button from './Button';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
      {isDark ? (
        <Sun className="text-amber-400" size={20} />
      ) : (
        <Moon className="text-slate-600" size={20} />
      )}
    </Button>
  );
}