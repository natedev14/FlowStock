# FlowStock

Aplicação web estática para **contagem visual de estoque** de produtos de moda usando CSVs exportados do Bling ERP.

> Status: alinhamento de documentação para **FlowStock v2 (Fase 0)**.

## Visão do FlowStock v2

O FlowStock v2 prioriza um fluxo **mobile-first** para operação de estoque com baixo risco no reenvio para o Bling.

Fluxo alvo:

```txt
CSV do Bling (1 produto pai)
  ↓
Validação de estrutura + descrição
  ↓
Cards grandes por cor
  ↓
Editor de quantidades por tamanho
  ↓
Salvar e próximo
  ↓
Revisão e exportação CSV
```

A experiência “matriz Color × Talla” deixa de ser o fluxo principal final e passa a ser parte de legado/transição.

## Decisões de produto v2

- **UI visível em PT-BR**: botões, rótulos, mensagens e feedbacks para operação devem estar em português brasileiro.
- **1 produto pai por CSV**: v2 não suporta múltiplos produtos pai no mesmo arquivo de trabalho.
- **UX principal**: cards por cor + editor por tamanho, com foco em uso em telas estreitas.
- **Validação forte de `Descrição`**: parsing deve gerar erros/avisos explícitos; não agrupar silenciosamente variações críticas.
- **Pós-exportação sem reset automático**: após exportar, a app deve manter contexto, mostrar sucesso e permitir baixar novamente, continuar editando ou carregar novo CSV.
- **Zerar estoque (futuro)**: ação destrutiva com confirmação clara; não deve ser ação principal.
- **Nome recomendado de exportação**:

```txt
flowstock_estoque_[CODIGOPAI]_[YYYY-MM-DD]_[HHMM].csv
```

## Funcionalidades atuais (estado do projeto)

- Carga de CSV exportado do Bling.
- Validação de colunas mínimas.
- Agrupação de produto pai e variações.
- Fluxo visual de seleção/edição (inclui componentes legados/parciais).
- Exportação CSV compatível com Bling.
- Processamento 100% local no navegador.

## Stack

- **Build**: Vite
- **Framework**: Preact + TypeScript
- **Estado**: Zustand
- **CSV**: PapaParse
- **Validação**: Zod
- **Estilos**: Tailwind CSS
- **PWA**: vite-plugin-pwa
- **Deploy**: GitHub Pages + GitHub Actions

## Setup local

```bash
npm install
npm run dev      # desenvolvimento local em http://localhost:5173
npm run build    # gera dist/
npm run preview  # serve dist/ localmente
```

## Regras atuais de exportação CSV

Enquanto a transição para v2 está em andamento, permanecem as regras atuais:

- Preserva ordem original de colunas via `meta.fields`.
- Preserva ordem original de linhas.
- Exporta com delimitador `;`.
- Usa `quotes: true`.
- Usa `\r\n` como quebra de linha.
- Adiciona BOM UTF-8 no início.
- Altera apenas a coluna `Estoque`.
- Exporta `Estoque` em formato compatível com Bling (`10,00`, `0,00`, etc.).

## Formato esperado do CSV

Colunas mínimas:

```txt
Código
Código Pai
Descrição
Estoque
URL Imagens Externas
```

## Segurança operacional (v2)

Riscos críticos que devem ser evitados nas próximas fases:

- Misturar múltiplos produtos pai no mesmo CSV.
- Exportar com variações críticas sem cor/tamanho identificados.
- Tratar linhas problemáticas de `Descrição` sem aviso.
- Perder estado após exportação por reset automático.

## Fora de escopo nesta fase

Esta fase é **somente documentação e alinhamento de escopo**.

- Sem mudanças em código funcional.
- Sem alterações em `src/`.
- Sem alteração de lógica de CSV/store/validação.
- Sem novos componentes.
- Sem mudanças em `package.json`, `vite.config.ts` e workflows.

## Próximas fases

1. **Fase 1**: contratos de domínio + validação forte de `Descrição` + bloqueios de exportação crítica.
2. **Fase 2**: UX mobile-first por cor/tamanho com “Salvar e próximo”.
3. **Fase 3**: fluxo pós-exportação com estado de sucesso e “mudanças não exportadas”.
4. **Fase 4**: ações destrutivas de zerar estoque com confirmação forte.
5. **Fase 5**: limpeza de legado e estabilização do fluxo final v2.

## Deploy

Deploy automático no GitHub Actions ao fazer push em `main`.

Workflow:

```txt
.github/workflows/deploy.yml
```

URL pública atual:

```txt
https://natedev14.github.io/gissary-stock-editor/
```


## Nota sobre legado multiproduto

- O componente `ParentSelector` é legado/futuro e não faz parte do fluxo ativo do FlowStock v2.
- No v2, o fluxo oficial é 1 produto pai por CSV.


## Fase 3 — Ciclo pós-exportação

- A sessão não é resetada automaticamente após exportar.
- A app exibe uma tela de sucesso com ações: baixar novamente, continuar editando e carregar novo CSV.
- Se houver edição após exportação, a sessão entra em estado de mudanças não exportadas e exibe aviso no editor.


## Fase 4 — Galeria de cores (base UX mobile-first)

- Introduz `ColorGalleryScreen`, `ColorCard` e a utilidade `buildColorGroups`.
- A matriz (`StockMatrix`) continua como transição/legado nesta fase.
- A edição dedicada por tamanho ficará para a Fase 5.


## Fase 5 — Contagem por cor/tamanho e fluxo guiado

- Introduz `ColorCountScreen`, `SizeStepper` e `ReviewExportScreen`.
- O fluxo principal agora permite `Salvar e próximo` entre cores.
- `StockMatrix` continua disponível como legado/transição.
- `Zerar estoque` permanece fora do escopo nesta fase.
