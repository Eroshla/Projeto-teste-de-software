# Ciclo 02 — exclusão do Gift Card

Reprodução didática retrospectiva, executada em branch de correção.

- RED: mutação removeu o filtro `line.eligible`; o teste misto Headset + Gift Card passou a incluir o Gift Card no desconto.
- GREEN: restauração do filtro; os testes de inclusão/exclusão voltaram a passar.
- REFACTOR: linhas elegíveis foram extraídas para `eligibleLines`, sem mudar o resultado.
- Patches: `red.patch`, `green.patch` e `refactor.patch`.
