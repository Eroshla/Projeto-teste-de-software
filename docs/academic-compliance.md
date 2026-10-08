# Matriz de conformidade acadêmica

Matriz preparada para a revisão do relatório da disciplina de Testes de Software. Cada linha aponta para uma evidência versionada; a classificação descreve o que foi realmente observado nesta entrega.

| Critério | Evidência | Estado |
|---|---|---|
| 1. Identificação do projeto, aluno, disciplina e professor | Capa e seção 1 de [`reports/relatorio.md`](../reports/relatorio.md) | PASS |
| 2. Objetivo, justificativa e escopo | Seções 1 e 5 do relatório; [`docs/test-plan.md`](test-plan.md) | PASS |
| 3. Descrição funcional do sistema | Seção 2 do relatório; [`docs/business-rules.md`](business-rules.md) | PASS |
| 4. Arquitetura e separação de responsabilidades | Seção 3; [`docs/architecture.md`](architecture.md) | PASS |
| 5. Regras de negócio explícitas | Seção 3; [`docs/business-rules.md`](business-rules.md) | PASS |
| 6. Conceitos de erro, defeito, falha, verificação e validação | Seção 4 do relatório | PASS |
| 7. Plano de testes com escopo, níveis, tipos, entrada e saída | [`docs/test-plan.md`](test-plan.md) | PASS |
| 8. Particionamento, valores-limite e tabela de decisão | [`docs/decision-table.md`](decision-table.md), seção 6 | PASS |
| 9. Casos formais reproduzíveis e rastreáveis | [`docs/test-cases.md`](test-cases.md), seção 7 | PASS |
| 10. Automação unitária, integração e E2E | `apps/api/test`, `apps/web/tests`, seção 8, [CI run 37719710116](https://github.com/Eroshla/Projeto-teste-de-software/actions/runs/37719710116) | PASS (14/14 no CI; execução local BLOCKED por Chromium ausente) |
| 11. Prints/logs de testes aprovados | [`evidence/screenshots/`](../evidence/screenshots/), [`evidence/logs/`](../evidence/logs/) | PASS |
| 12. TDD Red-Green-Refactor com evidência | [`docs/tdd-evidence.md`](tdd-evidence.md), [`evidence/tdd/`](../evidence/tdd/) | PASS retrospectivo |
| 13. Defeitos com reprodução, falha e correção | [`docs/defect-reports.md`](defect-reports.md), [`evidence/defects/`](../evidence/defects/) | PASS |
| 14. Relatório final em PDF, limitações e referências | [`reports/relatorio.pdf`](../reports/relatorio.pdf), seções 14–16 | PASS; E2E confirmado no CI e limitação local declarada |

## Limitações declaradas

O trabalho é individual, não inclui pagamento, autenticação, estoque ou carga distribuída, e a execução E2E depende da instalação do Chromium. A cobertura publicada é a cobertura real do domínio, não uma promessa de 100% do sistema. Essas limitações fazem parte do resultado e estão repetidas no relatório para evitar interpretação indevida.
