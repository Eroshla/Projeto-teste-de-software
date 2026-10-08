# Nexo Store: roteiro de apresentação oral

Mini e-commerce acadêmico para demonstrar testes de software em um **carrinho de compras com cupom de desconto**. A interface usa Next.js; a API usa NestJS, Prisma e SQLite. Os preços e o cálculo final vêm do backend.

Este README é um guia de ensaio e consulta: **o que falar, o que mostrar, qual comando executar e como interpretar o resultado**. A meta do roteiro principal é **13 minutos**, deixando **2 minutos para a arguição**, dentro do limite de 15 minutos. Confirme esse ritmo no ensaio; as falas são sugestões para explicar com suas próprias palavras, e as notas de apoio não precisam ser lidas inteiras.

## 1. Antes da apresentação: preparar e ensaiar

**Não instale dependências, prepare o banco ou gere o PDF durante os 15 minutos.** Faça isso antes e confirme que o ambiente funciona. Os comandos abaixo usam **PowerShell no Windows** e devem ser executados na **raiz do repositório**, onde estão `package.json`, `apps/` e `docs/`. Não execute a preparação contra um banco de produção.

### 1.1 Obter o projeto e conferir a versão

Se ainda não tiver o projeto:

```powershell
git clone https://github.com/Eroshla/Projeto-teste-de-software.git
cd Projeto-teste-de-software
```

Se já tiver, abra essa pasta no terminal. Confira:

```powershell
git status --short
git branch --show-current
git log -1 --oneline
node --version
npm --version
```

- Use **Node.js 22** e **npm 11** como referência de preparação; o CI usa Node.js 22.
- O roteiro acompanha a versão atual de `main`. Não troque de branch nem descarte alterações locais sem revisá-las.
- Se estiver em `main`, sem alterações locais, atualize **antes do ensaio** com `git pull --ff-only`. Se houver conflito ou divergência, resolva antes da apresentação.

### 1.2 Instalar e configurar

```powershell
npm ci
```

**Para que serve:** instala as versões registradas em `package-lock.json`, tornando o ambiente reproduzível. `npm install` também instala dependências, mas prefira `npm ci` para reproduzir esta entrega.

Se ainda não existir `.env`, copie o exemplo:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Abra `.env` no editor e confira **todos os valores** abaixo. O `.env.example` atual contém as chaves sem valores; só copiá-lo não configura o banco.

```dotenv
DATABASE_URL="file:./dev.db"
PORT=3001
FRONTEND_ORIGIN="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

O banco SQLite fica em `apps/api/prisma/dev.db`. Mantenha `.env` fora do versionamento.

```powershell
npx prisma generate --schema apps/api/prisma/schema.prisma
npm run db:setup
npx playwright install chromium
```

| Comando | Para que serve | O que conferir |
|---|---|---|
| `npx prisma generate --schema apps/api/prisma/schema.prisma` | Gera o Prisma Client usado pela API. | Geração concluída sem erro. |
| `npm run db:setup` | Aplica as migrations e executa o seed. | Banco preparado e mensagem de **6 produtos e 5 cupons**. |
| `npx playwright install chromium` | Instala o navegador usado pelos testes E2E. | Download/instalação concluídos antes do ensaio. |

Para repetir somente os dados de demonstração: `npm run db:seed`. O seed atualiza os produtos e cupons conhecidos; não é necessário apagar o banco.

### 1.3 Ensaiar as verificações antes de abrir a loja

Execute **um comando por vez** e só avance após conferir sua saída. Esta sequência é de preparação, sem cronômetro:

**Atenção ao PDF:** `npm run report:pdf` sobrescreve `reports/relatorio.pdf`. Para preservar a versão formatada da entrega, guarde uma cópia fora do repositório antes de regenerar, ou pule esse último comando e use o PDF existente. `npm run validate` também inclui essa regeneração.

```powershell
npm run typecheck
npm run lint
npm test
npm run test:integration
npm run build
npm run test:e2e
npm run test:coverage
npm run report:pdf
```

- O build vem antes do E2E nesta preparação, seguindo o workflow do projeto. **Não rode build enquanto `npm run dev` estiver ativo**, pois ambos usam a pasta `.next`.
- A integração inicializa uma aplicação NestJS de teste e usa o SQLite preparado. Ela não exige que `npm run dev` esteja aberto.
- O Playwright inicia API e frontend se necessário; também pode reutilizar os servidores locais já disponíveis nas portas 3001/3000. Confira que são os servidores **deste projeto**.
- `npm run test:e2e` precisa de Chromium. Listar os testes com `--list` não equivale a executá-los.
- Abra antecipadamente `apps/api/coverage/lcov-report/index.html`, o relatório E2E e `reports/relatorio.pdf`.
- Para abrir o relatório E2E: `npx playwright show-report apps/web/playwright-report`. Depois de consultar, use `Ctrl+C` para liberar o terminal. O relatório é da última execução; uma execução filtrada pode substituí-lo.
- `npm run report:pdf` usa Playwright e tem fallback em Python/ReportLab quando disponível. Se a geração falhar por ambiente, use o PDF já versionado e explique que ele pertence à execução registrada.

Os atalhos `npm run validate:fast` (typecheck, lint, unitários e build) e `npm run validate` (validação completa, incluindo PDF) existem, mas são para preparação. **Não use a validação completa ao vivo.**

### 1.4 Deixar dois terminais prontos

**Terminal A: aplicação.** Na raiz do projeto:

```powershell
npm run dev
```

Esse comando inicia **API e frontend juntos**. Deixe-o rodando durante a demonstração.

- Loja: http://localhost:3000/products
- Detalhe de produto: http://localhost:3000/products/headset-gamer
- Carrinho: http://localhost:3000/cart
- Saúde da API: http://localhost:3001/api/health

Abra as páginas antes da fala para a primeira compilação do Next.js já ter ocorrido. Se houver um cupom anterior, clique em “Remover cupom” enquanto ainda houver itens; depois esvazie o carrinho pela própria interface. Esvaziar o carrinho sozinho não limpa o cupom salvo.

**Terminal B: comandos de teste.** Abra outro terminal, também na raiz do projeto. No PowerShell, confira o health:

```powershell
Invoke-RestMethod http://localhost:3001/api/health
```

Espere `status: ok` e `service: ecommerce-api`. Isso confirma que a API responde; não comprova sozinho que todas as regras estão corretas.

**Deixe abertas no editor estas abas:**

1. [Regras de negócio](docs/business-rules.md), [plano](docs/test-plan.md), [casos formais](docs/test-cases.md) e [tabela de decisão](docs/decision-table.md).
2. [Avaliador de cupons](apps/api/src/domain/coupons/coupon-evaluator.ts) e [testes unitários](apps/api/src/domain/coupons/coupon-evaluator.spec.ts).
3. [Testes de integração](apps/api/test/quote.e2e-spec.ts) e [testes E2E](apps/web/tests/shop.spec.ts).
4. [Ciclos TDD](docs/tdd-evidence.md), [defeitos](docs/defect-reports.md), [execuções](docs/test-execution.md) e [cobertura registrada](evidence/logs/coverage.log).

## 2. Roteiro cronometrado: até 15 minutos

| Tempo | Assunto | Ação principal |
|---|---|---|
| 00:00–01:00 | Problema e arquitetura | Mostrar a loja e localizar frontend, API e domínio. |
| 01:00–02:00 | Conceitos e plano | Explicar erro, defeito, falha, verificação e validação. |
| 02:00–04:00 | Regras e demonstração | Aplicar BEMVINDO10, SUPER20 e adicionar Gift Card. |
| 04:00–05:30 | Projeto dos testes | Mostrar partições, limites, tabela e um caso formal. |
| 05:30–07:00 | Unidade | Executar `npm test` no Terminal B. |
| 07:00–08:00 | Integração | Executar `npm run test:integration` no Terminal B. |
| 08:00–09:00 | Sistema/E2E | Mostrar resultado completo ensaiado; um caso ao vivo é opcional. |
| 09:00–11:00 | TDD e defeitos | Mostrar logs e patches já registrados. |
| 11:00–12:00 | Cobertura | Executar `npm run test:coverage` e interpretar. |
| 12:00–13:00 | Build e conclusão | Mostrar resultado preparado, limitações e ferramentas. |
| 13:00–15:00 | Arguição | Responder às perguntas e voltar aos arquivos necessários. |

### 00:00–01:00 | Apresentar o problema

**Tela:** catálogo em `/products`; em seguida, estrutura `apps/web`, `apps/api` e `packages/contracts`.

**Fala sugerida:**

> “Meu módulo é um carrinho de compras com cupom de desconto. O foco é verificar quando o cupom pode ser aplicado e qual valor deve ser descontado. A interface está em Next.js, a API em NestJS e os dados em SQLite com Prisma. O frontend envia o ID do produto, a quantidade e o cupom. A API consulta os preços e calcula o orçamento.”

**Mostrar no código:** [CartService](apps/api/src/modules/cart/cart.service.ts) consulta os produtos; [CouponEvaluator](apps/api/src/domain/coupons/coupon-evaluator.ts) concentra as regras de cálculo. Os tipos compartilhados ficam em [contracts](packages/contracts/src/index.ts).

**Comando neste minuto:** nenhum; a aplicação já está aberta.

### 01:00–02:00 | Conceitos e planejamento

**Tela:** [docs/test-plan.md](docs/test-plan.md).

**Fala sugerida:**

> “Um erro seria interpretar que o mínimo de R$ 100 não inclui exatamente R$ 100. O defeito seria escrever `<= 10000` na condição de rejeição. A falha apareceria quando o cliente tentasse aplicar o cupom com R$ 100 e fosse recusado. Verificação é conferir a implementação contra as regras; validação é confirmar se o carrinho atende ao comportamento esperado pelo usuário.”

Complete em poucas frases; se o minuto estiver acabando, deixe riscos e papéis para as perguntas:

- **Escopo:** cupons, cálculo, API e jornada de catálogo/carrinho; pagamento, autenticação e estoque ficam fora.
- **Entrada:** dependências, banco e navegador preparados. **Saída:** resultados registrados, verificações executadas e defeitos controlados removidos.
- **Níveis:** unidade, integração e sistema; os cenários esperados também orientam a aceitação.
- **Tipos:** funcional e regressão; há verificações básicas contra payload inválido, mas não uma auditoria completa de segurança. Desempenho com k6 é uma melhoria planejada.
- **Riscos:** ambiente sem navegador e dados inconsistentes. O trabalho é individual, com menor independência entre desenvolvimento e teste.

### 02:00–04:00 | Regras e demonstração na loja

**Fala sugerida:**

> “Defini seis regras: mínimo global de R$ 100; mínimo próprio de cada cupom; inclusão e exclusão de produtos; validade e ativação; um cupom por cotação; e cálculo em centavos, com arredondamento e total não negativo. Os mínimos usam o subtotal integral antes do desconto. O desconto usa apenas o subtotal elegível.”

**Faça esta sequência, partindo do carrinho vazio:**

1. Adicione **1 Headset Gamer, R$ 120,00**, abra o carrinho e aplique **BEMVINDO10**. Mostre desconto de **R$ 12,00** e total de **R$ 108,00**.
2. Use “Continuar comprando”, adicione **1 Mouse Gamer, R$ 80,00**, volte ao carrinho e aplique **SUPER20**, substituindo o cupom anterior. Subtotal: **R$ 200,00**; desconto: **R$ 40,00**; total: **R$ 160,00**.
3. Adicione **1 Gift Card, R$ 60,00** e volte ao carrinho. Confira SUPER20 aplicado; se necessário, aplique-o novamente. Subtotal integral: **R$ 260,00**; elegível: **R$ 200,00**; desconto: **R$ 40,00**; total: **R$ 220,00**. A linha do Gift Card deve aparecer como **não elegível**.

**O que explicar:** “O Gift Card continua sendo comprado e entra no subtotal, mas não recebe desconto. Por isso o desconto permanece em R$ 40.” Aguarde “Atualizando orçamento…” desaparecer antes de ler os números.

**Reserva, só se houver tempo:** Webcam HD sozinha custa R$ 99,99; BEMVINDO10 deve ser recusado e faltar R$ 0,01. Para mostrar o limite global exato, Mouse Gamer + Mousepad = R$ 100,00: GAMER15 aplica 15% apenas aos R$ 80,00 do mouse, dando R$ 12,00 de desconto e total de R$ 88,00. Remova os outros itens antes de cada cenário.

### 04:00–05:30 | Por que esses casos de teste?

**Tela:** [testes unitários](apps/api/src/domain/coupons/coupon-evaluator.spec.ts), [casos formais](docs/test-cases.md) e [tabela de decisão](docs/decision-table.md).

**Fala sugerida:**

> “Usei particionamento de equivalência para separar entradas com comportamentos diferentes: subtotal abaixo ou dentro do mínimo, cupom ativo ou inativo, e produto elegível ou excluído. Nos valores-limite, testei o centavo imediatamente anterior, o limite e o centavo seguinte, porque é onde uma comparação incorreta costuma aparecer.”

| Regra | Abaixo | Exatamente no limite | Acima |
|---|---:|---:|---:|
| Mínimo global | R$ 99,99: rejeita | R$ 100,00: aceita* | R$ 100,01: aceita* |
| Mínimo de SUPER20 | R$ 199,99: rejeita | R$ 200,00: aceita* | R$ 200,01: aceita* |

\* Desde que as demais condições do cupom sejam atendidas. No código os valores são **9999/10000/10001** e **19999/20000/20001 centavos**; os unitários usam dados sintéticos para chegar ao centavo exato.

Mostre também as partições de quantidade: **1 a 99 válidas; 0 e 100 inválidas**. A integração testa as duas entradas inválidas.

Na tabela de SUPER20, explique as três condições: **cupom ativo e válido no tempo, subtotal de pelo menos R$ 200 e existência de produto elegível**. Para carrinho vazio, o código tem um retorno específico `EMPTY_CART`, antes dos mínimos.

Abra **CT06**, do Gift Card, e aponte ID, pré-condições/dados, passos, resultado esperado e prioridade. Há **16 casos formais** no documento; não é preciso ler todos.

### 05:30–07:00 | Executar e explicar os testes unitários

**Terminal B, raiz do projeto:**

```powershell
npm test
```

**Para que serve:** executa Jest sobre o domínio, sem depender do navegador nem do banco. O script da API usa `--runInBand`, executando a suíte sem paralelizar workers.

**Enquanto roda, mostre** `test.each` nos limites e o `now` fixo passado ao avaliador.

**Fala sugerida:**

> “Esses testes isolam as regras. O `test.each` executa a mesma verificação com vários valores de entrada, então uso testes parametrizados. O relógio é fornecido ao avaliador, deixando os testes de validade previsíveis. A asserção compara o resultado obtido com o esperado.”

**Como ler:** o registro versionado mostra **18 testes aprovados**. Confira a saída atual: `PASS`, `Tests: 18 passed, 18 total` e término sem erro. Um teste pode conter várias asserções; quantidade de testes não é quantidade de asserções.

**Se o professor pedir só os limites**, este comando opcional vai direto ao workspace da API, sem trocar de pasta:

```powershell
npm run test --workspace @ecommerce/api -- --testNamePattern="global boundary|specific boundary"
```

Espere **6 casos selecionados**. Os demais aparecem como ignorados pela seleção; isso não é uma aprovação da suíte inteira.

### 07:00–08:00 | Mostrar a integração real

**Terminal B, raiz do projeto:**

```powershell
npm run test:integration
```

**Para que serve:** testa HTTP, controllers/DTOs, serviços e acesso ao banco com NestJS, Supertest e Prisma. O banco precisa ter sido preparado antes.

**Tela:** [apps/api/test/quote.e2e-spec.ts](apps/api/test/quote.e2e-spec.ts). Apesar do nome `e2e-spec`, aqui esses arquivos são executados como **integração de API**, sem navegador.

**Fala sugerida:**

> “Agora verifico componentes funcionando juntos. Por exemplo, envio uma cotação com o ID do Headset e espero o preço cadastrado no backend. Se eu acrescentar um preço adulterado no payload, espero HTTP 400. Também verifico os mínimos, Gift Card, cupons inválidos e quantidades fora do intervalo.”

**Como ler:** o registro mostra **14 testes aprovados em 2 suítes**. Confira a execução atual. Uma rejeição esperada, como HTTP 400 no teste de payload inválido, faz o teste **passar** quando é esse o resultado previsto.

### 08:00–09:00 | Demonstrar E2E sem perder o tempo

**Opção principal:** mostre o relatório completo gerado no ensaio e [o registro remoto](evidence/logs/ci-remote.md). A suíte completa contém **14 testes** e usa Chromium com interface e API reais.

**Comando completo, executado antes da apresentação:**

```powershell
npm run test:e2e
```

**Fala sugerida:**

> “O E2E reproduz a jornada no navegador: adicionar produtos, aplicar cupom e conferir o total exibido. Neste caso, o teste E2E11 confirma que o Gift Card não aumenta o desconto. Assim verifico a integração da interface com a API.”

**Opcional ao vivo, somente se o ensaio mostrou que cabe no minuto:** no Terminal B, execute apenas E2E11 com o navegador visível:

```powershell
npm run test:e2e --workspace @ecommerce/web -- --grep "E2E11" --headed
```

O esperado dessa seleção é **1 teste aprovado**, não 14. Ela usa um contexto de navegador separado do carrinho manual. Se a execução exceder o tempo reservado, siga com a evidência preparada e não declare a tentativa atual aprovada sem resultado.

**Se Chromium estiver ausente ou não puder iniciar:** identifique a execução como **bloqueada por ambiente**. O repositório preserva uma tentativa local bloqueada e uma execução remota com **14/14 aprovados em Ubuntu e Windows**, cada uma com seu contexto. Não confunda o resultado histórico com uma nova execução local.

### 09:00–11:00 | TDD, Refactor e os dois defeitos

**Tela:** [docs/tdd-evidence.md](docs/tdd-evidence.md) e [docs/defect-reports.md](docs/defect-reports.md).

**Comece pela distinção correta:**

> “No TDD, primeiro escrevemos um teste que falha, depois implementamos o necessário para passar e então refatoramos mantendo os testes verdes. Nesta entrega, os três ciclos documentados são reproduções didáticas retrospectivas. A implementação original já existia; esses logs mostram execuções reais de mutações e restaurações, mas não comprovam que o desenvolvimento original seguiu TDD.”

**Mostre o ciclo 01 em detalhe:**

1. [RED](evidence/tdd/cycle-01/red.log): trocar `< 10000` por `<= 10000` rejeita indevidamente R$ 100,00; a suíte completa registrou **3 falhas**.
2. [GREEN](evidence/tdd/cycle-01/green.log): restaurar a comparação correta fez os **18 testes passarem**.
3. [REFACTOR](evidence/tdd/cycle-01/refactor.patch): extrair `calculateDiscountCents` organizou o cálculo sem mudar o comportamento; [a suíte continuou aprovada](evidence/tdd/cycle-01/refactor.log).

Resuma os outros dois: [ciclo 02](evidence/tdd/cycle-02/changes.md), filtrar produtos elegíveis e extrair `eligibleLines`; [ciclo 03](evidence/tdd/cycle-03/changes.md), corrigir `Math.floor` para `Math.round` e nomear `roundNonNegativeCents`. No arredondamento, 10% de R$ 100,05 produz R$ 10,005, arredondado para **R$ 10,01** de desconto.

**Defeitos controlados:**

- **D01:** comparação rejeitava o limite válido. O [log de falha filtrado](evidence/defects/d01/failure.log) tem **1 teste falhando**; o [restaurado](evidence/defects/d01/restored.log) tem **3 aprovados**. A contagem difere do ciclo 01 porque a seleção de testes é menor.
- **D02:** cálculo ignorava a exclusão. O [log de falha](evidence/defects/d02/failure.log) mostra desconto incluindo Gift Card e aceitação indevida de carrinho sem itens elegíveis; o [restaurado](evidence/defects/d02/restored.log) registra **2 aprovados**.
- Os relatórios trazem passos, esperado/obtido, **severidade alta** (impacto no cálculo) e **prioridade alta** (urgência de corrigir).

**Não aplique os patches de mutação ao vivo.** Mostre os arquivos de evidência: o código final contém a implementação restaurada. Uma suíte que detecta esses dois mutantes não prova que detecta todo defeito possível nem fornece uma pontuação geral de teste de mutação.

### 11:00–12:00 | Cobertura: o que significa

**Terminal B, raiz do projeto:**

```powershell
npm run test:coverage
```

**Para que serve:** executa os unitários com instrumentação de cobertura; os relatórios ficam em `apps/api/coverage`.

**Mostre:** tabela do terminal e `apps/api/coverage/lcov-report/index.html`, já aberto no ensaio. O [registro disponível](evidence/logs/coverage.log) mostra **100% de statements, funções e linhas; 96% de branches**.

**Fala sugerida:**

> “A cobertura indica que partes do código foram executadas pelos testes. Aqui ela mede o domínio, conforme `collectCoverageFrom` no Jest. Não representa a cobertura de todo o frontend, dos controllers ou do Prisma. Mesmo 100% de linhas não garante ausência de defeitos, qualidade das asserções nem todas as combinações de entrada. A cobertura de branches ajuda a enxergar caminhos de decisão ainda não exercitados.”

Leia os números da execução que estiver mostrando. Se diferirem do registro, apresente a diferença; não repita o número histórico como se fosse atual.

### 12:00–13:00 | Build, ferramentas e conclusão

**Mostrar, sem executar ao vivo:** resultado de `npm run build`, preparado antes, em [evidence/logs/build.log](evidence/logs/build.log) ou na saída do seu ensaio. O build compila API e frontend para produção; sucesso de compilação não substitui teste funcional.

Mostre também o [workflow](.github/workflows/ci.yml): ele instala dependências, prepara o banco e executa as verificações em **Ubuntu e Windows**. Na revisão deste roteiro, o [run 37849984956](https://github.com/Eroshla/Projeto-teste-de-software/actions/runs/37849984956), do commit `623f6b2`, terminou com sucesso nos dois sistemas. Esse é um resultado identificado por commit; para uma versão posterior, confira o run correspondente em [Actions](https://github.com/Eroshla/Projeto-teste-de-software/actions).

**Comparação curta de ferramentas:**

- **Playwright:** escolhido para interface/E2E, com navegador real e relatório.
- **Postman:** usaria para explorar requisições e respostas de API; a integração automatizada entregue usa **Supertest**.
- **k6:** usaria para carga e latência; testes de desempenho **não foram executados** nesta entrega.

**Encerramento sugerido:**

> “As verificações cobrem limites, elegibilidade, validade, arredondamento e a jornada do carrinho. Os defeitos controlados mostram exemplos de regressões que os testes detectam. As principais limitações são a cobertura restrita ao domínio, os ciclos TDD retrospectivos e a ausência de testes de carga e de segurança completos. Como melhorias, ampliaria os caminhos de decisão testados e mediria o desempenho da API.”

### 13:00–15:00 | Respostas para a arguição

**Por que escolheu esses valores-limite?** Porque as regras mudam exatamente em R$ 100 e R$ 200. Um centavo abaixo, o limite e um centavo acima ajudam a detectar erros como trocar `<` por `<=`.

**O que mudou no Refactor?** No ciclo 01, o cálculo foi extraído para `calculateDiscountCents`. A organização mudou; o resultado esperado foi preservado e os testes continuaram passando. Os três ciclos apresentados são retrospectivos.

**O que 100% de cobertura garante?** Que as linhas instrumentadas foram executadas naquela suíte. Não garante ausência de defeitos, requisitos corretos ou asserções suficientes; aqui o escopo medido é o domínio e branches ficou em 96% no registro.

**Por que dinheiro em centavos e percentual em basis points?** R$ 120 vira `12000`, e 10% vira `1000` basis points. O desconto é calculado por `eligibleSubtotalCents * percentageBps / 10000` e arredondado para centavos, evitando manter valores monetários fracionários ao longo da cotação.

**Por que o Gift Card conta no mínimo, mas não no desconto?** Porque são bases diferentes: as regras de mínimo usam o subtotal integral; o desconto usa somente os itens elegíveis. Exclusão prevalece quando um produto consta tanto na inclusão quanto na exclusão.

**Qual a diferença entre unidade, integração e E2E?** Unidade isola a regra; integração verifica os componentes da API com o banco; E2E verifica a jornada pelo navegador até o resultado mostrado.

## 3. Cola rápida dos comandos

Todos abaixo partem da **raiz do repositório**.

| Quando | Comando | Finalidade |
|---|---|---|
| Preparação | `npm ci` | Instalar versões do lockfile. |
| Preparação | `npx prisma generate --schema apps/api/prisma/schema.prisma` | Gerar cliente de banco. |
| Preparação | `npm run db:setup` | Migrations + seed. |
| Preparação, se necessário | `npm run db:seed` | Repetir dados conhecidos do catálogo/cupons. |
| Preparação | `npx playwright install chromium` | Disponibilizar navegador E2E. |
| Antes do cronômetro, Terminal A | `npm run dev` | Manter API e loja abertas. |
| 05:30, Terminal B | `npm test` | Unitários: regras isoladas. |
| 07:00, Terminal B | `npm run test:integration` | Integração HTTP + banco. |
| Ensaio; mostrar às 08:00 | `npm run test:e2e` | Jornada completa no navegador. |
| Opcional às 08:00, Terminal B | `npm run test:e2e --workspace @ecommerce/web -- --grep "E2E11" --headed` | Demonstrar só o caso Gift Card. |
| 11:00, Terminal B | `npm run test:coverage` | Medir cobertura do domínio. |
| Ensaio; mostrar às 12:00 | `npm run build` | Compilar API e web, com dev parado. |
| Preparação | `npm run typecheck` / `npm run lint` | Verificações estáticas; ambos usam TypeScript sem emissão neste projeto. |
| Preparação | `npm run report:pdf` | Gerar `reports/relatorio.pdf`. |
| Preparação | `npm run validate:fast` / `npm run validate` | Executar verificações agrupadas. |

**Interpretação:** `PASS`/aprovado significa que o resultado bateu com a asserção; `FAIL`/reprovado exige investigar a divergência; `BLOCKED` identifica impedimento de ambiente. Teste apenas listado, ignorado, interrompido ou ainda em execução não deve ser contado como aprovado. No PowerShell, `$LASTEXITCODE` logo após um comando npm informa o código de saída: normalmente `0` indica sucesso.

## 4. Plano B para problemas durante a fala

- **Servidor não responde:** confira o Terminal A e a configuração `.env`. Se não resolver rapidamente, mostre os testes e as evidências preparadas, identificando a indisponibilidade local.
- **Banco ou Prisma:** antes da apresentação, confira `DATABASE_URL`, execute a geração do Prisma Client e `npm run db:setup`. Não improvise apagando o banco ao vivo.
- **Porta ocupada:** antes do ensaio, pare o processo conhecido que usa 3000/3001. O Playwright reutiliza servidores existentes; não teste acidentalmente outra aplicação.
- **Chromium ausente:** instale na preparação. Durante a arguição, mostre o relatório do CI e marque a tentativa local como bloqueada.
- **Teste falhou ou resultado mudou:** leia a primeira divergência, explique esperado/obtido e não esconda a falha. Use o resultado anterior somente como evidência histórica identificada.
- **Pouco tempo:** mantenha `npm test` ao vivo e mostre integração, E2E, cobertura e build do ensaio. Reserve os dois minutos finais para perguntas.

## 5. Referência do projeto e da entrega

**Catálogo do seed:** Headset Gamer (R$ 120), Mouse Gamer (R$ 80), Teclado Mecânico (R$ 150), Webcam HD (R$ 99,99), Gift Card (R$ 60) e Mousepad (R$ 20).

**Cupons:** BEMVINDO10 (10%, mínimo R$ 100, exceto Gift Card), SUPER20 (20%, mínimo R$ 200, exceto Gift Card), GAMER15 (15% em Headset, Mouse e Teclado, mínimo integral R$ 100), VENCIDO30 (expirado) e DESATIVADO25 (inativo).

- [Relatório em PDF](reports/relatorio.pdf) e [fonte do relatório](reports/relatorio.md).
- [Matriz de conformidade acadêmica](docs/academic-compliance.md).
- [Regras de negócio](docs/business-rules.md), [plano de testes](docs/test-plan.md), [tabela de decisão](docs/decision-table.md) e [casos formais](docs/test-cases.md).
- [Execuções registradas](docs/test-execution.md), [evidências TDD retrospectivas](docs/tdd-evidence.md) e [relatórios dos defeitos](docs/defect-reports.md).
- [Arquitetura](docs/architecture.md), [decisões técnicas](docs/architecture-decisions.md) e [roteiro resumido complementar](docs/defesa-oral.md).
- [Logs e capturas](evidence/) e [GitHub Actions](https://github.com/Eroshla/Projeto-teste-de-software/actions).

Projeto publicado: **Projeto-teste-de-software**, trabalho acadêmico de Testes de Software.
