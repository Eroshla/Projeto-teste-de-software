import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('API health and validation', () => {
  let app:INestApplication;
  beforeAll(async () => { const module = await Test.createTestingModule({imports:[AppModule]}).compile(); app = module.createNestApplication(); app.setGlobalPrefix('api'); app.useGlobalPipes(new ValidationPipe({transform:true,whitelist:true,forbidNonWhitelisted:true})); await app.init(); });
  afterAll(async () => app?.close());
  it('GET /api/health', async () => { const response = await request(app.getHttpServer()).get('/api/health'); expect(response.status).toBe(200); expect(response.body.status).toBe('ok'); });
  it('rejects unexpected quote fields', async () => { const response = await request(app.getHttpServer()).post('/api/cart/quote').send({items:[],unexpected:true}); expect(response.status).toBe(400); });
});
