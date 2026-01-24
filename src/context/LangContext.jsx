import React, { createContext, useContext, useState } from 'react';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('pos-lang') || 'en');

  const switchLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('pos-lang', newLang);
  };

  return (
    <LangContext.Provider value={{ lang, switchLang }}>
      <div className={lang === 'km' ? 'font-khmer' : 'font-sans'}>
        {children}
      </div>
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);