# Plano de testes

**Escopo:** motor de cupons, DTOs, endpoints de produtos/cupons/orçamento e fluxos de marketplace/carrinho. **Exclusões:** pagamento, autenticação, observabilidade e carga distribuída.

**Níveis:** unidade (função pura e limites), integração (NestJS + Prisma + Supertest) e E2E (Playwright com API real). **Tipos:** funcional, validação, regressão, contrato e usabilidade básica.

**Entrada:** dependências instaladas, migration aplicada e seed idempotente. **Saída:** testes focados e typecheck/build aprovados, sem defeitos intencionais ativos. Riscos principais são disponibilidade da API, SQLite concorrente e navegador ausente no CI. Ambiente: Node 22, npm workspaces, Windows/Linux, SQLite temporário.

Unidade foi escolhida para cobrir todas as ramificações sem banco; integração verifica persistência e contratos; E2E verifica a jornada observável.
