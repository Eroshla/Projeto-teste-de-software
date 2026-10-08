# Tabela de decisão — SUPER20

O avaliador verifica a validade temporal antes dos mínimos. Para `SUPER20`, o mínimo específico de R$ 200,00 já satisfaz o mínimo global de R$ 100,00. Um carrinho vazio, portanto, cai naturalmente na condição de subtotal insuficiente.

| Regra | C1: cupom ativo e temporalmente válido? | C2: subtotal >= R$ 200,00? | C3: existe produto elegível? | Resultado |
|---|---|---|---|---|
| R1 | Não | indiferente | indiferente | Rejeitado por validade (`INACTIVE`, `NOT_STARTED` ou `EXPIRED`) |
| R2 | Sim | Não | indiferente | Rejeitado por mínimo (`COUPON_MINIMUM_NOT_MET`; para subtotal abaixo de R$ 100,00, `CART_MINIMUM_NOT_MET`) |
| R3 | Sim | Sim | Não | Rejeitado por elegibilidade (`NO_ELIGIBLE_ITEMS`) |
| R4 | Sim | Sim | Sim | Aplicado (`APPLIED`) |

A tabela deriva diretamente da ordem de decisões em `CouponEvaluator.evaluate`: validade, carrinho vazio, mínimo global, mínimo específico e filtragem de linhas elegíveis. Não há uma linha separada para “carrinho vazio com produto elegível”, pois um carrinho vazio não possui linhas e seu subtotal não pode satisfazer C2.
