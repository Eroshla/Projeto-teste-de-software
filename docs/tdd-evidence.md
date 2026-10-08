# Evidências TDD

O motor mantém testes puros em `apps/api/src/domain/coupons/coupon-evaluator.spec.ts`.

* Ciclo 1 (mínimo global): casos parametrizados 9.999/10.000/10.001 documentam RED/GREEN/REFACTOR; a implementação final está em `CouponEvaluator`.
* Ciclo 2 (elegibilidade): casos de inclusão, exclusão e mistura validam Gift Card e a função `isProductEligible`.
* Ciclo 3 (centavos): o teste de 10.005 centavos verifica arredondamento único para 1.001.

O diretório não possuía histórico Git no início (`git status` retornou “not a git repository”), portanto não há commits retrospectivos. Na validação final foram aprovados 18 testes; a cobertura do motor foi 100% em statements/lines/functions e 96% em branches. Os comandos reproduzíveis são `npm test -- --runInBand` e `npm run test:coverage -w apps/api`.
