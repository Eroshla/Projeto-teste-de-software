import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isProductEligible } from '../../domain/coupons/coupon-evaluator';
import { PrismaService } from '../../prisma.service';

type CouponWithProducts = Prisma.CouponGetPayload<{
  include: { productRules: { include: { product: true } } };
}>;

type CouponWithRules = Prisma.CouponGetPayload<{
  include: { productRules: true };
}>;

@Injectable()
export class CouponsService {
  constructor(private readonly prisma:PrismaService) {}
  private map(coupon:CouponWithProducts) {
    const includes = coupon.productRules.filter(rule => rule.mode === 'INCLUDE').map(rule => rule.product.slug);
    const excludes = coupon.productRules.filter(rule => rule.mode === 'EXCLUDE').map(rule => rule.product.slug);
    return {id:coupon.id,code:coupon.code,description:coupon.description,percentageBps:coupon.percentageBps,minimumSubtotalCents:coupon.minimumSubtotalCents,startsAt:coupon.startsAt,expiresAt:coupon.expiresAt,isActive:coupon.isActive,includedProductSlugs:includes,excludedProductSlugs:excludes};
  }
  async active() {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({where:{isActive:true,startsAt:{lte:now},expiresAt:{gt:now}},include:{productRules:{include:{product:true}}},orderBy:{code:'asc'}});
    return coupons.map(coupon => this.map(coupon));
  }
  async compatibility(slug:string) {
    const product = await this.prisma.product.findFirst({where:{slug,isActive:true}});
    if (!product) return null;
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({where:{isActive:true,startsAt:{lte:now},expiresAt:{gt:now}},include:{productRules:{include:{product:true}}},orderBy:{code:'asc'}});
    return {product:{id:product.id,slug:product.slug,name:product.name},coupons:coupons.map(coupon => {
      const includedProductIds = coupon.productRules.filter(rule => rule.mode === 'INCLUDE').map(rule => rule.productId);
      const excludedProductIds = coupon.productRules.filter(rule => rule.mode === 'EXCLUDE').map(rule => rule.productId);
      const compatible = isProductEligible(product.id,{includedProductIds,excludedProductIds});
      return {code:coupon.code,description:coupon.description,percentageBps:coupon.percentageBps,minimumSubtotalCents:coupon.minimumSubtotalCents,compatible,incompatibilityReason:compatible?null:'Este produto não participa do desconto.'};
    })};
  }
  async findByCode(code:string):Promise<CouponWithRules|null> {
    return this.prisma.coupon.findUnique({where:{code:code.trim().toUpperCase()},include:{productRules:true}});
  }
}
