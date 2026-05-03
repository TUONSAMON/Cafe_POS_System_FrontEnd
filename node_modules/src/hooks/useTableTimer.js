import { useState, useEffect } from 'react';

export function useTableTimer(startTime) {
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const calculate = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      setMinutes(Math.floor((now - start) / 60000));
    };

    calculate(); // Initial run
    const interval = setInterval(calculate, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  return minutes;
}