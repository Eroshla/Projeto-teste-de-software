import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('Cart quote integration', () => {
  let app:INestApplication;
  let products:Record<string,string> = {};
  beforeAll(async () => { const module = await Test.createTestingModule({imports:[AppModule]}).compile(); app = module.createNestApplication(); app.setGlobalPrefix('api'); app.useGlobalPipes(new ValidationPipe({transform:true,whitelist:true,forbidNonWhitelisted:true})); await app.init(); const response = await request(app.getHttpServer()).get('/api/products'); for (const product of response.body) products[product.slug] = product.id; });
  afterAll(async () => app?.close());
  it('calculates scenario A on canonical prices', async () => { const response = await request(app.getHttpServer()).post('/api/cart/quote').send({items:[{productId:products['headset-gamer'],quantity:1}],couponCode:' bemvindo10 '}); expect(response.status).toBe(201); expect(response.body).toMatchObject({subtotalCents:12000,discountCents:1200,totalCents:10800,couponCode:'BEMVINDO10',couponStatus:'APPLIED'}); });
  it('excludes Gift Card from SUPER20 (scenario C)', async () => { const response = await request(app.getHttpServer()).post('/api/cart/quote').send({items:[{productId:products['headset-gamer'],quantity:1},{productId:products['mouse-gamer'],quantity:1},{productId:products['gift-card'],quantity:1}],couponCode:'SUPER20'}); expect(response.body).toMatchObject({subtotalCents:26000,eligibleSubtotalCents:20000,discountCents:4000,totalCents:22000}); });
  it('rejects manipulated price fields and duplicate products', async () => { const manipulated = await request(app.getHttpServer()).post('/api/cart/quote').send({items:[{productId:products['headset-gamer'],quantity:1,priceCents:1}]}); expect(manipulated.status).toBe(400); const duplicate = await request(app.getHttpServer()).post('/api/cart/quote').send({items:[{productId:products['headset-gamer'],quantity:1},{productId:products['headset-gamer'],quantity:1}]}); expect(duplicate.status).toBe(400); });
});
