# Casos de teste formais

| ID | Pré-condição | Passos | Entradas | Resultado esperado | Prioridade |
|---|---|---|---|---|---|
| CT01 | Seed aplicado | Cotar headset | 12000 + BEMVINDO10 | APPLIED, desconto 1200 | Alta |
| CT02 | Seed aplicado | Cotar headset + mouse | 20000 + SUPER20 | desconto 4000 | Alta |
| CT03 | Seed aplicado | Cotar headset + mouse + gift | 26000 + SUPER20 | elegível 20000, desconto 4000 | Alta |
| CT04 | Seed aplicado | Cotar webcam | 9999 + BEMVINDO10 | CART_MINIMUM_NOT_MET | Alta |
| CT05 | Seed aplicado | Cotar mouse + mousepad | 10000 + GAMER15 | elegível 8000, desconto 1200 | Alta |
| CT06 | Seed aplicado | Cotar dois gifts | 12000 + BEMVINDO10 | NO_ELIGIBLE_ITEMS | Alta |
| CT07 | Seed aplicado | Cotar webcam + mouse + mousepad | 19999 + SUPER20 | COUPON_MINIMUM_NOT_MET | Alta |
| CT08 | Nenhum banco necessário | Avaliar subtotal 10005 | 10% | desconto 1001 | Alta |
| CT09 | Seed aplicado | Informar VENCIDO30 | carrinho válido | EXPIRED e desconto zero | Média |
| CT10 | Seed aplicado | Informar código desconhecido | carrinho válido | NOT_FOUND e total sem desconto | Alta |
| CT11 | API disponível | Enviar preço adulterado | item sem `productId` válido | HTTP 400/422, nunca aceita preço | Alta |
| CT12 | API disponível | Repetir productId | dois itens iguais | HTTP 400 | Média |
