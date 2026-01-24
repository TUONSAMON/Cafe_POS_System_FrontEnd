import { useState } from 'react';

export function useNumpad() {
  const [amount, setAmount] = useState('0');

  const tapDigit = (val) => {
    setAmount(prev => {
      if (prev === '0' && val !== '.') return val;
      if (val === '.' && prev.includes('.')) return prev;
      return prev + val;
    });
  };

  const clear = () => setAmount('0');
  
  const backspace = () => {
    setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  return { amount, tapDigit, clear, backspace, numericValue: parseFloat(amount) };
}