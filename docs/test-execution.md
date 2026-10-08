# Execução

| ID | Resultado esperado | Resultado obtido | Status | Evidência |
|---|---|---|---|---|
| UNIT | Motor e limites aprovados | 18 testes Jest aprovados | PASS | `npm test` |
| INT | Catálogo, orçamento, manipulação de preço e validação | 5 testes Supertest aprovados | PASS | `npm run test:integration` |
| TYPE | TypeScript strict sem erros | API e web sem erros | PASS | `npm run typecheck` |
| BUILD | Compilação das aplicações | API e web compiladas | PASS | `npm run build` |
| E2E | Jornada real no Chromium | 1 teste Playwright aprovado | PASS | `npm run test:e2e` |
| COVERAGE | Cobertura do motor >= 90% branches | 100% statements/lines/functions; 96% branches | PASS | `npm run test:coverage` |

Os números acima são da execução local registrada nesta entrega; nenhuma execução remota do GitHub Actions é declarada.
