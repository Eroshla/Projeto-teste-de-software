# Registro de execução

Este registro separa resultados observados nesta sessão de resultados que dependem de um ambiente com navegador. A execução local foi feita em 08/10/2026 UTC, no Linux, com Node.js 24.19.0 e npm 11.9.0. O CI está fixado em Node.js 22.

## Preparação

```bash
npm ci
npx prisma generate --schema apps/api/prisma/schema.prisma
npm run db:setup
```

O banco usa SQLite em `apps/api/prisma/dev.db`; a migration e o seed são idempotentes. A suíte de integração sobe a aplicação NestJS em memória e consulta o banco sem depender de um servidor externo.

## Resultados observados

| Camada | Comando | Resultado | Evidência |
|---|---|---|---|
| Unidade | `npm test` | **PASS — 18/18** | [`evidence/logs/unit.log`](../evidence/logs/unit.log), [`unit-tests-pass.png`](../evidence/screenshots/unit-tests-pass.png) |
| Integração | `npm run test:integration` | **PASS — 14/14** | [`evidence/logs/integration.log`](../evidence/logs/integration.log), [`integration-tests-pass.png`](../evidence/screenshots/integration-tests-pass.png) |
| TypeScript | `npm run typecheck` | **PASS** | [`evidence/logs/typecheck.log`](../evidence/logs/typecheck.log) |
| Lint | `npm run lint` | **PASS** | [`evidence/logs/lint.log`](../evidence/logs/lint.log) |
| Build | `npm run build` | **PASS** | [`evidence/logs/build.log`](../evidence/logs/build.log) |
| Cobertura | `npm run test:coverage` | **PASS — 100% statements/lines/functions; 96% branches no domínio** | [`evidence/logs/coverage.log`](../evidence/logs/coverage.log), [`coverage-domain.png`](../evidence/screenshots/coverage-domain.png) |
| PDF | `npm run report:pdf` | **PASS — renderer Playwright ou fallback ReportLab** | [`evidence/logs/report.log`](../evidence/logs/report.log), `reports/relatorio.pdf` |

## Rastreamento dos casos

| Casos | Camada | Resultado observado |
|---|---|---|
| CT01–CT10 | Unitário e integração | PASS; limites, arredondamento, validade, inclusão e exclusão cobertos |
| CT11–CT14 | Integração | PASS; preço adulterado, quantidade, duplicidade e campos desconhecidos rejeitados |
| CT15–CT16 | E2E escrito | Implementados; execução local bloqueada pela ausência do Chromium |

## E2E

`npx playwright test --list -c apps/web/playwright.config.ts` encontrou os 14 testes E2E (`E2E01` a `E2E14`), conforme [`e2e-list.log`](../evidence/logs/e2e-list.log) e [`e2e-list-14-tests.png`](../evidence/screenshots/e2e-list-14-tests.png).

`npm run test:e2e` não executou nenhum caso porque o binário Chromium não estava instalado no ambiente. O comando terminou com 14 casos impedidos por `browserType.launch: Executable doesn't exist`; o log está em [`e2e-blocked.log`](../evidence/logs/e2e-blocked.log) e a condição aparece em [`e2e-blocked.png`](../evidence/screenshots/e2e-blocked.png). Esse estado é **BLOCKED**, não PASS. Para executar:

```bash
npx playwright install chromium
npm run test:e2e
```

O workflow do GitHub instala o Chromium antes da etapa E2E e publica `playwright-report`, `test-results` e screenshots como artefatos.

## Evidência TDD e defeitos

Os ciclos retrospectivos Red-Green-Refactor estão em [`docs/tdd-evidence.md`](tdd-evidence.md), com logs e patches em [`evidence/tdd/`](../evidence/tdd/). Os defeitos controlados D01 (limite global) e D02 (exclusão ignorada) foram introduzidos, detectados e restaurados; os registros estão em [`docs/defect-reports.md`](defect-reports.md) e [`evidence/defects/`](../evidence/defects/).

## Critério de interpretação

Um resultado só é declarado PASS quando existe comando reproduzido e log correspondente. Cobertura é limitada ao domínio `CouponEvaluator`; não representa cobertura integral de controllers, Prisma ou frontend. Casos planejados, ferramentas não executadas e testes bloqueados por infraestrutura permanecem identificados como tais.
