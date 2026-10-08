import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CouponsService } from '../coupons/coupons.service';
import { PrismaService } from '../../prisma.service';
import { CouponEvaluator, CouponSnapshot } from '../../domain/coupons/coupon-evaluator';
import { QuoteDto } from './quote.dto';

@Injectable()
export class CartService {
  private readonly evaluator = new CouponEvaluator();
  constructor(private readonly prisma:PrismaService, private readonly coupons:CouponsService) {}
  async quote(dto:QuoteDto) {
    if (!Array.isArray(dto.items)) throw new BadRequestException({error:'INVALID_PAYLOAD',message:'items deve ser uma lista.'});
    const ids = dto.items.map(i => i.productId);
    if (new Set(ids).size !== ids.length) throw new BadRequestException({error:'DUPLICATE_PRODUCT',message:'Não repita produtos no mesmo carrinho.'});
    const products = await this.prisma.product.findMany({where:{id:{in:ids},isActive:true}});
    if (products.length !== ids.length) throw new UnprocessableEntityException({error:'PRODUCT_NOT_FOUND',message:'Um ou mais produtos não existem ou estão indisponíveis.'});
    const byId = new Map(products.map(p => [p.id,p]));
    const items = dto.items.map(item => ({product:byId.get(item.productId)!,quantity:item.quantity}));
    const code = dto.couponCode?.trim().toUpperCase() || null;
    let coupon:any = null;
    let missing = false;
    if (code) { coupon = await this.prisma.coupon.findUnique({where:{code},include:{productRules:true}}); missing = !coupon; }
    const baseCoupon:CouponSnapshot|null = coupon ? {
      code:coupon.code, percentageBps:coupon.percentageBps, minimumSubtotalCents:coupon.minimumSubtotalCents, startsAt:coupon.startsAt, expiresAt:coupon.expiresAt, isActive:coupon.isActive,
      includedProductIds:coupon.productRules.filter((r:any) => r.mode === 'INCLUDE').map((r:any) => r.productId), excludedProductIds:coupon.productRules.filter((r:any) => r.mode === 'EXCLUDE').map((r:any) => r.productId),
    } : null;
    const evaluation = missing ? this.evaluator.evaluate(items,null) : this.evaluator.evaluate(items,baseCoupon);
    const status = missing ? 'NOT_FOUND' : evaluation.couponStatus;
    const rejectionReason = missing ? 'Cupom não encontrado.' : evaluation.rejectionReason;
    const lines = evaluation.lines.map(line => ({...line,image:byId.get(line.productId)!.image}));
    return {currency:'BRL',lines,subtotalCents:evaluation.subtotalCents,eligibleSubtotalCents:evaluation.eligibleSubtotalCents,discountCents:evaluation.discountCents,totalCents:evaluation.totalCents,couponCode:code,couponStatus:status,rejectionReason,amountToMinimumCents:missing?0:evaluation.amountToMinimumCents};
  }
}
