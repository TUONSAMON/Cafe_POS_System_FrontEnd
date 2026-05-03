import { useMemo, useState } from 'react';

export function useSearch(data, searchKey = 'name') {
  const [query, setQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!query) return data;
    return data.filter(item => {
      const target = typeof item[searchKey] === 'object' 
        ? Object.values(item[searchKey]).join(' ') 
        : item[searchKey];
      
      return target.toLowerCase().includes(query.toLowerCase());
    });
  }, [data, query, searchKey]);

  return { query, setQuery, filteredData };
}