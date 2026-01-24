import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Check local storage or system preference on first load
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('pos-theme') === 'dark' || 
           (!('pos-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pos-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pos-theme', 'light');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);