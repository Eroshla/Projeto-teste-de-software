# Regras de negócio

1. O subtotal integral deve ser pelo menos 10.000 centavos.
2. Cada cupom pode exigir um mínimo adicional; os dois mínimos usam o subtotal integral antes do desconto.
3. Inclusões limitam os produtos elegíveis; exclusões sempre prevalecem. Itens inelegíveis continuam no subtotal.
4. Um cupom deve estar ativo e respeitar `startsAt <= now < expiresAt`, em UTC.
5. Uma cotação recebe no máximo um código; informar outro substitui o anterior no cliente.
6. `discountCents = round(eligibleSubtotalCents * percentageBps / 10000)`, limitado ao subtotal elegível. O total nunca é negativo.

Status públicos: `NONE`, `APPLIED`, `NOT_FOUND`, `INACTIVE`, `NOT_STARTED`, `EXPIRED`, `EMPTY_CART`, `CART_MINIMUM_NOT_MET`, `COUPON_MINIMUM_NOT_MET`, `NO_ELIGIBLE_ITEMS`.
