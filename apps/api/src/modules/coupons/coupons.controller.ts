import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller()
export class CouponsController {
  constructor(private readonly service:CouponsService) {}
  @Get('coupons') active() { return this.service.active(); }
  @Get('products/:slug/coupons') async compatibility(@Param('slug') slug:string) { const result = await this.service.compatibility(slug); if (!result) throw new NotFoundException({error:'PRODUCT_NOT_FOUND',message:'Produto não encontrado.'}); return result; }
}
