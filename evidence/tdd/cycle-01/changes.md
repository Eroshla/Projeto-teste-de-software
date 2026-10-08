# Ciclo 01 — mínimo global inclusivo

Reprodução didática retrospectiva, executada em branch de correção. A implementação original não possuía logs Red-Green-Refactor versionados.

- RED: mutação controlada de `subtotalCents < 10000` para `subtotalCents <= 10000`; `npm test -- --runInBand` falhou nos cenários de exatamente R$ 100.
- GREEN: restauração da comparação inclusiva; a mesma suíte voltou a passar.
- REFACTOR: extração de `calculateDiscountCents`; comportamento preservado e suíte executada novamente.
- Patches: `red.patch`, `green.patch` e `refactor.patch`.
