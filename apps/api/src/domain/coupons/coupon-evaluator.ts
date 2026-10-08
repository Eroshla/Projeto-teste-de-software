export type CouponStatus =
  | 'NONE' | 'APPLIED' | 'NOT_FOUND' | 'INACTIVE' | 'NOT_STARTED' | 'EXPIRED'
  | 'EMPTY_CART' | 'CART_MINIMUM_NOT_MET' | 'COUPON_MINIMUM_NOT_MET' | 'NO_ELIGIBLE_ITEMS';

export interface ProductSnapshot { id:string; slug:string; name:string; priceCents:number; isActive:boolean; }
export interface CartItem { product: ProductSnapshot; quantity:number; }
export interface CouponSnapshot {
  code:string; description?:string; percentageBps:number; minimumSubtotalCents:number;
  startsAt:Date; expiresAt:Date; isActive:boolean; includedProductIds?:string[]; excludedProductIds?:string[];
}
export interface EvaluatedLine { productId:string; slug:string; name:string; unitPriceCents:number; quantity:number; lineSubtotalCents:number; eligible:boolean; }
export interface Evaluation {
  lines:EvaluatedLine[]; subtotalCents:number; eligibleSubtotalCents:number; discountCents:number; totalCents:number;
  couponStatus:CouponStatus; couponCode:string|null; rejectionReason:string|null; amountToMinimumCents:number;
}

function roundNonNegativeCents(value:number):number {
  return Math.max(0, Math.round(value));
}
const calculateDiscountCents = (eligibleSubtotalCents:number, percentageBps:number) =>
  Math.min(eligibleSubtotalCents, roundNonNegativeCents(eligibleSubtotalCents * percentageBps / 10000));

export class CouponEvaluator {
  evaluate(items:CartItem[], coupon:CouponSnapshot|null|undefined, now = new Date()): Evaluation {
    const subtotalCents = items.reduce((sum,item) => sum + item.product.priceCents * item.quantity, 0);
    const baseLines = items.map(item => ({
      productId:item.product.id, slug:item.product.slug, name:item.product.name, unitPriceCents:item.product.priceCents,
      quantity:item.quantity, lineSubtotalCents:item.product.priceCents * item.quantity, eligible:false,
    }));
    if (!coupon) return {lines:baseLines, subtotalCents, eligibleSubtotalCents:0, discountCents:0, totalCents:subtotalCents, couponStatus:'NONE', couponCode:null, rejectionReason:null, amountToMinimumCents:0};

    const normalizedCode = coupon.code.trim().toUpperCase();
    const reject = (status:CouponStatus, reason:string, amountToMinimumCents=0):Evaluation => ({
      lines:baseLines, subtotalCents, eligibleSubtotalCents:0, discountCents:0, totalCents:subtotalCents,
      couponStatus:status, couponCode:normalizedCode, rejectionReason:reason, amountToMinimumCents,
    });
    if (!coupon.isActive) return reject('INACTIVE','O cupom está inativo.');
    if (now < coupon.startsAt) return reject('NOT_STARTED','O cupom ainda não começou.');
    if (now >= coupon.expiresAt) return reject('EXPIRED','O cupom está expirado.');
    if (items.length === 0) return reject('EMPTY_CART','Adicione produtos ao carrinho antes de aplicar um cupom.');
    if (subtotalCents < 10000) return reject('CART_MINIMUM_NOT_MET','O subtotal integral precisa ser de pelo menos R$ 100,00.',10000-subtotalCents);
    if (subtotalCents < coupon.minimumSubtotalCents) return reject('COUPON_MINIMUM_NOT_MET',`Este cupom exige subtotal de pelo menos R$ ${(coupon.minimumSubtotalCents/100).toFixed(2).replace('.',',')}.`,coupon.minimumSubtotalCents-subtotalCents);

    const hasInclusion = Boolean(coupon.includedProductIds?.length);
    const included = new Set(coupon.includedProductIds ?? []);
    const excluded = new Set(coupon.excludedProductIds ?? []);
    const lines = baseLines.map(line => ({...line, eligible:hasInclusion ? included.has(line.productId) && !excluded.has(line.productId) : !excluded.has(line.productId)}));
    const eligibleLines = lines.filter(line => line.eligible);
    const eligibleSubtotalCents = eligibleLines.reduce((sum,line) => sum + line.lineSubtotalCents, 0);
    if (eligibleSubtotalCents === 0) return {...reject('NO_ELIGIBLE_ITEMS','Nenhum produto do carrinho é elegível para este cupom.'), lines};
    const discountCents = calculateDiscountCents(eligibleSubtotalCents, coupon.percentageBps);
    return {lines, subtotalCents, eligibleSubtotalCents, discountCents, totalCents:Math.max(0, subtotalCents-discountCents), couponStatus:'APPLIED', couponCode:normalizedCode, rejectionReason:null, amountToMinimumCents:0};
  }
}

export function isProductEligible(productId:string, coupon:Pick<CouponSnapshot,'includedProductIds'|'excludedProductIds'>):boolean {
  const included = coupon.includedProductIds ?? [];
  const excluded = new Set(coupon.excludedProductIds ?? []);
  return (included.length === 0 || included.includes(productId)) && !excluded.has(productId);
}
