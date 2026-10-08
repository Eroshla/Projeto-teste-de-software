import { PrismaClient, CouponProductMode, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const products = [
  ['headset-gamer','Headset Gamer','Headset com som imersivo e microfone.',12000,'/products/headset-gamer.png'],
  ['mouse-gamer','Mouse Gamer','Mouse preciso para jogos e trabalho.',8000,'/products/mouse-gamer.png'],
  ['teclado-mecanico','Teclado Mecânico','Teclado mecânico compacto e silencioso.',15000,'/products/teclado-mecanico.png'],
  ['webcam-hd','Webcam HD','Webcam HD para reuniões e aulas.',9999,'/products/webcam-hd.png'],
  ['gift-card','Gift Card','Crédito digital para presentear.',6000,'/products/gift-card.png'],
  ['mousepad','Mousepad','Mousepad de superfície macia.',2000,'/products/mousepad.png'],
] as const;

async function main() {
  const saved: Record<string,string> = {};
  for (const [slug,name,description,priceCents,image] of products) {
    const product = await prisma.product.upsert({where:{slug}, update:{name,description,priceCents,image,isActive:true}, create:{slug,name,description,priceCents,image,isActive:true}});
    saved[slug] = product.id;
  }
  const start = new Date('2020-01-01T00:00:00.000Z');
  const future = new Date('2099-01-01T00:00:00.000Z');
  const couponData = [
    {code:'BEMVINDO10', description:'10% de desconto para começar, exceto Gift Card.', percentageBps:1000, minimumSubtotalCents:10000, startsAt:start, expiresAt:future, isActive:true, excludes:['gift-card']},
    {code:'SUPER20', description:'20% de desconto em pedidos a partir de R$ 200, exceto Gift Card.', percentageBps:2000, minimumSubtotalCents:20000, startsAt:start, expiresAt:future, isActive:true, excludes:['gift-card']},
    {code:'GAMER15', description:'15% em Headset, Mouse Gamer e Teclado Mecânico.', percentageBps:1500, minimumSubtotalCents:10000, startsAt:start, expiresAt:future, isActive:true, includes:['headset-gamer','mouse-gamer','teclado-mecanico']},
    {code:'VENCIDO30', description:'Cupom de demonstração expirado.', percentageBps:3000, minimumSubtotalCents:10000, startsAt:start, expiresAt:new Date('2026-01-01T00:00:00.000Z'), isActive:true, excludes:[]},
    {code:'DESATIVADO25', description:'Cupom temporariamente indisponível.', percentageBps:2500, minimumSubtotalCents:10000, startsAt:start, expiresAt:future, isActive:false, excludes:[]},
  ];
  for (const c of couponData) {
    const {includes = [], excludes = [], ...data} = c;
    const coupon = await prisma.coupon.upsert({where:{code:c.code}, update:data, create:data});
    await prisma.couponProduct.deleteMany({where:{couponId:coupon.id}});
    const rules:Prisma.CouponProductCreateManyInput[] = [...includes.map(slug => ({couponId:coupon.id, productId:saved[slug], mode:CouponProductMode.INCLUDE as CouponProductMode})), ...excludes.map(slug => ({couponId:coupon.id, productId:saved[slug], mode:CouponProductMode.EXCLUDE as CouponProductMode}))];
    if (rules.length) await prisma.couponProduct.createMany({data:rules});
  }
  console.log(`Seed concluído: ${products.length} produtos e ${couponData.length} cupons.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
