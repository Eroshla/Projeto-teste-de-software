# D02 — exclusões ignoradas

Mutação aplicada somente durante a execução: o subtotal elegível foi calculado sobre todas as linhas, sem filtrar `eligible`. Os testes do carrinho misto e do carrinho contendo somente Gift Card detectaram o desconto incorreto. A implementação foi restaurada e os mesmos testes passaram.
