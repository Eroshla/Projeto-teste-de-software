# Plano de testes

## 1. Objetivo

Verificar que o Nexo Store calcula carrinhos e cupons de forma determinística, mantém os preços sob responsabilidade da API e oferece uma jornada de marketplace, salespage e carrinho reproduzível.

## 2. Escopo

São testados o domínio `CouponEvaluator`, os DTOs e controllers NestJS, a persistência Prisma/SQLite, o catálogo, a compatibilidade de cupons, a cotação do carrinho e os fluxos visíveis no Next.js.

### Fora do escopo

Pagamento, autenticação, estoque, transportadora, antifraude, feriados, observabilidade de produção e teste de carga distribuído. k6 é documentado como ferramenta futura, mas não é apresentado como execução realizada.

## 3. Itens e ambiente

- Node.js 22 no CI; execução local registra a versão efetivamente usada.
- npm workspaces, TypeScript strict, NestJS 11, Next.js 15, Prisma 6, SQLite.
- Banco local em `apps/api/prisma/dev.db`, migration versionada e seed idempotente.
- Jest para unidade/cobertura, Supertest para integração HTTP e Playwright/Chromium para sistema/E2E.
- Postman pode ser usado para exploração manual; k6 é reservado para desempenho.

## 4. Níveis e tipos

| Nível/tipo | Aplicação | Justificativa |
|---|---|---|
| Unidade | `CouponEvaluator` e particionamentos | Isola regras, relógio e arredondamento sem banco. |
| Integração | NestJS + Prisma + Supertest | Confirma DTOs, HTTP, preços canônicos, migration e seed. |
| Sistema/E2E | Next.js + API real + Chromium | Confirma a jornada observável de compra. |
| Aceitação | CT/E2E01–E2E14 | Traduz requisitos do usuário em comportamentos verificáveis. |
| Funcional | Cupons, catálogo, carrinho e persistência | Verifica o que o sistema deve fazer. |
| Regressão | Suíte completa após cada correção | Evita que D01/D02 ou alterações de UI retornem. |
| Segurança básica | Campos desconhecidos, preço adulterado e IDs inválidos | Evita confiar em dados manipulados pelo navegador. |
| Usabilidade | Mensagens, estados de carregamento, acessibilidade e botões | Confirma que o resultado é compreensível e operável. |
| Desempenho | Planejado para k6 | Não foi executado nesta entrega; não há alegação de carga aprovada. |

## 5. Critérios de entrada

1. Dependências instaladas com `npm ci`.
2. Prisma Client gerado.
3. Migrations aplicadas e seed executado.
4. API e frontend iniciáveis.
5. Casos e dados de teste versionados.
6. Chromium instalado para a suíte E2E.

## 6. Critérios de saída

1. Testes unitários e integração aprovados.
2. Todos os E2E executados ou explicitamente marcados como BLOCKED.
3. Typecheck, lint e builds aprovados.
4. Mutantes D01/D02 detectados e removidos.
5. PDF gerado e inspecionado visualmente.
6. Nenhum segredo versionado.

## 7. Papéis e responsabilidades

O trabalho é individual. Eros Henrique atua como desenvolvedor, testador, responsável pela execução, curadoria das evidências e autor do relatório. Essa acumulação reduz a independência entre desenvolvimento e teste; por isso, os comandos, logs, mutações e resultados são mantidos reproduzíveis para permitir auditoria pelo professor.

## 8. Gestão de defeitos

Cada defeito recebe ID, descrição, severidade, prioridade, passos, resultado esperado/observado, evidência de falha e evidência de restauração. A implementação defeituosa nunca permanece na branch final.

## 9. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Chromium ausente | Instalação explícita no README e no workflow; E2E marcado BLOCKED se indisponível. |
| Banco sujo | SQLite local, migration deploy e seed idempotente. |
| Preço alterado no cliente | API recebe apenas ID/quantidade e consulta o preço no banco. |
| Resposta antiga sobrescrevendo cotação nova | Sequência monotônica no `CartProvider` e limpeza da cotação durante carregamento. |
| Limitação de independência | Logs brutos, patches e matriz de rastreabilidade. |
| Cobertura restrita ao domínio | Relatório separa cobertura do domínio, API e frontend não medidos. |

## 10. Aprovação

Um item só é considerado PASS quando existe comando ou artefato correspondente. Resultados planejados, históricos sem log e execuções impedidas por ambiente são classificados separadamente.
