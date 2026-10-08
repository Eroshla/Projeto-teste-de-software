import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma:PrismaService) {}
  list() { return this.prisma.product.findMany({where:{isActive:true}, orderBy:{name:'asc'}}); }
  async bySlug(slug:string) { const product = await this.prisma.product.findFirst({where:{slug,isActive:true}}); if (!product) throw new NotFoundException({error:'PRODUCT_NOT_FOUND',message:'Produto não encontrado.'}); return product; }
}
