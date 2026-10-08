import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

type ProductMap = Record<string, string>;
type QuoteInput = { productId: string; quantity: number }[];

jest.setTimeout(30000);

describe('Catalog, coupons and cart quote integration', () => {
  let app: INestApplication;
  let products: ProductMap = {};

  const quote = (items: QuoteInput, couponCode?: string) => request(app.getHttpServer())
    .post('/api/cart/quote')
    .send({ items, ...(couponCode === undefined ? {} : { couponCode }) });

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    const response = await request(app.getHttpServer()).get('/api/products');
    for (const product of response.body) products[product.slug] = product.id;
  });

  afterAll(async () => app?.close());

  it('lists the seeded catalog and returns product details', async () => {
    const list = await request(app.getHttpServer()).get('/api/products');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(6);
    const detail = await request(app.getHttpServer()).get('/api/products/headset-gamer');
    expect(detail.status).toBe(200);
    expect(detail.body).toMatchObject({ slug: 'headset-gamer', priceCents: 12000 });
  });

  it('lists only active and temporally valid coupons', async () => {
    const response = await request(app.getHttpServer()).get('/api/coupons');
    expect(response.status).toBe(200);
    expect(response.body.map((coupon: { code: string }) => coupon.code)).toEqual(['BEMVINDO10', 'GAMER15', 'SUPER20']);
  });

  it('reports compatibility and exclusion rules for a product', async () => {
    const response = await request(app.getHttpServer()).get(`/api/products/gift-card/coupons`);
    expect(response.status).toBe(200);
    const byCode = Object.fromEntries(response.body.coupons.map((coupon: { code: string }) => [coupon.code, coupon]));
    expect(byCode.BEMVINDO10).toMatchObject({ compatible: false });
    expect(byCode.SUPER20).toMatchObject({ compatible: false });
  });

  it('calculates BEMVINDO10 using the canonical backend price', async () => {
    const response = await quote([{ productId: products['headset-gamer'], quantity: 1 }], ' bemvindo10 ');
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ subtotalCents: 12000, eligibleSubtotalCents: 12000, discountCents: 1200, totalCents: 10800, couponCode: 'BEMVINDO10', couponStatus: 'APPLIED' });
  });

  it('rejects a global minimum below R$ 100 and accepts exactly R$ 100', async () => {
    const below = await quote([{ productId: products['webcam-hd'], quantity: 1 }], 'BEMVINDO10');
    expect(below.body).toMatchObject({ subtotalCents: 9999, couponStatus: 'CART_MINIMUM_NOT_MET', discountCents: 0 });
    const exact = await quote([{ productId: products['mouse-gamer'], quantity: 1 }, { productId: products['mousepad'], quantity: 1 }], 'GAMER15');
    expect(exact.body).toMatchObject({ subtotalCents: 10000, couponStatus: 'APPLIED', eligibleSubtotalCents: 8000, discountCents: 1200 });
  });

  it('rejects SUPER20 below R$ 200 and accepts exactly R$ 200', async () => {
    const below = await quote([{ productId: products['headset-gamer'], quantity: 1 }, { productId: products['mousepad'], quantity: 1 }], 'SUPER20');
    expect(below.body).toMatchObject({ subtotalCents: 14000, couponStatus: 'COUPON_MINIMUM_NOT_MET', discountCents: 0 });
    const exact = await quote([{ productId: products['headset-gamer'], quantity: 1 }, { productId: products['mouse-gamer'], quantity: 1 }], 'SUPER20');
    expect(exact.body).toMatchObject({ subtotalCents: 20000, couponStatus: 'APPLIED', discountCents: 4000, totalCents: 16000 });
  });

  it('excludes Gift Card from the discount while keeping it in the subtotal', async () => {
    const response = await quote([
      { productId: products['headset-gamer'], quantity: 1 },
      { productId: products['mouse-gamer'], quantity: 1 },
      { productId: products['gift-card'], quantity: 1 },
    ], 'SUPER20');
    expect(response.body).toMatchObject({ subtotalCents: 26000, eligibleSubtotalCents: 20000, discountCents: 4000, totalCents: 22000 });
    expect(response.body.lines.find((line: { slug: string }) => line.slug === 'gift-card')).toMatchObject({ eligible: false });
  });

  it('returns the correct status for expired, inactive and unknown coupons', async () => {
    const items = [{ productId: products['headset-gamer'], quantity: 1 }];
    expect((await quote(items, 'VENCIDO30')).body).toMatchObject({ couponStatus: 'EXPIRED', discountCents: 0 });
    expect((await quote(items, 'DESATIVADO25')).body).toMatchObject({ couponStatus: 'INACTIVE', discountCents: 0 });
    expect((await quote(items, 'DOESNOTEXIST')).body).toMatchObject({ couponStatus: 'NOT_FOUND', discountCents: 0 });
  });

  it('rejects manipulated prices and nonexistent products', async () => {
    const manipulated = await request(app.getHttpServer()).post('/api/cart/quote').send({ items: [{ productId: products['headset-gamer'], quantity: 1, priceCents: 1 }] });
    expect(manipulated.status).toBe(400);
    const missing = await quote([{ productId: 'missing-product-id', quantity: 1 }]);
    expect(missing.status).toBe(422);
    expect(missing.body).toMatchObject({ error: 'PRODUCT_NOT_FOUND' });
  });

  it.each([0, 100])('rejects quantity %i outside the 1..99 partition', async quantity => {
    const response = await quote([{ productId: products['headset-gamer'], quantity }]);
    expect(response.status).toBe(400);
  });

  it('rejects duplicate product IDs and unknown fields', async () => {
    const duplicate = await quote([{ productId: products['headset-gamer'], quantity: 1 }, { productId: products['headset-gamer'], quantity: 1 }]);
    expect(duplicate.status).toBe(400);
    const unknown = await request(app.getHttpServer()).post('/api/cart/quote').send({ items: [], unexpected: true });
    expect(unknown.status).toBe(400);
  });
});
