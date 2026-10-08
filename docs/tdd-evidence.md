# Evidências TDD

A implementação original já existia quando a auditoria começou e não continha uma sequência histórica Red-Green-Refactor verificável. Por isso, os três ciclos abaixo são **reproduções didáticas retrospectivas**, executadas isoladamente na branch `fix/academic-compliance`. Eles demonstram a capacidade dos testes de detectar cada defeito, mas não alegam que o desenvolvimento original ocorreu nessa ordem.

## Ciclo 01 — mínimo global inclusivo

- **RED:** a mutação `subtotalCents < 10000` → `subtotalCents <= 10000` fez exatamente R$ 100,00 ser rejeitado. Resultado: 3 falhas em 18 testes.
- **GREEN:** a comparação inclusiva foi restaurada. Resultado: 18/18 aprovados.
- **REFACTOR:** o cálculo monetário foi extraído para `calculateDiscountCents`. Resultado: 18/18 aprovados.
- Evidências: [`evidence/tdd/cycle-01/red.log`](../evidence/tdd/cycle-01/red.log), [`green.log`](../evidence/tdd/cycle-01/green.log), [`refactor.log`](../evidence/tdd/cycle-01/refactor.log), patches e [`changes.md`](../evidence/tdd/cycle-01/changes.md).

## Ciclo 02 — exclusão do Gift Card

- **RED:** o subtotal elegível foi calculado sobre todas as linhas. Resultado: 4 falhas em 18 testes.
- **GREEN:** o filtro `line.eligible` foi restaurado. Resultado: 18/18 aprovados.
- **REFACTOR:** as linhas foram extraídas para `eligibleLines`. Resultado: 18/18 aprovados.
- Evidências: [`evidence/tdd/cycle-02/red.log`](../evidence/tdd/cycle-02/red.log), [`green.log`](../evidence/tdd/cycle-02/green.log), [`refactor.log`](../evidence/tdd/cycle-02/refactor.log), patches e [`changes.md`](../evidence/tdd/cycle-02/changes.md).

## Ciclo 03 — arredondamento monetário

- **RED:** `Math.round` foi mutado para `Math.floor`. O caso de 10005 centavos observou 1000 em vez de 1001 centavos de desconto; resultado: 2 falhas em 18 testes.
- **GREEN:** o arredondamento correto foi restaurado. Resultado: 18/18 aprovados.
- **REFACTOR:** a função foi nomeada `roundNonNegativeCents`, sem mudança de comportamento. Resultado: 18/18 aprovados.
- Evidências: [`evidence/tdd/cycle-03/red.log`](../evidence/tdd/cycle-03/red.log), [`green.log`](../evidence/tdd/cycle-03/green.log), [`refactor.log`](../evidence/tdd/cycle-03/refactor.log), patches e [`changes.md`](../evidence/tdd/cycle-03/changes.md).

## Limitação acadêmica

Os logs, patches e saídas são autênticos e reproduzíveis, mas são demonstrações posteriores à implementação funcional. Não devem ser apresentados como commits históricos originais.
