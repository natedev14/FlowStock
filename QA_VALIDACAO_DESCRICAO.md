# QA Manual — Validação de `Descrição` (Fase 1)

Este projeto não possui framework de testes unitários configurado (Vitest/Jest inexistentes no `package.json`), então esta cobertura foi registrada como QA manual sem adicionar dependências.

## 1) Casos de `parseDescricao`

Validar no app/ambiente local que o parser retorna os estados esperados:

1. `COR:Preto;TAMANHO:G`
   - status: `ok`
   - confidence: `high`
   - cor: `Preto`
   - tamanho: `G`
2. `Cor: Preto; Tamanho: G`
   - status: `ok`
   - confidence: `high`
3. `Cor: Preto / Tam: M`
   - cor: `Preto`
   - tamanho: `M`
4. `Preto - G`
   - status: `warning`
   - confidence: `medium`
   - detectedPattern: `inferred-dash`
5. `Preto/G`
   - status: `warning`
   - confidence: `medium`
   - detectedPattern: `inferred-slash`
6. `Blusa lisa premium`
   - status: `error`
   - confidence: `low`
7. string vazia
   - status: `error`
   - confidence: `low`
   - issue: `Descrição vazia.`
8. `COR:Preto;TAMANHO:UNICO`
   - tamanho normalizado: `ÚNICO`

## 2) Casos de `validateVariations`

1. Grupo com variações válidas
   - `errors.length === 0`
   - `ok.length > 0`
2. Grupo com descrição inválida (ex.: `Blusa lisa premium` em variação)
   - `errors.length > 0`
3. `childCode` inexistente no `indexByCode`
   - erro com issue: `Variação não encontrada no CSV.`

## 3) Bloqueio operacional de exportação

1. Carregar CSV com pelo menos uma variação inválida.
2. Confirmar aviso visual em PT-BR no resumo de validação.
3. Confirmar botão de exportação desabilitado.
4. Confirmar mensagem: `Corrija os erros do CSV antes de exportar.`

## 4) Decisão de 1 produto por CSV

1. Carregar CSV com 2+ produtos pai.
2. Confirmar bloqueio em `validateRows` com mensagem:
   - `Este arquivo contém X produtos pai. Para evitar erros no estoque, o FlowStock trabalha com 1 produto por CSV. Exporte ou carregue apenas um produto por vez.`
3. Confirmar que não há fluxo ativo com seletor de múltiplos pais.
