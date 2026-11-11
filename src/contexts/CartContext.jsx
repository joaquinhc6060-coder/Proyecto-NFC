import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProduct } from '../lib/products';

const CART_STORAGE_KEY = 'vigio:cart-v1';
const CartContext = createContext(null);

function readCart() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved
      .filter(item => getProduct(item?.productId))
      .map(item => ({
        productId: item.productId,
        colorId: typeof item.colorId === 'string' ? item.colorId : getProduct(item.productId)?.colors?.[0]?.id || '',
        quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1)),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try { window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)); } catch { /* El carrito sigue disponible durante la visita. */ }
  }, [items]);

  const addItem = ({ productId, colorId, quantity = 1 }) => {
    const product = getProduct(productId);
    if (!product) return;
    const chosenColor = product.colors?.some(color => color.id === colorId) ? colorId : product.colors?.[0]?.id || '';
    const qty = Math.max(1, Math.min(99, Number(quantity) || 1));
    setItems(current => {
      const index = current.findIndex(item => item.productId === productId && item.colorId === chosenColor);
      if (index < 0) return [...current, { productId, colorId: chosenColor, quantity: qty }];
      return current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.min(99, item.quantity + qty) } : item);
    });
  };

  const setQuantity = (productId, colorId, quantity) => {
    const next = Math.max(0, Math.min(99, Number(quantity) || 0));
    setItems(current => next === 0
      ? current.filter(item => item.productId !== productId || item.colorId !== colorId)
      : current.map(item => item.productId === productId && item.colorId === colorId ? { ...item, quantity: next } : item));
  };

  const removeItem = (productId, colorId) => setQuantity(productId, colorId, 0);
  const clearCart = () => setItems([]);

  const details = useMemo(() => items.map(item => ({ ...item, product: getProduct(item.productId) })).filter(item => item.product), [items]);
  const count = details.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = details.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items: details, count, subtotal, addItem, setQuantity, removeItem, clearCart, isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('Falta CartProvider.');
  return value;
}
