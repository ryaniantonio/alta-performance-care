---
paths:
  - "src/**/*"
  - "supabase/migrations/**/*.sql"
---

# Prompts de Implementação em Issues

Toda issue de refatoração ou feature criada no repositório deve incluir uma seção **"Prompt de implementação"** ao final do corpo, referenciando o(s) prompt(s) sênior do projeto em [docs/prompts/prompts-design-backend-senior.md](../../docs/prompts/prompts-design-backend-senior.md).

O objetivo é garantir que quem for implementar (humano ou agente) ative o **persona correto** (Product Designer Senior, Software Engineer Senior) e siga critérios consistentes de qualidade.

## Quando incluir cada prompt

| Tipo de mudança | Prompt(s) a referenciar |
|-----------------|--------------------------|
| Componente / rota / fluxo (visual) — `src/components/**`, `src/routes/**` | UX/UI Design Senior |
| Service / repository / server function / migração / RLS — `src/services/**`, `src/infrastructure/**`, `src/lib/*.functions.ts`, `supabase/migrations/**` | Backend Software Engineer Senior |
| Rota completa, módulo end-to-end, feature nova | **Ambos** (UX antes de Backend, conforme orientação do prompt) |
| Documentação pura, limpeza de docs, decisões de branch | Nenhum (não aplicável) |

## Estrutura obrigatória da seção

Adicionar ao final do corpo da issue:

```markdown
## Prompt de implementação

Ao iniciar esta issue, ativar o(s) seguinte(s) prompt(s) de docs/prompts/prompts-design-backend-senior.md:

- **UX/UI Design Senior** — Product Designer + Especialista em Design System Senior. Foco: Clean UI, mobile-first, acessibilidade WCAG 2.2 AA, todos os estados (Default/Hover/Active/Focus/Disabled/Loading/Empty/Error/Success), tokens de design (Tailwind v4 + shadcn/ui new-york), responsividade sm→xl. Saída esperada: hierarquia visual + tokens + mapa de estados + guia de a11y + (quando rota) wireframe textual.

  **Contexto desta issue:** [PREENCHER — escopo, nome, objetivo, público]

- **Backend Software Engineer Senior** — Engenheiro de Software Backend Senior + Arquiteto de Sistemas. Foco: Performance/Escalabilidade/Clean Code, SOLID, Clean Architecture (a separação rota → hook React Query → service → repository → Supabase já existe — reforçar, não contornar), resiliência (idempotência, retry), segurança (RLS por `user_id`, validação Zod nas fronteiras, OWASP), Early Return, sem `any`, async/await com try/catch, mensagens em pt-BR / código em inglês. Saída esperada: lógica + diagrama de camadas + implementação de referência (Vite + TanStack Start + TypeScript + Supabase/Postgres + RLS) + estratégia de testes (Vitest, unit + integração) + observabilidade.

  **Contexto desta issue:** [PREENCHER — stack, integrações (Supabase Auth, Lovable OAuth, TanStack Query), modelo de execução]
```

Adaptar:
- Listar **apenas** o(s) prompt(s) relevante(s) (omitir o outro)
- Preencher os blocos `[PREENCHER ...]` com o contexto específico da issue
- Quando ambos: mencionar a ordem ("rodar UX antes de Backend para evitar que decisões técnicas limitem UX")

## Por que esta regra existe

Sem ela, issues viram listas de tarefas neutras e cada implementação adota um padrão diferente. Com ela, qualquer pessoa que pegue a issue já sabe **com que mentalidade** abordar o problema, garantindo qualidade consistente em UX e código — e, principalmente, que a arquitetura em camadas existente (rota → service → repository → Supabase, com a fronteira de segurança na RLS) seja respeitada em vez de curto-circuitada.

## Relação com outras regras

- [refactoring.md](refactoring.md) — toda refatoração não trivial deve começar criando uma issue, que por sua vez segue esta regra.
- [issue-prompts.md](issue-prompts.md) e o prompt sênior são a fonte da mentalidade; [testing.md](testing.md) define a cobertura mínima (Vitest) que a saída do prompt Backend deve produzir.
