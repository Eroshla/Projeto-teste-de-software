# 1. Introdução, objetivos e justificativa

Este relatório apresenta o desenvolvimento e a verificação do **Nexo Store**, um mini e-commerce acadêmico construído para demonstrar técnicas de Testes de Software. O sistema possui marketplace, salespage, carrinho persistente e regras de cupons calculadas pela API.

O objetivo é demonstrar que preços e descontos não são confiados ao navegador, que os limites monetários são tratados em centavos e que cada requisito relevante possui teste ou evidência rastreável. A justificativa do módulo está nos casos-limite de R$ 99,99/R$ 100,00 e R$ 199,99/R$ 200,00, nas exclusões do Gift Card e na necessidade de manter o total correto quando o carrinho muda.

O trabalho é individual, realizado por **Eros Henrique**, na disciplina **Testes de Software**, com orientação do professor **Gerson Peres**. A entrega acadêmica está prevista para **08/10/2026**.

# 2. Descrição do sistema

O marketplace (`/products`) mostra seis produtos, preços e cupons ativos. A salespage (`/products/[slug]`) apresenta imagem, descrição, preço, quantidade e os cupons compatíveis ou incompatíveis. O carrinho (`/cart`) persiste apenas IDs, quantidades, cupom digitado e cupom aplicado; o preço canônico é consultado novamente pela API.

Produtos semeados: Headset Gamer (R$ 120,00), Mouse Gamer (R$ 80,00), Teclado Mecânico (R$ 150,00), Webcam HD (R$ 99,99), Gift Card (R$ 60,00) e Mousepad (R$ 20,00). Cupons: BEMVINDO10, SUPER20, GAMER15, VENCIDO30 e DESATIVADO25.

# 3. Arquitetura e regras de negócio

O monorepo separa `apps/web` (Next.js), `apps/api` (NestJS), `packages/contracts` e documentação. Controllers recebem DTOs validados, serviços consultam Prisma/SQLite e `CouponEvaluator` permanece independente de HTTP e banco.

As seis regras são:

1. O subtotal integral deve ser de pelo menos 10.000 centavos para qualquer cupom.
2. Um cupom pode exigir um subtotal específico maior, como 20.000 centavos.
3. Inclusões limitam os produtos elegíveis e exclusões sempre prevalecem.
4. O cupom só é válido quando `isActive` e `startsAt <= now < expiresAt`.
5. Uma cotação recebe no máximo um código de cupom.
6. O desconto é arredondado em centavos, aplicado somente às linhas elegíveis e limitado para que o total nunca seja negativo.

O Prisma usa migration versionada. A tabela `CouponProduct` possui um identificador próprio e unicidade por `(couponId, productId, mode)`, permitindo representar INCLUDE e EXCLUDE simultaneamente; a política do domínio continua dando precedência à exclusão.

# 4. Conceitos de Testes de Software

**Erro** é a decisão humana incorreta. Neste projeto, seria interpretar “mínimo de R$ 100” como uma comparação exclusiva. **Defeito** é a implementação `subtotalCents <= 10000` que materializa esse erro. **Falha** é o comportamento observado: um carrinho de exatamente R$ 100,00 é rejeitado.

**Verificação** pergunta se o produto está sendo construído corretamente. É representada por typecheck, lint, testes unitários, migration e inspeção de contratos. **Validação** pergunta se o produto atende ao uso esperado. É representada pela jornada real do marketplace ao carrinho, aplicação de BEMVINDO10, SUPER20 e exclusão do Gift Card.

# 5. Plano de teste

O plano completo está em [`docs/test-plan.md`](../docs/test-plan.md). A unidade isola todas as ramificações do avaliador; a integração confirma DTOs, HTTP, banco, seed e preço canônico; o sistema/E2E confirma a interface com API real. Postman é adequado para exploração manual e k6 para carga, mas não foram usados para declarar resultados desta entrega.

Como o trabalho é individual, Eros acumula os papéis de desenvolvedor, testador e autor do relatório. Essa limitação reduz a independência entre implementação e teste e é compensada pela publicação de comandos, logs, patches e screenshots reais.

# 6. Particionamento, valores-limite e tabela de decisão

| Regra | Partição inválida | Limite inclusivo | Partição válida posterior |
|---|---:|---:|---:|
| Mínimo global | 9.999 centavos | 10.000 centavos | 10.001 centavos |
| SUPER20 | 19.999 centavos | 20.000 centavos | 20.001 centavos |
| Quantidade | 0 | 1 | 99 |
| Quantidade superior | - | - | 100 inválido |

Os valores são o último valor inválido, o primeiro valor aceito e o primeiro valor posterior ao limite. A tabela completa e a derivação a partir do avaliador estão em [`docs/decision-table.md`](../docs/decision-table.md).

| C1: cupom válido/ativo | C2: subtotal >= R$ 200 | C3: produto elegível | Resultado SUPER20 |
|---|---|---|---|
| Não | indiferente | indiferente | Rejeitado por validade |
| Sim | Não | indiferente | Rejeitado por mínimo |
| Sim | Sim | Não | Rejeitado por elegibilidade |
| Sim | Sim | Sim | Aplicado |

Um carrinho vazio não aparece como combinação especial: seu subtotal não satisfaz C2 e segue a rejeição por mínimo/carrinho vazio definida no domínio.

# 7. Casos formais de teste

A especificação reproduzível com 16 casos está em [`docs/test-cases.md`](../docs/test-cases.md). Os principais casos são:

| ID | Cenário | Resultado esperado | Automação |
|---|---|---|---|
| CT01 | Headset + BEMVINDO10 | desconto de R$ 12,00 | Unit/INT/E2E07 |
| CT02 | R$ 100,00 exatos | cupom aceito | Unit/INT |
| CT03 | R$ 99,99 | cupom rejeitado | Unit/INT/E2E08 |
| CT04 | SUPER20 em R$ 200,00 | desconto de R$ 40,00 | Unit/INT/E2E10 |
| CT05 | SUPER20 abaixo de R$ 200,00 | rejeitado por mínimo | Unit/INT/E2E09 |
| CT06 | Headset + Mouse + Gift Card | Gift Card sem desconto | Unit/INT/E2E11 |
| CT07 | Inclusão e exclusão simultâneas | exclusão prevalece | Unit |
| CT08 | Produto de 10005 centavos | desconto arredondado para 1001 | Unit |
| CT09 | Cupom expirado | `EXPIRED` | Unit/INT |
| CT10 | Código inexistente | `NOT_FOUND` | INT |
| CT11 | Preço adulterado | HTTP 400 | INT |
| CT12 | Quantidades 0 e 100 | HTTP 400 | INT |
| CT13 | IDs duplicados | HTTP 400 | INT |
| CT14 | Campo desconhecido | HTTP 400 | INT |
| CT15 | Reload do carrinho | estado preservado | E2E12 |
| CT16 | Remoção do cupom | total recalculado | E2E14 |

# 8. Estratégia de automação

A suíte unitária usa Jest, parametrização de limites, relógio fixo e snapshots manuais de produtos/cupons. A integração usa Supertest contra uma aplicação NestJS real e SQLite semeado. A suíte Playwright possui 14 fluxos E2E com seletores acessíveis/data-testid e API real; nenhum sucesso é interceptado.

A execução local desta sessão encontrou 14 testes E2E no arquivo. O navegador Chromium não estava instalado neste ambiente, portanto a execução E2E foi marcada BLOCKED, e não PASS. O workflow instala Chromium no CI.

![Playwright encontrou os 14 casos E2E](../evidence/screenshots/e2e-list-14-tests.png)

*Figura 1 — Descoberta dos 14 casos E2E pelo Playwright.*

# 9. Evidências unitárias e de integração

![Testes unitários aprovados](../evidence/screenshots/unit-tests-pass.png)

*Figura 2 — Suíte unitária com 18 testes aprovados.*

![Testes de integração aprovados](../evidence/screenshots/integration-tests-pass.png)

*Figura 3 — Suíte de integração com 14 testes aprovados.*

![Cobertura do domínio](../evidence/screenshots/coverage-domain.png)

*Figura 4 — Cobertura real do domínio: 100% statements/lines/functions e 96% branches.*

# 10. Ciclos TDD retrospectivos

A implementação original não tinha histórico Red-Green-Refactor verificável. Os três ciclos seguintes foram reproduzidos didaticamente na branch de correção, sem alegação histórica.

## 10.1 Ciclo 01 — limite global

![Ciclo 01 Red](../evidence/screenshots/tdd-cycle-01-red.png)

*Figura 5 — RED: o mutante rejeita exatamente R$ 100,00.*

![Ciclo 01 Green](../evidence/screenshots/tdd-cycle-01-green.png)

*Figura 6 — GREEN: o teste volta a passar após a comparação inclusiva.*

![Ciclo 01 Refactor](../evidence/screenshots/tdd-cycle-01-refactor.png)

*Figura 7 — REFACTOR: cálculo extraído sem regressão.*

## 10.2 Ciclo 02 — exclusão do Gift Card

![Ciclo 02 Red](../evidence/screenshots/tdd-cycle-02-red.png)

*Figura 8 — RED: Gift Card entra indevidamente no subtotal elegível.*

![Ciclo 02 Green](../evidence/screenshots/tdd-cycle-02-green.png)

*Figura 9 — GREEN: exclusão restaurada.*

![Ciclo 02 Refactor](../evidence/screenshots/tdd-cycle-02-refactor.png)

*Figura 10 — REFACTOR: linhas elegíveis extraídas.*

## 10.3 Ciclo 03 — arredondamento

![Ciclo 03 Red](../evidence/screenshots/tdd-cycle-03-red.png)

*Figura 11 — RED: `floor` produz 1000 em vez de 1001 centavos.*

![Ciclo 03 Green](../evidence/screenshots/tdd-cycle-03-green.png)

*Figura 12 — GREEN: arredondamento correto restaurado.*

![Ciclo 03 Refactor](../evidence/screenshots/tdd-cycle-03-refactor.png)

*Figura 13 — REFACTOR: função de arredondamento nomeada.*

Os logs, patches e explicações completas estão em [`docs/tdd-evidence.md`](../docs/tdd-evidence.md) e `evidence/tdd/`.

# 11. Execução reproduzida

| Suíte/artefato | Resultado observado | Estado |
|---|---|---|
| Unitário | 18/18 aprovados | PASS |
| Integração | 14/14 aprovados | PASS |
| Typecheck | API e web sem erros | PASS |
| Lint | API e web sem erros | PASS |
| Build | NestJS e Next.js compilados | PASS |
| Cobertura | 100% statements/lines/functions; 96% branches no domínio | PASS |
| E2E | 14 casos listados; Chromium ausente para executar | BLOCKED |
| PDF | Gerado com renderer HTML/ReportLab fallback e imagens embutidas | PASS |

Os logs brutos estão em `evidence/logs/`. A cobertura informada é exclusivamente do domínio; não é apresentada como cobertura total da API ou do frontend.

# 12. Defeitos controlados

## D01 — limite global exclusivo

A mutação de `<` para `<=` fez o caso exatamente R$ 100,00 falhar. O teste mutado terminou com 1 falha na seleção; após a restauração, os 3 casos de limite passaram.

![Falha D01](../evidence/screenshots/defect-d01-failure.png)

*Figura 14 — D01 detectado pelo teste de limite.*

![D01 restaurado](../evidence/screenshots/defect-d01-restored.png)

*Figura 15 — D01 restaurado e teste aprovado.*

## D02 — exclusões ignoradas

A mutação que removeu o filtro de elegibilidade calculou 18000 centavos em vez de 12000 e transformou o carrinho somente com Gift Card em `APPLIED`. Após a restauração, os dois testes selecionados passaram.

![Falha D02](../evidence/screenshots/defect-d02-failure.png)

*Figura 16 — D02 detectado nos cenários de exclusão.*

![D02 restaurado](../evidence/screenshots/defect-d02-restored.png)

*Figura 17 — D02 restaurado.*

Os patches e logs estão em `evidence/defects/d01/` e `evidence/defects/d02/`.

# 13. Ferramentas

| Ferramenta | Objetivo e nível | Benefícios | Limitações e uso neste projeto |
|---|---|---|---|
| Jest | Unidade, regressão e cobertura | Rápido, parametrização e relógio controlado | Não valida HTTP/UI; usado no domínio. |
| Supertest | Integração de controllers e contratos | Exercita API NestJS sem servidor externo | Não substitui navegador; usado com SQLite. |
| Playwright | Sistema/E2E e aceitação | API real, acessibilidade, screenshots e trace | Depende de Chromium; 14 testes foram escritos e a sessão local ficou BLOCKED por navegador ausente. |
| Postman | Exploração manual de endpoints | Inspeção rápida de requisições | Execução manual não é suficiente para regressão; apenas planejado. |
| k6 | Desempenho e carga | Métricas de latência e throughput | Não verifica regra funcional; não executado. |

# 14. Análise crítica, limitações e melhorias

Os testes unitários detectam limites, temporalidade, exclusões, arredondamento e total não negativo. A integração demonstrou que a API consulta preços canônicos e rejeita preço adulterado, quantidades inválidas, IDs duplicados e campos desconhecidos. As mutações D01 e D02 foram detectadas, o que fornece evidência de eficácia além de uma contagem de cobertura.

A cobertura de 96% de branches pertence somente ao `CouponEvaluator`. Ela não garante ausência de defeitos nos controllers, Prisma, frontend, navegador ou ambiente. A suíte E2E foi ampliada para os 14 cenários, mas deve ser executada em uma máquina/CI com Chromium instalado antes de declarar aprovação final dessa camada.

Riscos residuais incluem ausência de pagamento, autenticação, estoque, carga, concorrência e execução independente por outro testador. Como melhorias futuras, recomenda-se um teste de contrato compartilhado, k6 em ambiente controlado, execução E2E em Linux e Windows e revisão independente dos casos.

# 15. Conclusão

O projeto corrigido concentra regras monetárias no backend, valida os limites de negócio e mantém evidências autênticas de aprovação e falha controlada. Unitários, integração, typecheck, lint, build e cobertura foram executados com sucesso nesta sessão. O E2E possui 14 casos versionados e permanece explicitamente BLOCKED apenas pela ausência local do Chromium; não é apresentado como aprovado sem execução real.

A matriz de rastreabilidade dos 14 critérios acadêmicos está em [`docs/academic-compliance.md`](../docs/academic-compliance.md). O estado final do CI remoto deve ser verificado após o push desta branch.

# 16. Referências e artefatos

- [`README.md`](../README.md)
- [`docs/test-plan.md`](../docs/test-plan.md)
- [`docs/test-cases.md`](../docs/test-cases.md)
- [`docs/test-execution.md`](../docs/test-execution.md)
- [`docs/tdd-evidence.md`](../docs/tdd-evidence.md)
- [`docs/defect-reports.md`](../docs/defect-reports.md)
- [`docs/academic-compliance.md`](../docs/academic-compliance.md)
- [`evidence/`](../evidence/)
