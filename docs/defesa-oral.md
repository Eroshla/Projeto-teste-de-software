# Roteiro de defesa (até 15 minutos)

1. (1 min) Problema: carrinho com cupons previsíveis e regras explicáveis.
2. (2 min) Mostrar `apps/web/app/products/page.tsx` e a comunicação com `apps/api/src/main.ts`.
3. (2 min) Explicar por que preços, elegibilidade e total ficam no `CouponEvaluator`/backend.
4. (2 min) Demonstrar `apps/api/src/domain/coupons/coupon-evaluator.ts` e centavos/basis points.
5. (1 min) Mostrar limites 9.999/10.000/10.001 e 19.999/20.000/20.001.
6. (2 min) Executar `npm test` e explicar os três ciclos documentados em `docs/tdd-evidence.md`.
7. (1 min) Demonstrar um caso misto com Gift Card.
8. (1 min) Explicar D01/D02 em `docs/defect-reports.md`.
9. (1 min) Explicar cobertura de branches e seus limites.
10. (1 min) Encerrar com limitações: pagamentos e autenticação fora do escopo; 100% de cobertura não prova ausência de defeitos.
