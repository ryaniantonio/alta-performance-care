---
paths:
  - "docs/**"
  - "supabase/migrations/**"
  - "supabase/config.toml"
  - "src/integrations/supabase/**"
  - "src/routes/**"
  - "src/services/**"
  - "src/infrastructure/**"
  - "src/lib/**/*.functions.ts"
  - "src/domain/**"
---

# Manutenção da Documentação

A pasta `docs/` é a **fonte de verdade técnica** do sistema. Quando uma mudança
altera arquitetura, schema, autenticação, rotas ou contratos de dados, a
documentação correspondente em `docs/` **deve** ser atualizada **no mesmo commit**.
Código sem doc atualizada vira conhecimento que mora só na cabeça de quem escreveu
— e some no próximo handoff.

## Documentos existentes

| Documento | Papel |
|-----------|-------|
| `docs/components-catalog.md` | Catálogo dos componentes reutilizáveis (consultado **antes** de criar qualquer componente — ver (component-reuse.md)). |
| `docs/TRANSFER-MANIFEST.md` | Manifesto de transferência/handoff do projeto (inventário do que existe e onde). |

> Quando a base crescer a ponto de o handoff e o catálogo não bastarem, **criar
> `docs/system-documentation.md`** como visão técnica única do sistema (modelo de
> dados, RLS, auth, rotas, server functions, serviços). Até lá, manter os dois
> documentos acima vivos é o suficiente.

## Quando atualizar

Atualize `docs/` sempre que a mudança afetar:

- **Schema / RLS do Supabase**: nova tabela, coluna renomeada/removida, mudança em
  `CHECK`/`UNIQUE`, nova `POLICY`, novo `index`, novo trigger
  ([`supabase/migrations/**`](../../supabase/migrations)). As três tabelas atuais —
  `patients`, `appointments`, `patient_records` — têm RLS `USING (auth.uid() =
  user_id)`; qualquer tabela nova segue o mesmo isolamento por `user_id` e isso
  precisa estar documentado.
- **Autenticação**: mudança no fluxo Supabase Auth (JWT em `localStorage`), na guarda
  de rota ([`src/routes/_authenticated/route.tsx`](../../src/routes/_authenticated/route.tsx)),
  no middleware de servidor
  ([`requireSupabaseAuth`](../../src/integrations/supabase/auth-middleware.ts)) ou no
  OAuth Lovable. A fronteira **real** de segurança é a RLS por `user_id` — não há
  RBAC/papéis; documente isso explicitamente para não induzir alguém a procurar
  matriz de permissão que não existe.
- **Rotas**: nova rota sob [`src/routes/**`](../../src/routes) (file-based TanStack
  Router; `$` = segmento dinâmico, `_authenticated` = área logada). O
  `routeTree.gen.ts` é **auto-gerado** — não documentar o arquivo gerado, e sim a
  rota e seu propósito.
- **Server functions**: novo `createServerFn` com `.inputValidator(zod)` e
  `.middleware([requireSupabaseAuth])` em
  [`src/lib/**/*.functions.ts`](../../src/lib/profile.functions.ts) — contrato de
  entrada/saída e quem pode chamar.
- **Camadas de dados**: mudança de contrato em
  [`src/services/**`](../../src/services) (lógica de negócio),
  [`src/infrastructure/repositories/**`](../../src/infrastructure/repositories)
  (queries diretas) ou nos hooks React Query
  ([`src/hooks/clinical/usePatients.ts`](../../src/hooks/clinical/usePatients.ts)).
- **DTOs / tipos de domínio**: mudança em
  [`src/domain/clinical/types.ts`](../../src/domain/clinical/types.ts) ou no
  `Database` auto-gerado
  ([`src/integrations/supabase/types.ts`](../../src/integrations/supabase/types.ts)).
- **Componentes reutilizáveis**: ao criar/promover um componente reutilizável,
  atualizar `docs/components-catalog.md` no mesmo commit (ver (component-reuse.md)).
- **Features novas**: qualquer página/seção nova (pública em
  [`src/components/site`](../../src/components/site) ou admin em
  [`src/routes/_authenticated`](../../src/routes/_authenticated)) entra na
  documentação relevante.

## Como atualizar

1. Edite a seção certa do documento — não duplique conteúdo entre `docs/`.
2. Mantenha a **estrutura e o estilo** já usados no arquivo (tabelas, blocos de
   código, headings).
3. **Conteúdo em `docs/` é ASCII, sem acento** (convenção de documentação): escreva
   `descricao`, `inscricao`, `pre-requisito` — nunca `descrição`. Esta convenção
   vale **apenas** para arquivos sob `docs/`; regras em `.claude/rules/` (como esta)
   seguem pt-BR com acento (ver (pt-br-content.md)).
4. Descrições **concisas e factuais** — sem texto de enchimento.
5. Atualize **contagens e métricas** (nº de tabelas, rotas, componentes do catálogo)
   quando mudarem de forma relevante.

## Por que esta regra existe

Este projeto não tem gate de tipo no build (`vite build` não roda `tsc`) nem suíte
de testes — então a documentação é, na prática, a única rede que descreve o
contrato entre camadas (rota → service → repository → Supabase) e o modelo de
segurança (RLS por `user_id`). Doc desatualizada aqui custa mais caro do que num
projeto com CI forte: é o único registro confiável do "porquê" e do "como".

## Relação com outras regras

- (component-reuse.md) — `docs/components-catalog.md` é consultado e mantido por
  aquela regra; esta regra exige a atualização no mesmo commit.
- (supabase-schema.md) — toda mudança de schema/RLS já segue o padrão de migration;
  esta regra adiciona a obrigação de refletir no `docs/`.
- (data-access.md) — contratos entre service/repository/hook documentados quando
  mudam.
- (refactoring.md) / (issue-prompts.md) — refator não trivial nasce de uma issue;
  o fechamento da issue inclui atualizar a doc afetada.
