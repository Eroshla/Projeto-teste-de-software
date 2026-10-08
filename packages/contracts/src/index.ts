export type CouponStatus =
  | 'NONE' | 'APPLIED' | 'NOT_FOUND' | 'INACTIVE' | 'NOT_STARTED' | 'EXPIRED'
  | 'EMPTY_CART' | 'CART_MINIMUM_NOT_MET' | 'COUPON_MINIMUM_NOT_MET' | 'NO_ELIGIBLE_ITEMS';

export interface QuoteItemInput { productId: string; quantity: number; }
export interface QuoteRequest { items: QuoteItemInput[]; couponCode?: string; }
export interface QuoteLine { productId: string; slug: string; name: string; image?: string; unitPriceCents: number; quantity: number; lineSubtotalCents: number; eligible: boolean; }
export interface QuoteResponse {
  currency: 'BRL'; lines: QuoteLine[]; subtotalCents: number; eligibleSubtotalCents: number;
  discountCents: number; totalCents: number; couponCode: string | null; couponStatus: CouponStatus;
  rejectionReason: string | null; amountToMinimumCents: number;
}
