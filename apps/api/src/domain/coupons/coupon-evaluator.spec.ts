import { CouponEvaluator, CouponSnapshot, ProductSnapshot, isProductEligible } from './coupon-evaluator';

const product = (id:string, slug=id, priceCents=12000):ProductSnapshot => ({id,slug,name:slug,priceCents,isActive:true});
const validCoupon = (overrides:Partial<CouponSnapshot> = {}):CouponSnapshot => ({code:'TEST10',percentageBps:1000,minimumSubtotalCents:10000,startsAt:new Date('2020-01-01T00:00:00Z'),expiresAt:new Date('2099-01-01T00:00:00Z'),isActive:true,...overrides});
const now = new Date('2026-10-07T12:00:00Z');
const evalr = new CouponEvaluator();

describe('CouponEvaluator', () => {
  test.each([[9999,'CART_MINIMUM_NOT_MET'],[10000,'APPLIED'],[10001,'APPLIED']] as const)('global boundary %i', (subtotal,status) => {
    const result = evalr.evaluate([{product:product('p','p',subtotal),quantity:1}],validCoupon(),now);
    expect(result.couponStatus).toBe(status);
  });
  test.each([[19999,'COUPON_MINIMUM_NOT_MET'],[20000,'APPLIED'],[20001,'APPLIED']] as const)('specific boundary %i', (subtotal,status) => {
    const result = evalr.evaluate([{product:product('p','p',subtotal),quantity:1}],validCoupon({minimumSubtotalCents:20000}),now);
    expect(result.couponStatus).toBe(status);
  });
  it('excludes products and discounts only eligible subtotal', () => {
    const result = evalr.evaluate([{product:product('h','headset',12000),quantity:1},{product:product('g','gift',6000),quantity:1}],validCoupon({excludedProductIds:['g']}),now);
    expect(result.eligibleSubtotalCents).toBe(12000); expect(result.discountCents).toBe(1200); expect(result.totalCents).toBe(16800);
    expect(result.lines[0]).toMatchObject({lineDiscountCents:1200,lineTotalCents:10800});
    expect(result.lines[1]).toMatchObject({eligible:false,lineDiscountCents:0,lineTotalCents:6000});
  });
  it('supports inclusion and exclusion precedence', () => {
    const result = evalr.evaluate([{product:product('a','a',10000),quantity:1},{product:product('b','b',10000),quantity:1}],validCoupon({includedProductIds:['a','b'],excludedProductIds:['b']}),now);
    expect(result.eligibleSubtotalCents).toBe(10000);
  });
  it('returns no eligible items', () => { expect(evalr.evaluate([{product:product('g','gift',12000),quantity:1}],validCoupon({excludedProductIds:['g']}),now).couponStatus).toBe('NO_ELIGIBLE_ITEMS'); });
  it.each([
    ['expired',{expiresAt:new Date('2026-01-01T00:00:00Z')},'EXPIRED'],['inactive',{isActive:false},'INACTIVE'],['not started',{startsAt:new Date('2030-01-01T00:00:00Z')},'NOT_STARTED'],
  ])('%s', (_label,overrides,status) => expect(evalr.evaluate([{product:product('p'),quantity:1}],validCoupon(overrides),now).couponStatus).toBe(status));
  it('rounds once in cents', () => { const result = evalr.evaluate([{product:product('p','p',10005),quantity:1}],validCoupon(),now); expect(result.discountCents).toBe(1001); });
  it('allocates the exact discount between eligible lines', () => {
    const result = evalr.evaluate([{product:product('a','a',5001),quantity:1},{product:product('b','b',5000),quantity:1}],validCoupon(),now);
    expect(result.lines.reduce((sum,line) => sum + line.lineDiscountCents,0)).toBe(result.discountCents);
    expect(result.lines.reduce((sum,line) => sum + line.lineTotalCents,0)).toBe(result.totalCents);
  });
  it('never produces negative totals', () => { const result = evalr.evaluate([{product:product('p','p',10000),quantity:1}],validCoupon({percentageBps:100000}),now); expect(result.totalCents).toBe(0); });
  it('handles empty cart and no coupon', () => { expect(evalr.evaluate([],validCoupon(),now).couponStatus).toBe('EMPTY_CART'); expect(evalr.evaluate([],null,now).couponStatus).toBe('NONE'); });
  it('uses fixed clock boundaries in UTC', () => { expect(evalr.evaluate([{product:product('p'),quantity:1}],validCoupon({startsAt:now}),now).couponStatus).toBe('APPLIED'); expect(evalr.evaluate([{product:product('p'),quantity:1}],validCoupon({expiresAt:now}),now).couponStatus).toBe('EXPIRED'); });
  it('covers acceptance scenarios A-H', () => {
    const headset = product('h','headset-gamer',12000); const mouse = product('m','mouse-gamer',8000); const gift = product('g','gift-card',6000); const mousepad = product('mp','mousepad',2000); const webcam = product('w','webcam-hd',9999);
    expect(evalr.evaluate([{product:headset,quantity:1}],validCoupon({code:'BEMVINDO10',excludedProductIds:['g']}),now)).toMatchObject({discountCents:1200,totalCents:10800,couponStatus:'APPLIED'});
    expect(evalr.evaluate([{product:headset,quantity:1},{product:mouse,quantity:1}],validCoupon({code:'SUPER20',minimumSubtotalCents:20000,excludedProductIds:['g'],percentageBps:2000}),now)).toMatchObject({discountCents:4000,totalCents:16000});
    expect(evalr.evaluate([{product:headset,quantity:1},{product:mouse,quantity:1},{product:gift,quantity:1}],validCoupon({code:'SUPER20',minimumSubtotalCents:20000,excludedProductIds:['g'],percentageBps:2000}),now)).toMatchObject({subtotalCents:26000,eligibleSubtotalCents:20000,discountCents:4000,totalCents:22000});
    expect(evalr.evaluate([{product:webcam,quantity:1}],validCoupon(),now).couponStatus).toBe('CART_MINIMUM_NOT_MET');
    expect(evalr.evaluate([{product:mouse,quantity:1},{product:mousepad,quantity:1}],validCoupon({code:'GAMER15',percentageBps:1500,includedProductIds:['m']}),now)).toMatchObject({eligibleSubtotalCents:8000,discountCents:1200,totalCents:8800});
    expect(evalr.evaluate([{product:gift,quantity:2}],validCoupon({excludedProductIds:['g']}),now).couponStatus).toBe('NO_ELIGIBLE_ITEMS');
    expect(evalr.evaluate([{product:webcam,quantity:1},{product:mouse,quantity:1},{product:mousepad,quantity:1}],validCoupon({minimumSubtotalCents:20000}),now).couponStatus).toBe('COUPON_MINIMUM_NOT_MET');
    expect(evalr.evaluate([{product:product('round','round',10005),quantity:1}],validCoupon(),now).discountCents).toBe(1001);
  });
  it('covers standalone product eligibility partitions', () => {
    expect(isProductEligible('p',{})).toBe(true);
    expect(isProductEligible('p',{includedProductIds:['p']})).toBe(true);
    expect(isProductEligible('x',{includedProductIds:['p']})).toBe(false);
    expect(isProductEligible('p',{excludedProductIds:['p']})).toBe(false);
    expect(isProductEligible('p',{includedProductIds:['p'],excludedProductIds:['p']})).toBe(false);
  });
});
