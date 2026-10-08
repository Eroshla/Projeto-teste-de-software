# Nexo Store — e-commerce acadêmico com cupons

Mini e-commerce para demonstrar regras de desconto, TDD e automação de testes. O catálogo e o orçamento usam uma API NestJS real; o frontend Next.js nunca envia preços confiáveis.

## Requisitos e instalação

- Node.js 22 e npm 11
- `npm install`
- Copie `.env.example` para `.env` e mantenha `DATABASE_URL="file:./dev.db"` (ao executar comandos Prisma dentro de `apps/api`, o arquivo fica em `apps/api/prisma/dev.db`).
- `npm run db:setup` aplica a migration e executa seeds idempotentes. Para somente repetir seeds: `npm run db:seed`.

## Executar

`npm run dev` inicia API em http://localhost:3001 e web em http://localhost:3000. Rotas: `/products`, `/products/headset-gamer` e `/cart`. Health: `GET /api/health`.

Produtos: Headset Gamer (R$ 120), Mouse Gamer (R$ 80), Teclado Mecânico (R$ 150), Webcam HD (R$ 99,99), Gift Card (R$ 60), Mousepad (R$ 20). Cupons: BEMVINDO10, SUPER20, GAMER15, VENCIDO30 e DESATIVADO25.

## Verificações

- `npm run typecheck` — TypeScript strict.
- `npm run lint` — checagem estática (TypeScript sem emissão).
- `npm test` — testes de domínio Jest.
- `npm run test:integration` — NestJS + Supertest (defina `DATABASE_URL`).
- `npm run test:e2e` — Playwright/Chromium com API e web reais.
- `npm run test:coverage` — cobertura real do domínio em `apps/api/coverage`.
- `npm run build` — builds de API e web.
- `npm run report:pdf` — gera `reports/relatorio.pdf` a partir do relatório Markdown (requer Chromium Playwright).
- `npm run validate` — typecheck, lint, testes e build.

## TDD e defeitos

As regras, tabela de decisão, casos formais e roteiro oral estão em `docs/`. Os ciclos estão descritos em `docs/tdd-evidence.md`; os mutantes controlados D01/D02 em `docs/defect-reports.md`. Como o diretório original não tinha Git, não foram criados commits retrospectivos.

## Problemas comuns

Se a API não conectar, confira `DATABASE_URL`, rode `npx prisma generate --schema apps/api/prisma/schema.prisma` e `npm run db:setup`. Se o E2E não encontrar navegador, execute `npx playwright install chromium`.
