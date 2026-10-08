# Relatórios de defeitos controlados

Os mutantes foram executados em cópias temporárias da implementação correta. Nenhuma implementação defeituosa permanece ativa.

## D01 — limite global exclusivo

- **Mutação:** trocar `subtotalCents < 10000` por `subtotalCents <= 10000`.
- **Passos:** aplicar `mutation.patch`; executar `npx jest --runInBand -t "global boundary"` em `apps/api`; observar falha; restaurar fonte; repetir comando.
- **Esperado no mutante:** o caso de exatamente 10000 centavos deveria ser `APPLIED`.
- **Obtido no mutante:** `CART_MINIMUM_NOT_MET`; 1 falha, 15 testes ignorados e 2 aprovados na seleção.
- **Restaurado:** seleção voltou a 3 aprovados e código 0.
- **Severidade/prioridade:** alta/alta.
- Evidências: [`mutation.patch`](../evidence/defects/d01/mutation.patch), [`failure.log`](../evidence/defects/d01/failure.log), [`restored.log`](../evidence/defects/d01/restored.log).

## D02 — exclusões ignoradas

- **Mutação:** calcular `eligibleSubtotalCents` com `lines.reduce`, ignorando `eligibleLines`.
- **Passos:** aplicar `mutation.patch`; executar `npx jest --runInBand -t "excludes products|returns no eligible"`; observar falha; restaurar fonte; repetir comando.
- **Esperado no mutante:** Gift Card excluído não entra no desconto e carrinho somente com Gift Card deve ser `NO_ELIGIBLE_ITEMS`.
- **Obtido no mutante:** elegível 18000 em vez de 12000 e status `APPLIED` em vez de `NO_ELIGIBLE_ITEMS`; 2 falhas na seleção.
- **Restaurado:** seleção voltou a 2 aprovados e código 0.
- **Severidade/prioridade:** alta/alta.
- Evidências: [`mutation.patch`](../evidence/defects/d02/mutation.patch), [`failure.log`](../evidence/defects/d02/failure.log), [`restored.log`](../evidence/defects/d02/restored.log).
