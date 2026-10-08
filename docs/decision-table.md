# Tabela de decisão — SUPER20

| Regra válida/ativa | Subtotal >= 20000 | Produto elegível | Resultado |
|---|---|---|---|
| Não | indiferente | indiferente | Rejeição por validade (`INACTIVE`, `NOT_STARTED` ou `EXPIRED`) |
| Sim | Não | indiferente | `COUPON_MINIMUM_NOT_MET` |
| Sim | Sim | Não | `NO_ELIGIBLE_ITEMS` |
| Sim | Sim | Sim | `APPLIED` |
| Sim | Sim | Sim, mas carrinho vazio | `EMPTY_CART` (precedência do carrinho) |

O mínimo global de R$ 100,00 é avaliado antes do mínimo específico quando aplicável.
