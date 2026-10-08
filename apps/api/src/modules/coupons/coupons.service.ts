import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { isProductEligible } from '../../domain/coupons/coupon-evaluator';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma:PrismaService) {}
  private map(coupon:any) {
    const includes = coupon.productRules.filter((r:any) => r.mode === 'INCLUDE').map((r:any) => r.product.slug);
    const excludes = coupon.productRules.filter((r:any) => r.mode === 'EXCLUDE').map((r:any) => r.product.slug);
    return {id:coupon.id,code:coupon.code,description:coupon.description,percentageBps:coupon.percentageBps,minimumSubtotalCents:coupon.minimumSubtotalCents,startsAt:coupon.startsAt,expiresAt:coupon.expiresAt,isActive:coupon.isActive,includedProductSlugs:includes,excludedProductSlugs:excludes};
  }
  async active() {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({where:{isActive:true,startsAt:{lte:now},expiresAt:{gt:now}},include:{productRules:{include:{product:true}}},orderBy:{code:'asc'}});
    return coupons.map(c => this.map(c));
  }
  async compatibility(slug:string) {
    const product = await this.prisma.product.findFirst({where:{slug,isActive:true}});
    if (!product) return null;
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({where:{isActive:true,startsAt:{lte:now},expiresAt:{gt:now}},include:{productRules:{include:{product:true}}},orderBy:{code:'asc'}});
    return {product:{id:product.id,slug:product.slug,name:product.name},coupons:coupons.map(c => {
      const includedProductIds = c.productRules.filter(r => r.mode === 'INCLUDE').map(r => r.productId);
      const excludedProductIds = c.productRules.filter(r => r.mode === 'EXCLUDE').map(r => r.productId);
      const compatible = isProductEligible(product.id,{includedProductIds,excludedProductIds});
      return {code:c.code,description:c.description,percentageBps:c.percentageBps,minimumSubtotalCents:c.minimumSubtotalCents,compatible,incompatibilityReason:compatible?null:'Este produto não participa do desconto.'};
    })};
  }
  async findByCode(code:string) { return this.prisma.coupon.findUnique({where:{code},include:{productRules:true}}); }
}
