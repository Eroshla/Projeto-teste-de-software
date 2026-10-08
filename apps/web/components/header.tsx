'use client';
import Link from 'next/link';
import { useCart } from './cart-provider';
export function Header(){const {items}=useCart();const count=items.reduce((s,i)=>s+i.quantity,0);return <header className="header"><div className="container header-inner"><Link className="logo" href="/">nexo<span>.</span></Link><nav><Link className="nav-link" href="/products">Produtos</Link><Link className="cart-pill" href="/cart" aria-label={`Carrinho com ${count} itens`}>Carrinho ({count})</Link></nav></div></header>}
