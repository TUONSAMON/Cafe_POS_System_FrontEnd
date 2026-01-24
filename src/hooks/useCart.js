import { useState, useMemo } from 'react';

export function useCart() {
  const [items, setItems] = useState([]);

  const addToCart = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id, delta) => {
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const tax = subtotal * 0.1; // 10% VAT
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }, [items]);

  return { items, addToCart, removeFromCart, updateQty, totals, clearCart: () => setItems([]) };
}