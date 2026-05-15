# ARQUITETURA_V2 — FlowStock

## 1) Visão de produto (FlowStock v2)

FlowStock v2 é uma aplicação web estática para **contagem visual de estoque** a partir de CSV exportado do Bling ERP, com foco em **fluxo mobile-first real** (uso confortável em 360px), segurança operacional e reimportação confiável.

A experiência principal deixa de ser uma matriz geral e passa a ser um fluxo guiado por cor:

1. carregar CSV
2. validar CSV
3. ver cards grandes por cor
4. tocar em uma cor
5. editar quantidades por tamanho
6. salvar e ir para a próxima cor
7. revisar e exportar CSV

---

## 2) Decisões oficiais de produto (congeladas para v2)

### 2.1 UI visível em português brasileiro
- Todo texto visível ao usuário final deve estar em **PT-BR**.
- Documentação técnica para dev pode continuar em espanhol/português, mas labels, botões, mensagens e feedbacks da UI devem ser PT-BR.

### 2.2 Escopo de CSV: 1 produto pai por arquivo
- O v2 trabalha com **1 produto pai por CSV**.
- Não será suportado fluxo com N produtos pai no mesmo CSV nesta versão.
- Motivo: reduzir risco operacional no ciclo de edição/reimportação no Bling.

### 2.3 UX principal mobile-first
- Fluxo principal: **cards por cor + editor por tamanho**.
- A matriz Color × Talla deixa de ser experiência principal final.
- Layout e toques devem priorizar uso com uma mão e leitura rápida em tela estreita.

### 2.4 Validação forte de `Descrição`
- A interpretação de `Descrição` é crítica para mapear `cor` e `tamanho`.
- Parser deve retornar erros e avisos explícitos, não silenciosos.
- É proibido agrupar automaticamente variações problemáticas como “Sem cor / ÚNICO” sem alerta operacional.

### 2.5 Fluxo pós-exportação
- A app **não deve resetar automaticamente** após exportar.
- Deve exibir estado/tela de sucesso com opções claras:
  - baixar novamente
  - continuar editando
  - carregar novo CSV
- Se houver edição após exportação, deve sinalizar “há mudanças não exportadas”.

### 2.6 Zerar estoque (futuro)
- Funcionalidade futura para:
  - zerar estoque da cor
  - zerar estoque do produto
- É ação destrutiva: exige confirmação explícita e botão destrutivo.
- Não pode ser CTA primária da tela.

### 2.7 Nome do arquivo exportado
Formato recomendado:

```txt
flowstock_estoque_[CODIGOPAI]_[YYYY-MM-DD]_[HHMM].csv
```

---

## 3) Riscos operacionais que o v2 deve evitar

1. **Mistura de múltiplos produtos pai no mesmo arquivo de trabalho**.
2. **Exportação com variações sem cor/tamanho resolvidos**.
3. **Agrupamento silencioso de linhas inválidas de `Descrição`**.
4. **Perda de contexto após exportar** por reset automático.
5. **Ação destrutiva sem confirmação** (zerar estoque).
6. **UI não consistente em PT-BR**, gerando ambiguidades para operação.

---

## 4) Arquivos sensíveis (não alterar nesta fase) e motivo

- `src/lib/csv.ts`
  - Núcleo de parse/export CSV; impacto direto em compatibilidade com Bling.
- `src/store/useStockStore.ts`
  - Estado global de edição/sessão; alterações podem quebrar fluxo de contagem.
- `src/schema.ts`
  - Regras de validação de colunas e entrada; mudanças afetam bloqueios de segurança.
- `src/lib/parseDescricao.ts`
  - Interpretação de `Descrição` para cor/tamanho; alto risco operacional.
- `src/components/StockMatrix.tsx`
  - Componente legado/parcial da experiência de matriz; alvo de transição nas fases futuras.
- `src/components/ParentSelector.tsx`
  - Fluxo atual de seleção de produto; deve ser revisado apenas em fase funcional específica.

---

## 5) O que NÃO deve ser tocado na Fase 0

Fase 0 é somente alinhamento documental.

- Não alterar código funcional.
- Não alterar nada em `src/`.
- Não alterar `package.json`.
- Não alterar `vite.config.ts`.
- Não alterar workflows do GitHub Actions.
- Não implementar componentes novos.
- Não alterar lógica de CSV, store ou validações.

---

## 6) Diretrizes visuais de referência para implementação futura

- Mobile-first real (base 360px).
- Alvos de toque mínimos de 44px.
- Ações principais em ~60px.
- Fundo neutro + cards brancos.
- Cores funcionais:
  - azul: ação primária
  - verde: editado/revisado
  - âmbar: pendência
  - vermelho: erro/destrutivo
- Tipografia de sistema.
- Animações apenas funcionais: feedback de tap, micro-pop de número, confirmação curta ao salvar.

---

## 7) Roadmap resumido (fases futuras)

### Fase 1 — Contratos de domínio e validação
- Definir contrato explícito para “1 produto pai por CSV”.
- Endurecer validação de `Descrição` com classificação de erro/aviso.
- Bloquear exportação com pendências críticas.

### Fase 2 — Fluxo de UI mobile-first
- Tela/lista de cores com cards grandes e status.
- Editor por tamanho com ação “Salvar e próximo”.
- Ajustes de acessibilidade e toque.

### Fase 3 — Pós-exportação e estados de revisão
- Tela de sucesso pós-export.
- Estado de “mudanças não exportadas” após nova edição.
- Ações: baixar novamente, continuar, carregar novo CSV.

### Fase 4 — Ações destrutivas controladas
- Zerar estoque da cor/produto com confirmação forte.
- Guardrails visuais e logs de intenção no estado local.

### Fase 5 — Limpeza de legado e estabilização
- Rebaixar/remover matriz como fluxo principal.
- Revisar componentes legados (`StockMatrix`, `ParentSelector`).
- Hardening final para operação recorrente.


## 8) Atualização da Fase 3 (implementada)

- Estado pós-exportação adicionado no store para rastrear exportação, arquivo e alterações posteriores.
- Exportação agora leva a uma tela de sucesso sem reset automático da sessão.
- Edições após exportação marcam estado `dirty_after_export` com aviso visível no editor.


## 9) Atualização da Fase 4 (implementada)

- Base da UX mobile-first iniciada com galeria de cards por cor.
- Lógica de agrupamento por cor/tamanho extraída para `buildColorGroups`.
- `StockMatrix` permanece como legado/transição até a Fase 5, quando entra o editor dedicado por tamanho.


## 10) Atualização da Fase 5 (implementada)

- Entrada principal por galeria de cores agora abre contagem dedicada por cor/tamanho.
- Fluxo guiado implementado com ação `Salvar e próximo` e fechamento em revisão/exportação.
- `StockMatrix` segue como fallback legado; ações destrutivas continuam para fase futura.
