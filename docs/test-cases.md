# Casos de teste formais

Os casos abaixo usam a API em `http://localhost:3001/api` e os códigos semeados. Para os casos E2E, o navegador inicia em `http://localhost:3000` com API real.

| ID | Objetivo | Pré-condições e dados | Passos reproduzíveis | Resultado esperado | Prioridade | Automação |
|---|---|---|---|---|---|---|
| CT01 | Aplicar BEMVINDO10 | Seed; headset = 12000; código BEMVINDO10 | POST `/api/cart/quote` com item headset quantidade 1 e cupom | 201; subtotal 12000; desconto 1200; total 10800; `APPLIED` | Alta | Unit + INT + E2E07 |
| CT02 | Aceitar mínimo global inclusivo | Seed; mouse = 8000; mousepad = 2000 | Cotar os dois itens com GAMER15 | 201; subtotal 10000; `APPLIED`; desconto 1200 sobre mouse | Alta | Unit + INT |
| CT03 | Rejeitar abaixo do mínimo global | Seed; webcam = 9999 | Cotar webcam com BEMVINDO10 | `CART_MINIMUM_NOT_MET`; desconto zero; total 9999 | Alta | Unit + INT + E2E08 |
| CT04 | Aceitar SUPER20 no limite específico | Seed; headset + mouse = 20000 | Cotar os dois com SUPER20 | `APPLIED`; desconto 4000; total 16000 | Alta | Unit + INT + E2E10 |
| CT05 | Rejeitar SUPER20 abaixo de R$ 200 | Seed; headset + mousepad = 14000 | Cotar com SUPER20 | `COUPON_MINIMUM_NOT_MET`; desconto zero | Alta | Unit + INT + E2E09 |
| CT06 | Excluir Gift Card | Seed; headset + mouse + gift = 26000 | Cotar com SUPER20 | subtotal 26000; elegível 20000; desconto 4000; Gift Card inelegível | Alta | Unit + INT + E2E11 |
| CT07 | Respeitar inclusão e exclusão | Sem banco; produtos A/B de 10000; inclusão A/B e exclusão B | Avaliar `CouponEvaluator` com ambos | Apenas A elegível; desconto calculado sobre A | Alta | Unit |
| CT08 | Arredondar centavos | Sem banco; produto 10005; 10% | Avaliar cupom de 10% | desconto 1001 e total 9004 | Alta | Unit |
| CT09 | Rejeitar cupom temporal | Seed; headset; VENCIDO30 | Cotar cupom expirado | `EXPIRED`; desconto zero | Média | Unit + INT |
| CT10 | Rejeitar código inexistente | Seed; headset; código DOESNOTEXIST | Cotar código desconhecido | HTTP 201 com `NOT_FOUND`, total sem desconto | Alta | INT |
| CT11 | Impedir preço adulterado | Seed; ID válido; campo extra `priceCents` | Enviar preço 1 junto do item | HTTP 400; nenhum orçamento aceito | Alta | INT |
| CT12 | Validar quantidade | Seed; headset | Repetir com quantidade 0 e 100 | HTTP 400 para ambos | Alta | INT |
| CT13 | Impedir IDs duplicados | Seed; headset | Enviar duas linhas com o mesmo `productId` | HTTP 400 `DUPLICATE_PRODUCT` | Média | INT |
| CT14 | Rejeitar campos desconhecidos | API disponível | Enviar `unexpected: true` | HTTP 400 por `forbidNonWhitelisted` | Média | INT |
| CT15 | Persistir carrinho | Front/API disponíveis | Adicionar headset, abrir carrinho, recarregar página | Linha, cupom aplicado e total permanecem | Alta | E2E12 |
| CT16 | Remover cupom e recalcular | Headset + mouse; SUPER20 aplicado | Clicar “Remover cupom” | Cupom some; total volta de 16000 para 20000 | Alta | E2E14 |

## Partições e valores-limite

| Regra | Inválido abaixo | Limite válido | Válido acima |
|---|---:|---:|---:|
| Mínimo global | 9999 | 10000 | 10001 |
| SUPER20 | 19999 | 20000 | 20001 |
| Quantidade | 0 | 1 | 99 |
| Quantidade acima | - | - | 100 inválido |

Os valores representam o último centavo inválido, o primeiro centavo válido e o primeiro centavo posterior ao limite. Quantidades usam a mesma lógica para o intervalo inclusivo de 1 a 99.
