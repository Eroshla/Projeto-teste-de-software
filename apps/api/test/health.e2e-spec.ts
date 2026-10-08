import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('API health and error contracts', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => app?.close());

  it('GET /api/health returns a stable health contract', async () => {
    const response = await request(app.getHttpServer()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', service: 'ecommerce-api' });
  });

  it('returns 404 for a nonexistent product and product coupon list', async () => {
    expect((await request(app.getHttpServer()).get('/api/products/missing')).status).toBe(404);
    expect((await request(app.getHttpServer()).get('/api/products/missing/coupons')).status).toBe(404);
  });
});
