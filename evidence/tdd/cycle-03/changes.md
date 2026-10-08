# Ciclo 03 — arredondamento monetário

Reprodução didática retrospectiva, executada em branch de correção.

- RED: mutação de `Math.round` para `Math.floor`; o caso de 10005 centavos detectou o desconto incorreto.
- GREEN: restauração do arredondamento mais próximo; o caso voltou a passar.
- REFACTOR: extração de `roundNonNegativeCents`, mantendo o comportamento.
- Patches: `red.patch`, `green.patch` e `refactor.patch`.
