# Transfer Manifest - convencoes portadas do SGE/jmr26

Inventario do que foi trazido do projeto **jmr26 (SGE)** para
**alta-performance-care** e como cada item foi adaptado. Texto em ASCII (convencao de
docs/). Data da transferencia: 2026-06-30.

## Contexto

- **Origem:** jmr26 (Next.js 16 + MongoDB + Mongoose + NextAuth) - sistema de eventos.
- **Destino:** alta-performance-care (Vite + TanStack Start + React 19 + Tailwind v4 +
  Supabase + shadcn/ui) - site de marca + sistema clinico de nutricao.
- **Estrategia:** adaptar cada regra ao stack do destino. Regras coladas a subsistemas
  que **nao existem** aqui (admin RBAC, 4 templates de landing, wizard de inscricao,
  relatorios) foram **adiadas** ou **descartadas**, em vez de portadas "no vacuo"
  (principio YAGNI, presente no proprio CLAUDE.md).

Status possiveis: **PORTADO** (quase 1:1), **ADAPTADO** (reescrito p/ o stack),
**NOVO** (criado do zero p/ o destino), **ADIADO** (subsistema ainda nao existe),
**DESCARTADO** (especifico do SGE).

## 1. Regras (`.claude/rules/`)

| Arquivo no destino | Origem (jmr26) | Status | Adaptacao |
|--------------------|----------------|--------|-----------|
| `refactoring.md` | `refactoring.md` | PORTADO | Repo -> `ryaniantonio/alta-performance-care`; ciente das camadas |
| `issue-prompts.md` | `issue-prompts.md` | ADAPTADO | Stack do prompt Backend -> TanStack Start + Supabase |
| `pt-br-content.md` | `pt-br-content.md` + `ui-language.md` | ADAPTADO | Os dois consolidados em um arquivo |
| `documentation.md` | `documentation.md` | ADAPTADO | docs/ como fonte de verdade; aponta p/ catalog e manifest |
| `component-reuse.md` | `component-reuse.md` | ADAPTADO | shadcn/ui; pastas ui/site/admin; catalogo do destino |
| `plural-singular.md` | `plural-singular.md` | ADAPTADO | Aponta p/ `@/lib/pluralize` (helper criado) |
| `no-native-dialogs.md` | `no-native-dialogs.md` | ADAPTADO | `useConfirm` (hook criado) + `sonner`; sem PasswordConfirmDialog |
| `timezone-dates.md` | `timezone-dates.md` | ADAPTADO | date-fns; foco em `appointments.scheduled_at`; enxuto |
| `testing.md` | `testing.md` | ADAPTADO | Vitest + Testing Library; avisa que o tooling ainda nao existe |
| `data-access.md` | `api-routes.md` (espirito) | NOVO | Camadas reais: hook/server-fn -> service -> repository -> Supabase; RLS como auth |
| `supabase-schema.md` | `database-models.md` (espirito) | NOVO | migrations + RLS obrigatoria + regerar types.ts |
| `ui-components.md` | `admin-ui.md` | ADAPTADO | shadcn/ui, cn(), Form*+zod, Tooltip top, AdminShell/PageHeader; removido DataTable/PermissionGate/EventContext etc |

### Regras NAO trazidas

| Regra (jmr26) | Status | Motivo |
|---------------|--------|--------|
| `admin-breadcrumbs.md` | ADIADO | Sem componente Breadcrumbs/PageHeader hierarquico hoje (candidata futura: rotas admin aninhadas ja existem) |
| `feature-registration.md` | ADIADO | Sem search-registry nem matriz RBAC; auth e RLS por `user_id` |
| `registration-flow-protected.md` | ADIADO | Sem fluxo publico de inscricao/checkout |
| `report-printing.md` | ADIADO | Sem central de relatorios (candidata futura: impressao de plano/prescricao) |
| `city-state-fields.md` | ADIADO | Sem captura de cidade/estado (sem componentes IBGE) |
| `landing-templates.md` | DESCARTADO | Sistema de 4 templates de landing e exclusivo do SGE |
| `api-routes.md` | ADAPTADO (fundido) | Espirito absorvido por `data-access.md` |
| `database-models.md` | ADAPTADO (fundido) | Espirito absorvido por `supabase-schema.md` |
| `admin-ui.md` | ADAPTADO (renomeado) | Virou `ui-components.md` |
| `ui-language.md` | ADAPTADO (fundido) | Consolidado em `pt-br-content.md` |

## 2. CLAUDE.md

**MESCLADO.** O `CLAUDE.md` que ja existia no destino (regras de ouro: issue-first,
branch flow `preview->main` ff-only, conventional commits) foi **preservado** e
recebeu: Persona, Padroes de Codigo (early-return, sem `any`, async/await),
Principios (Clean Code/Architecture/DRY/YAGNI - alinhados as camadas existentes),
Datas/Timezone, "sem referencia a IA nos commits", e a tabela de Comandos.

## 3. Personas (`.agents/`)

**PORTADO** (verbatim): `AN_AGENT.md`, `DEV_AGENT.md`, `LT_AGENT.md`, `PM_AGENT.md`,
`QA_AGENT.md`. Sao genericas (curso externo), acionadas manualmente, nao auto-carregadas.

## 4. Prompts senior (`docs/prompts/`)

**ADAPTADO:** `prompts-design-backend-senior.md` - prompt UX quase intacto; prompt
Backend com stack TanStack Start + Supabase, integracoes Supabase Auth/Lovable OAuth/
TanStack Query, testes em Vitest.

## 5. Catalogo de componentes (`docs/components-catalog.md`)

**NOVO (starter):** inventario inicial dos primitivos shadcn (`src/components/ui`),
componentes de site (`src/components/site`), admin (`src/components/admin`) e helpers,
com tabela "Atalho por necessidade". Manter atualizado ao criar reutilizaveis
(ver `component-reuse.md`).

## 6. Helpers de codigo (`src/`)

| Arquivo | Status | Nota |
|---------|--------|------|
| `src/lib/pluralize.ts` | NOVO | `pluralize` / `formatPlural` pt-BR; suporta `plural-singular.md` |
| `src/hooks/use-confirm.tsx` | NOVO | Confirmacao promise-based sobre o `AlertDialog`; suporta `no-native-dialogs.md` |

Ambos passam no `npm run typecheck` (type-clean).

## 7. Config

| Arquivo | Mudanca |
|---------|---------|
| `package.json` | Adicionado script `typecheck` (`tsc --noEmit`) - gate de tipos que o `build` (vite) nao fazia |
| `.gitignore` | Ignora estado local do Claude (`settings.local.json`, `plans/`, `worktrees/`, lock); mantem `rules/` e `settings.json` versionados |

## 8. Setup da IDE (out-of-repo)

| Arquivo | Status |
|---------|--------|
| `docs/SETUP-CLAUDE-CODE.md` | NOVO - manual do split in-repo vs por-maquina + passo a passo do outro dev |
| `scripts/setup-claude-code.ps1` | NOVO - bootstrap Windows |
| `scripts/setup-claude-code.sh` | NOVO - bootstrap macOS/Linux/Git Bash |

## 9. Pendencias e proximos passos

- **`.claude/settings.json`** ainda **nao foi gravado** (a criacao automatica de um
  arquivo de permissoes foi bloqueada pelo classificador de seguranca). Conteudo
  recomendado documentado em `docs/SETUP-CLAUDE-CODE.md` secao 4 - gravar apos
  aprovacao explicita.
- **Typecheck pre-existente vermelho:** `npm run typecheck` acusa **8 erros** em
  `src/routes/_authenticated/admin.pacientes.$patientId.tsx` (campo JSONB `alerts`
  tipado como `Json` e usado como `{kind,label}[]`). Sao **pre-existentes** (o `build`
  via Vite nunca rodou `tsc`) e **independentes** desta transferencia. Recomenda-se uma
  issue para tipar/normalizar `patient_records`/`alerts`.
- **Testes:** o tooling (Vitest + Testing Library + jsdom) ainda nao foi instalado; a
  primeira task de teste o instala (ver `testing.md`).
