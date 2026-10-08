import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
import { CouponEvaluator, CouponSnapshot } from '../../domain/coupons/coupon-evaluator';
import { QuoteDto } from './quote.dto';

type CouponWithRules = Prisma.CouponGetPayload<{
  include: { productRules: true };
}>;

@Injectable()
export class CartService {
  private readonly evaluator = new CouponEvaluator();
  constructor(private readonly prisma:PrismaService) {}
  async quote(dto:QuoteDto) {
    if (!Array.isArray(dto.items)) throw new BadRequestException({error:'INVALID_PAYLOAD',message:'items deve ser uma lista.'});
    const ids = dto.items.map(i => i.productId);
    if (new Set(ids).size !== ids.length) throw new BadRequestException({error:'DUPLICATE_PRODUCT',message:'Não repita produtos no mesmo carrinho.'});
    const products = await this.prisma.product.findMany({where:{id:{in:ids},isActive:true}});
    if (products.length !== ids.length) throw new UnprocessableEntityException({error:'PRODUCT_NOT_FOUND',message:'Um ou mais produtos não existem ou estão indisponíveis.'});
    const byId = new Map(products.map(product => [product.id, product]));
    const items = dto.items.map(item => {
      const product = byId.get(item.productId);
      if (!product) throw new UnprocessableEntityException({error:'PRODUCT_NOT_FOUND',message:'Um ou mais produtos não existem ou estão indisponíveis.'});
      return {
        product: {
          id: product.id,
          slug: product.slug,
          name: product.name,
          priceCents: product.priceCents,
          isActive: product.isActive,
        },
        quantity: item.quantity,
      };
    });
    const code = dto.couponCode?.trim().toUpperCase() || null;
    const coupon:CouponWithRules|null = code
      ? await this.prisma.coupon.findUnique({where:{code},include:{productRules:true}})
      : null;
    const missing = Boolean(code && !coupon);
    const baseCoupon:CouponSnapshot|null = coupon ? {
      code:coupon.code, percentageBps:coupon.percentageBps, minimumSubtotalCents:coupon.minimumSubtotalCents, startsAt:coupon.startsAt, expiresAt:coupon.expiresAt, isActive:coupon.isActive,
      includedProductIds:coupon.productRules.filter(rule => rule.mode === 'INCLUDE').map(rule => rule.productId),
      excludedProductIds:coupon.productRules.filter(rule => rule.mode === 'EXCLUDE').map(rule => rule.productId),
    } : null;
    const evaluation = missing ? this.evaluator.evaluate(items,null) : this.evaluator.evaluate(items,baseCoupon);
    const status = missing ? 'NOT_FOUND' : evaluation.couponStatus;
    const rejectionReason = missing ? 'Cupom não encontrado.' : evaluation.rejectionReason;
    const lines = evaluation.lines.map(line => ({...line,image:byId.get(line.productId)?.image}));
    return {currency:'BRL',lines,subtotalCents:evaluation.subtotalCents,eligibleSubtotalCents:evaluation.eligibleSubtotalCents,discountCents:evaluation.discountCents,totalCents:evaluation.totalCents,couponCode:code,couponStatus:status,rejectionReason,amountToMinimumCents:missing?0:evaluation.amountToMinimumCents};
  }
}
