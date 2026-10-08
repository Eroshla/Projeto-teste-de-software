# Arquitetura

O monorepo separa `apps/web` (Next.js App Router) de `apps/api` (NestJS REST) e contratos em `packages/contracts`. O navegador armazena somente `{ productId, quantity, couponCode }`; preços e totais são sempre consultados no endpoint `/api/cart/quote`.

Na API, controllers recebem DTOs, serviços consultam Prisma/SQLite e o domínio é isolado em `CouponEvaluator`. O avaliador recebe snapshots de produtos, cupom e um instante UTC, sem depender de HTTP, NestJS ou banco. A precedência de status é validade do cupom, carrinho vazio, mínimo global, mínimo específico e elegibilidade.

O CORS aceita apenas `FRONTEND_ORIGIN` (por padrão `http://localhost:3000`). Valores monetários são inteiros em centavos e descontos são basis points.
