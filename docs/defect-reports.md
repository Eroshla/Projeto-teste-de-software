# Defeitos controlados

Os dois mutantes abaixo são definidos para demonstração, mas não ficam ativos na versão entregue.

## D01 — limite global exclusivo

**Mutação:** trocar `subtotalCents < 10000` por `subtotalCents <= 10000` em `CouponEvaluator`. **Reprodução:** carrinho de 10.000 centavos com BEMVINDO10. **Esperado:** `APPLIED`; **obtido no mutante:** `CART_MINIMUM_NOT_MET`. Severidade alta, prioridade alta. Detectado pelos casos parametrizados do teste de limite global. Correção: comparação inclusiva na implementação atual.

## D02 — ignorar exclusões

**Mutação:** calcular `eligibleSubtotalCents` com todas as linhas. **Reprodução:** Headset 12000 + Gift Card 6000 com BEMVINDO10. **Esperado:** elegível 12000/desconto 1200; mutante: elegível 18000/desconto 1800. Severidade alta, prioridade alta. Detectado por “excludes products and discounts only eligible subtotal”. Correção: filtro `line.eligible` atual.

As execuções reais estão em `evidence/defects/d01-run.txt` e `d02-run.txt`. D01 produziu 3 falhas em 18 testes; D02 produziu 4 falhas em 18 testes. Ambos foram restaurados e a suíte funcional voltou a 18/18 aprovada.
