import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly service:ProductsService) {}
  @Get() list() { return this.service.list(); }
  @Get(':slug') bySlug(@Param('slug') slug:string) { return this.service.bySlug(slug); }
}
