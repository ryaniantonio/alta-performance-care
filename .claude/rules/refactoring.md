---
paths:
  - "src/**/*"
---

# Refatoração

## Regra geral

**Toda refatoração não trivial deve começar com a criação de uma issue no GitHub.**

A regra de ouro "issue antes de qualquer trabalho relevante" já está no
[CLAUDE.md](../../CLAUDE.md); este arquivo detalha **quando** a issue é obrigatória
e **o que** ela precisa conter para uma refatoração.

A issue serve como o "contrato" da refatoração: registra escopo, motivação e
progresso. Sem isso, refatorações abandonadas no meio do caminho viram lixo
invisível no repositório.

## Quando criar issue

Criar issue obrigatoriamente quando:

- A refatoração toca mais de um arquivo
- Há uma migração de padrão (ex: trocar componente A por B em várias rotas, mover
  lógica de uma rota para um `*.service.ts` ou `*.repository.ts`)
- Existe nome conhecido para o padrão alvo (ex: "extrair helper", "consolidar
  duplicação", "renomear DTO público em `src/domain/clinical/types.ts`")
- A mudança será feita em fases / vários commits
- O trabalho pode ser interrompido e retomado por outra pessoa (ou pelo mesmo dev
  em outra sessão)

Dispensável apenas para mudanças triviais e auto-contidas (renomear variável local,
extrair função pequena dentro de um único arquivo, ajuste de texto/conteúdo).

## O que a issue deve conter

1. **Título** no formato `refactor(escopo): descrição curta`
2. **Motivação** — por que vale o esforço
3. **Escopo** — lista de arquivos / locais afetados, deixando claro a qual camada
   pertence (rota em `src/routes/`, hook em `src/hooks/`, regra de negócio em
   `src/services/`, query em `src/infrastructure/repositories/`, server function em
   `src/lib/*.functions.ts`)
4. **Critérios de conclusão** — como saber que terminou (checklist marcável)
5. **Label** `refactor` (criar se não existir)
6. **Prompt de implementação** — referência ao(s) prompt(s) sênior conforme
   [issue-prompts.md](issue-prompts.md) (UX e/ou Backend)

## Convenções de branch e PR

- Branch: `refactor/<numero-da-issue>-<slug-curto>` (ex:
  `refactor/42-patients-repository`)
- Encerrar a issue com *closing keyword* (`Closes #<numero>`): no corpo do PR
  **ou**, no fluxo direto-na-`preview` (sem PR), no footer do commit. Só
  `(#<numero>)` cria menção, não fecha. A keyword só dispara o fechamento ao chegar
  na branch default (`main`) — ver seção "Regras de ouro" em
  [CLAUDE.md](../../CLAUDE.md).
- Se a refatoração for em fases, criar uma issue **por fase** (ou usar checklist na
  issue principal, marcando cada fase ao mergear seu PR).

## Quando o usuário pedir refatoração

Antes de tocar em código:

1. Confirmar escopo com o usuário (se ambíguo)
2. Criar a issue via `gh issue create` no repositório
   `ryaniantonio/alta-performance-care` (incluir motivação, escopo, critérios)
3. Criar branch referenciando a issue
4. Só então começar a implementação

Se o usuário disser "refatora X" e a issue não existir, **avisar e propor criar
antes de codar**. Não começar refatoração sem rastreamento.

## Por que esta regra existe

A arquitetura em camadas do projeto (rotas → hooks → services → repositories →
Supabase) só se mantém limpa se cada movimento de código for deliberado e
rastreável. Refatoração sem issue tende a vazar responsabilidades entre camadas,
parar no meio e deixar duas formas do mesmo padrão convivendo. A issue força a
decisão de escopo antes do diff e dá um ponto de retomada quando o trabalho é
interrompido.

## Relação com outras regras

- [issue-prompts.md](issue-prompts.md) — toda issue de refatoração referencia os
  prompts sênior de implementação (UX e/ou Backend).
- [component-reuse.md](component-reuse.md) — antes de extrair/criar componente numa
  refatoração de UI, consultar o catálogo e reusar o que já existe.
