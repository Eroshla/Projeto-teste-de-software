'use client';

import Link from 'next/link';
import { brl } from '../../components/api';
import { useCart } from '../../components/cart-provider';

const eligibilityStatuses = new Set(['APPLIED', 'NO_ELIGIBLE_ITEMS']);

export default function CartPage() {
  const {
    items, quote, couponInput, setCouponInput, applyCoupon, clearCoupon,
    loading, error, change, remove,
  } = useCart();
  const showEligibility = Boolean(quote?.couponCode) && Boolean(quote && eligibilityStatuses.has(quote.couponStatus));

  return (
    <section className="section" data-testid="cart-page">
      <div className="container">
        <h1>Seu carrinho</h1>
        {!items.length ? (
          <div className="card" style={{ padding: 28, marginTop: 20 }}>
            <h2>Seu carrinho está vazio</h2>
            <p className="muted">Adicione produtos para simular um orçamento.</p>
            <Link className="button button-primary" href="/products">Continuar comprando</Link>
          </div>
        ) : (
          <div className="cart-layout" style={{ marginTop: 20 }}>
            <div className="card" style={{ padding: '4px 20px 20px' }} data-testid="cart-lines">
              {loading && !quote && <p className="muted" data-testid="quote-loading">Calculando orçamento…</p>}
              {quote?.lines.map(line => (
                <div className="cart-line" key={line.productId} data-testid={`cart-line-${line.slug}`}>
                  <img className="thumb" src={line.image} alt="" />
                  <div>
                    <strong>{line.name}</strong>
                    <div className="muted">
                      {brl(line.unitPriceCents)}
                      {showEligibility && ` · ${line.eligible ? 'Elegível para o cupom' : 'Não elegível para o cupom'}`}
                    </div>
                    <div className="qty">
                      <button aria-label={`Diminuir ${line.name}`} onClick={() => change(line.productId, -1)}>-</button>
                      <span aria-label={`Quantidade de ${line.name}`}>{line.quantity}</span>
                      <button aria-label={`Aumentar ${line.name}`} onClick={() => change(line.productId, 1)}>+</button>
                    </div>
                  </div>
                  <div className="line-actions">
                    <strong>{brl(line.lineSubtotalCents)}</strong><br />
                    <button className="muted" style={{ border: 0, background: 'none', cursor: 'pointer' }} data-testid={`remove-${line.slug}`} onClick={() => remove(line.productId)}>Remover</button>
                  </div>
                </div>
              ))}
            </div>
            <aside className="summary">
              <h2>Resumo</h2>
              <label htmlFor="coupon">Cupom de desconto</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input id="coupon" className="input" value={couponInput} onChange={event => setCouponInput(event.target.value)} placeholder="Ex.: BEMVINDO10" data-testid="coupon-input" />
                <button className="button button-primary" onClick={applyCoupon} disabled={loading} data-testid="apply-coupon">Aplicar cupom</button>
              </div>
              <button className="button button-secondary" style={{ marginTop: 8 }} onClick={clearCoupon} disabled={!couponInput && !quote?.couponCode} data-testid="clear-coupon">Remover cupom</button>
              {loading && <p className="muted" data-testid="quote-loading-summary">Atualizando orçamento…</p>}
              {error && <div className="notice error" style={{ marginTop: 14 }} data-testid="quote-error">{error}</div>}
              {quote && !loading && (
                <>
                  {quote.couponStatus === 'APPLIED' && <div className="notice success" data-testid="coupon-success">Cupom {quote.couponCode} aplicado com sucesso.</div>}
                  {quote.couponCode && quote.couponStatus !== 'APPLIED' && <div className="notice error" data-testid="coupon-error">{quote.rejectionReason}{quote.amountToMinimumCents > 0 && <><br />Faltam {brl(quote.amountToMinimumCents)} para o mínimo.</>}</div>}
                  <div className="summary-line" data-testid="cart-subtotal"><span>Subtotal</span><strong>{brl(quote.subtotalCents)}</strong></div>
                  {showEligibility && <div className="summary-line"><span>Elegível para o cupom</span><strong>{brl(quote.eligibleSubtotalCents)}</strong></div>}
                  <div className="summary-line" data-testid="cart-discount"><span>Desconto</span><strong style={{ color: '#1d7a4b' }}>- {brl(quote.discountCents)}</strong></div>
                  <div className="summary-line summary-total" data-testid="cart-total"><span>Total</span><strong>{brl(quote.totalCents)}</strong></div>
                </>
              )}
              <Link className="button button-secondary" style={{ width: '100%', marginTop: 12 }} href="/products">Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
