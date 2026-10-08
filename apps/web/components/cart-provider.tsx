'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { api, type Quote } from './api';
type CartItem = {productId:string;quantity:number};
type CartContextType = {items:CartItem[];couponCode:string;quote:Quote|null;loading:boolean;error:string|null;setCouponCode:(v:string)=>void;add:(id:string,quantity?:number)=>void;change:(id:string,delta:number)=>void;remove:(id:string)=>void;clearCoupon:()=>void;refresh:()=>void};
const Context = createContext<CartContextType|null>(null);
export function CartProvider({children}:{children:ReactNode}) {
  const [items,setItems] = useState<CartItem[]>([]); const [couponCode,setCouponCodeState] = useState(''); const [quote,setQuote] = useState<Quote|null>(null); const [loading,setLoading] = useState(false); const [error,setError] = useState<string|null>(null); const [hydrated,setHydrated] = useState(false); const latest = useRef(0);
  useEffect(()=>{try{const raw=localStorage.getItem('nexo-cart');if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed.items))setItems(parsed.items);if(typeof parsed.couponCode==='string')setCouponCodeState(parsed.couponCode)}}catch{ /* storage may be unavailable */ } setHydrated(true)},[]);
  useEffect(()=>{if(hydrated)localStorage.setItem('nexo-cart',JSON.stringify({items,couponCode}))},[items,couponCode,hydrated]);
  const refresh = useCallback(()=>{const seq=++latest.current;if(!items.length){setQuote(null);setLoading(false);setError(null);return}setLoading(true);setError(null);api<Quote>('/cart/quote',{method:'POST',body:JSON.stringify({items,couponCode:couponCode.trim()||undefined})}).then(value=>{if(seq===latest.current)setQuote(value)}).catch(e=>{if(seq===latest.current)setError(e.message)}).finally(()=>{if(seq===latest.current)setLoading(false)})},[items,couponCode]);
  useEffect(()=>{if(hydrated)refresh()},[hydrated,items,couponCode,refresh]);
  const add=useCallback((id:string,quantity=1)=>setItems(old=>{const found=old.find(i=>i.productId===id);return found?old.map(i=>i.productId===id?{...i,quantity:Math.min(99,i.quantity+quantity)}:i):[...old,{productId:id,quantity}] }),[]);
  const change=useCallback((id:string,delta:number)=>setItems(old=>old.map(i=>i.productId===id?{...i,quantity:Math.max(0,Math.min(99,i.quantity+delta))}:i).filter(i=>i.quantity>0)),[]);
  const remove=useCallback((id:string)=>setItems(old=>old.filter(i=>i.productId!==id)),[]); const setCouponCode=(v:string)=>setCouponCodeState(v); const clearCoupon=()=>setCouponCodeState('');
  const value=useMemo(()=>({items,couponCode,quote,loading,error,setCouponCode,add,change,remove,clearCoupon,refresh}),[items,couponCode,quote,loading,error,add,change,remove,refresh]); return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useCart(){const value=useContext(Context);if(!value)throw new Error('useCart deve ser usado dentro de CartProvider');return value}
