# Registro de decisões

- SQLite foi escolhido por portabilidade local e seeds determinísticos.
- O domínio não importa Prisma/NestJS para permitir testes rápidos e relógio fixo.
- O frontend persiste somente IDs e quantidades para evitar confiança em preços adulteráveis.
- A lista de cupons utiliza datas UTC e omite cupons inativos/expirados.
