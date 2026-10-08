'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { api, brl, type Coupon, type Product } from '../../../components/api';
import { useCart } from '../../../components/cart-provider';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { add } = useCart();

  useEffect(() => {
    let active = true;
    setProduct(null);
    setError(null);
    Promise.all([api<Product>(`/products/${slug}`), api<{ coupons: Coupon[] }>(`/products/${slug}/coupons`)]).then(([loadedProduct, loadedCoupons]) => {
      if (!active) return;
      setProduct(loadedProduct);
      setCoupons(loadedCoupons.coupons);
    }).catch(errorValue => {
      if (active) setError(errorValue instanceof Error ? errorValue.message : 'Não foi possível carregar o produto.');
    });
    return () => { active = false; };
  }, [slug]);

  if (error) return <section className="section container"><div className="notice error">{error}</div></section>;
  if (!product) return <section className="section container" data-testid="product-loading">Carregando produto…</section>;

  return (
    <section className="section" data-testid="product-page">
      <div className="container">
        <Link className="muted" href="/products">← Voltar para produtos</Link>
        <div className="cart-layout" style={{ marginTop: 24, alignItems: 'start' }}>
          <div className="card"><img className="product-image" style={{ height: 360 }} src={product.image} alt={product.name} /></div>
          <div>
            <span className="tag">Produto em destaque</span>
            <h1>{product.name}</h1>
            <p className="muted">{product.description}</p>
            <div className="price">{brl(product.priceCents)}</div>
            <label htmlFor="quantity">Quantidade</label>
            <input id="quantity" className="input" style={{ maxWidth: 100, margin: '8px 0 16px' }} type="number" min={1} max={99} value={quantity} onChange={event => setQuantity(Math.max(1, Math.min(99, Number(event.target.value) || 1)))} />
            <br />
            <button className="button button-primary" data-testid={`add-product-${product.slug}`} onClick={() => add(product.id, quantity)}>Adicionar ao carrinho</button>
            <Link className="button button-secondary" style={{ marginLeft: 8 }} href="/cart">Ir para carrinho</Link>
          </div>
        </div>
        <div style={{ marginTop: 45 }}>
          <h2>Cupons para este produto</h2>
          <p className="muted">A aprovação definitiva depende do subtotal integral do carrinho.</p>
          <div className="coupon-grid" style={{ marginTop: 18 }}>
            {coupons.map(coupon => (
              <div className="coupon-card" key={coupon.code} data-testid={`coupon-card-${coupon.code}`}>
                <span className="tag">{coupon.percentageBps / 100}% OFF</span>
                <h3>{coupon.code}</h3>
                <p>{coupon.description}</p>
                <p className="muted">Mínimo do carrinho: {brl(coupon.minimumSubtotalCents)}</p>
                {coupon.compatible ? <div className="notice success">Compatível com este produto.</div> : <div className="notice error">Incompatível: {coupon.incompatibilityReason}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
