# Baseline da auditoria

**Commit analisado:** `1e1bbe643871c4f1a094cade1f5b263d63bc97a3` (branch `main` antes da correção).  
**Ambiente da auditoria:** Node.js 24.19.0, npm 11.9.0, Linux; o workflow declara Node 22.  
**Data da execução local:** 08/10/2026 UTC.

## Estrutura encontrada

O repositório possui um monorepo npm com `apps/api` (NestJS, Prisma, SQLite), `apps/web` (Next.js, Playwright), `packages/contracts`, documentação Markdown e um relatório PDF gerado por script próprio. O domínio `CouponEvaluator` já estava isolado e trabalhava com valores em centavos.

## Funcionalidades existentes

- Marketplace com catálogo e área de cupons.
- Salespage com descrição, preço e compatibilidade de cupons.
- Carrinho persistido em `localStorage`.
- Cotação de preços e descontos pela API NestJS.
- Seeds de seis produtos e cinco cupons.
- Testes unitários do domínio, integração Supertest e um teste Playwright.

## Comandos reproduzidos antes das correções

| Comando | Resultado inicial | Observação |
|---|---|---|
| `npm test` | PASS | 18 testes unitários aprovados. |
| `npx prisma generate --schema apps/api/prisma/schema.prisma` | PASS | Necessário antes da tipagem. |
| `npm run typecheck` sem gerar Prisma Client | FAIL | O cliente Prisma não existia no ambiente limpo. |
| `npm run test:integration` após migration/seed | PASS | 5 testes antigos aprovados. |
| `npm run build` após gerar Prisma Client | PASS | API e web compilavam. |
| `npm run test:e2e` | BLOCKED | Navegador Chromium não estava instalado no ambiente. |
| `npm run report:pdf` | PASS técnico | PDF de 3 páginas, porém com Markdown literal e sem evidências visuais. |

## Problemas confirmados

1. O relatório não era autossuficiente: remetia a Markdown externo, não trazia tabelas acadêmicas completas nem prints.
2. `scripts/report-pdf.mjs` fazia conversão por expressões regulares e não suportava tabelas, links ou imagens.
3. `docs/tdd-evidence.md` descrevia ciclos, mas `evidence/tdd/` não continha logs Red, Green e Refactor.
4. D01 e D02 eram apenas descrições textuais, sem `mutation.patch`, logs brutos e restauração.
5. Havia somente um teste E2E e cinco testes de integração.
6. A tabela de decisão continha uma combinação impossível de carrinho vazio com produto elegível.
7. `.env.example` não tinha valores locais funcionais e `npm run validate` não executava a suíte completa.
8. O carrinho apresentava inelegibilidade sem cupom e não possuía botão explícito de aplicação.
9. A chave composta de `CouponProduct` não representava simultaneamente INCLUDE e EXCLUDE para o mesmo produto.
10. A execução remota `37706636783` terminou como `failure`, com zero jobs e zero tempo faturável; não foi possível atribuir a falha a um teste específico.

## Limitações

O baseline remoto não contém os logs de jobs do GitHub Actions porque a API retornou `total_count: 0`. A reprodução E2E local depende da instalação de Chromium; essa limitação é registrada separadamente e não é tratada como aprovação do E2E.
