'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, type Quote } from './api';

type CartItem = { productId: string; quantity: number };

type CartContextType = {
  items: CartItem[];
  couponInput: string;
  appliedCouponCode: string;
  quote: Quote | null;
  loading: boolean;
  error: string | null;
  setCouponInput: (value: string) => void;
  applyCoupon: () => void;
  add: (id: string, quantity?: number) => void;
  change: (id: string, delta: number) => void;
  remove: (id: string) => void;
  clearCoupon: () => void;
  refresh: () => void;
};

const Context = createContext<CartContextType | null>(null);

function normalizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.reduce<CartItem[]>((result, item) => {
    if (!item || typeof item !== 'object') return result;
    const candidate = item as { productId?: unknown; quantity?: unknown };
    const productId = typeof candidate.productId === 'string' ? candidate.productId.trim() : '';
    const quantity = typeof candidate.quantity === 'number' ? candidate.quantity : Number(candidate.quantity);
    if (!productId || productId.length > 100 || !Number.isInteger(quantity) || quantity < 1 || quantity > 99 || seen.has(productId)) return result;
    seen.add(productId);
    result.push({ productId, quantity });
    return result;
  }, []);
}

function normalizeCoupon(value: unknown): string {
  return typeof value === 'string' && value.trim().length <= 64 ? value.trim().toUpperCase() : '';
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponInput, setCouponInputState] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const latest = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('nexo-cart');
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const saved = parsed as { items?: unknown; couponInput?: unknown; appliedCouponCode?: unknown; couponCode?: unknown };
          setItems(normalizeItems(saved.items));
          setCouponInputState(normalizeCoupon(saved.couponInput ?? saved.couponCode));
          setAppliedCouponCode(normalizeCoupon(saved.appliedCouponCode ?? saved.couponCode));
        }
      }
    } catch {
      // Local storage can be unavailable or contain an old invalid value.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('nexo-cart', JSON.stringify({ items, couponInput, appliedCouponCode }));
  }, [items, couponInput, appliedCouponCode, hydrated]);

  const refresh = useCallback(() => {
    const sequence = ++latest.current;
    if (!items.length) {
      setQuote(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setQuote(null);
    api<Quote>('/cart/quote', {
      method: 'POST',
      body: JSON.stringify({ items, couponCode: appliedCouponCode || undefined }),
    })
      .then(value => {
        if (sequence === latest.current) setQuote(value);
      })
      .catch(errorValue => {
        if (sequence === latest.current) setError(errorValue instanceof Error ? errorValue.message : 'Não foi possível calcular o orçamento.');
      })
      .finally(() => {
        if (sequence === latest.current) setLoading(false);
      });
  }, [items, appliedCouponCode]);

  useEffect(() => {
    if (hydrated) refresh();
  }, [hydrated, refresh]);

  const setCouponInput = useCallback((value: string) => setCouponInputState(value.slice(0, 64)), []);

  const applyCoupon = useCallback(() => {
    setAppliedCouponCode(normalizeCoupon(couponInput));
  }, [couponInput]);

  const clearCoupon = useCallback(() => {
    setCouponInputState('');
    setAppliedCouponCode('');
  }, []);

  const add = useCallback((id: string, quantity = 1) => {
    const safeQuantity = Math.max(1, Math.min(99, Math.trunc(quantity)));
    setItems(old => {
      const found = old.find(item => item.productId === id);
      return found
        ? old.map(item => item.productId === id ? { ...item, quantity: Math.min(99, item.quantity + safeQuantity) } : item)
        : [...old, { productId: id, quantity: safeQuantity }];
    });
  }, []);

  const change = useCallback((id: string, delta: number) => {
    setItems(old => old
      .map(item => item.productId === id ? { ...item, quantity: Math.max(0, Math.min(99, item.quantity + Math.trunc(delta))) } : item)
      .filter(item => item.quantity > 0));
  }, []);

  const remove = useCallback((id: string) => setItems(old => old.filter(item => item.productId !== id)), []);

  const value = useMemo(() => ({
    items, couponInput, appliedCouponCode, quote, loading, error,
    setCouponInput, applyCoupon, add, change, remove, clearCoupon, refresh,
  }), [items, couponInput, appliedCouponCode, quote, loading, error, setCouponInput, applyCoupon, add, change, remove, clearCoupon, refresh]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error('useCart deve ser usado dentro de CartProvider');
  return value;
}
