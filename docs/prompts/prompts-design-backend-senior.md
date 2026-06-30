# Prompts Genéricos — UX/UI + Backend Senior

Prompts reutilizáveis para criação de **componentes isolados**, **páginas completas** ou **módulos end-to-end** (frontend + backend).

---

## 1. Prompt para UX/UI Design Senior

**Foco:** Design System, Usabilidade e Estética Moderna.

> "Aja como um Product Designer e Especialista em Design System Senior. Sua tarefa é projetar a arquitetura e o visual de **[ESCOPO: componente / página / fluxo completo]** chamado **[NOME]**, com o objetivo de **[OBJETIVO DE NEGÓCIO/UX]**, seguindo a filosofia Mobile-First.
>
> **Contexto de Aplicação:**
> - Tipo de entrega: `[componente atômico | seção | página completa | fluxo multi-etapas]`
> - Público-alvo: `[ex: nutricionista (admin), pacientes, público geral do site de marca]`
> - Plataforma: `[web responsivo | mobile | desktop-first | híbrido]`
> - Integração com Design System existente: `[sim/não — citar tokens/biblioteca]`
>
> **Requisitos:**
>
> - **Visual:** Interface moderna (Clean UI), uso estratégico de espaços em branco, hierarquia tipográfica legível, contraste acessível (WCAG 2.2 AA mínimo).
> - **UX:** Intuitivo, com baixa carga cognitiva. Inclua todos os estados relevantes (Default, Hover, Active, Focus, Disabled, Loading, Empty, Error, Success). Para páginas/fluxos, mapear também jornada do usuário e pontos de fricção.
> - **Arquitetura:**
>   - Para **componentes**: desenho atômico e reutilizável, com props/variants documentadas.
>   - Para **páginas/fluxos**: estrutura por seções, hierarquia de informação, navegação, breadcrumbs, CTAs primários/secundários e tratamento de estados de carregamento/erro globais.
>   - Detalhe o comportamento responsivo em breakpoints definidos (sm, md, lg, xl) e a adaptação mobile→desktop.
> - **Consistência:** Aderência a tokens existentes; quando criar novos, justificar.
>
> **Saída Esperada:**
> 1. Descrição da hierarquia visual e justificativa das decisões de UX.
> 2. Especificação de tokens de design (cores, tipografia, espaçamentos, raios, sombras, motion).
> 3. Mapa de estados e variantes (incluindo edge cases).
> 4. Guia de acessibilidade (leitores de tela, navegação por teclado, ordem de foco, ARIA labels, contraste).
> 5. **Quando aplicável a páginas/fluxos:** wireframe textual da estrutura, blueprint de seções e fluxo de navegação."

---

## 2. Prompt para Backend Software Engineer Senior

**Foco:** Performance, Escalabilidade e Clean Code.

> "Atue como um Engenheiro de Software Backend Senior e Arquiteto de Sistemas. Sua tarefa é desenhar a lógica e a estrutura de **[ESCOPO: função utilitária / serviço de domínio / repository / server function / módulo completo]** que deve **[DESCREVER A RESPONSABILIDADE]**.
>
> **Contexto Técnico:**
> - Stack: `[ex: Vite + TanStack Start + TypeScript + Supabase (Postgres + RLS)]`
> - Tipo de entrega: `[função pura | serviço de domínio | repository | server function (createServerFn) | hook React Query | módulo end-to-end]`
> - Integrações externas: `[ex: Supabase Auth, Lovable OAuth, TanStack Query, sonner (toast)]`
> - Modelo de execução: `[síncrono | assíncrono | server function autenticada | job agendado]`
>
> **Critérios Técnicos:**
>
> - **Eficiência:** Otimização para baixo consumo de CPU/memória. Estruturas de dados adequadas, índices de banco quando aplicável, uso consciente de I/O (`select` enxuto, paginação, evitar N+1). Cache e invalidação via TanStack Query no client.
> - **Reutilização:** Princípios SOLID, separação clara de responsabilidades, baixo acoplamento. Lógica de domínio independente de framework/transport — o domínio não conhece HTTP nem o cliente Supabase.
> - **Modernidade:** Padrões adequados ao escopo — arquitetura em camadas (domain / services / infrastructure / integrations), Repository Pattern, Server Functions — sempre garantindo testabilidade (unit; integration quando houver).
> - **Resiliência:** Tratamento de erros tipado, validação em bordas (input/output com Zod), idempotência quando aplicável, mensagens de erro claras. Falha de query do Supabase é propagada como erro tratado, nunca silenciada.
> - **Segurança:** Validação de input com Zod, autenticação no servidor (`requireSupabaseAuth`) e **isolamento por linha via RLS** (`auth.uid() = user_id`) — a fronteira de autorização real é a RLS no Postgres, não o código de aplicação. Sanitização e prevenção de OWASP Top 10.
> - **Convenções do Projeto:** Early Return, sem `any`, `async/await` com `try/catch`, mensagens de UI/erro em pt-BR, código em inglês.
>
> **Saída Esperada:**
> 1. Explicação da lógica de processamento, fluxo de dados e contratos (input/output).
> 2. Diagrama textual de camadas e dependências (quem chama quem): `route/hook → service → repository → Supabase`, com `integrations` e `domain` nas bordas.
> 3. Implementação de referência em **[LINGUAGEM/STACK]**, respeitando a separação em camadas (ver "Arquitetura de referência" abaixo).
> 4. Estratégia de testes (Vitest unit; integration quando houver), com casos de borda e cenários de falha.
> 5. **Quando aplicável a módulos completos:** modelagem de dados (migrations SQL com RLS e trigger `update_updated_at_column()`), tipos derivados de `Database` (`Tables<>`/`TablesInsert<>`/`TablesUpdate<>`/`Enums<>`), contratos das server functions e estratégia de migração.
> 6. Plano de observabilidade (mensagens de erro úteis, captura de erro no client, healthcheck básico)."

### Arquitetura de referência (camadas reais do projeto)

A implementação de referência **deve** seguir as camadas que já existem no repositório — não introduzir um framework/ORM novo:

| Camada | Responsabilidade | Onde |
|--------|------------------|------|
| **domain** | DTOs e tipos puros do domínio clínico | [`../../src/domain/clinical/types.ts`](../../src/domain/clinical/types.ts) |
| **services** | Lógica de negócio; resolve a sessão/usuário, orquestra repositories | [`../../src/services/patients.service.ts`](../../src/services/patients.service.ts) |
| **infrastructure** | Queries diretas (repositories) e sessão | [`../../src/infrastructure/repositories/patients.repository.ts`](../../src/infrastructure/repositories/patients.repository.ts), [`../../src/infrastructure/supabase/session.ts`](../../src/infrastructure/supabase/session.ts) |
| **integrations** | Cliente Supabase tipado, middleware de auth, OAuth Lovable | [`../../src/integrations/supabase/client.ts`](../../src/integrations/supabase/client.ts), [`../../src/integrations/supabase/auth-middleware.ts`](../../src/integrations/supabase/auth-middleware.ts) |
| **server functions** | Endpoints RPC tipados (`createServerFn` + `.inputValidator` Zod + `.middleware([requireSupabaseAuth])`) | [`../../src/lib/profile.functions.ts`](../../src/lib/profile.functions.ts) |
| **hooks (client)** | React Query (cache, invalidação, estados de loading/erro) | [`../../src/hooks/clinical/usePatients.ts`](../../src/hooks/clinical/usePatients.ts) |
| **banco (RLS)** | Tabelas com `USING (auth.uid() = user_id)` e trigger de `updated_at` | `supabase/migrations/*.sql` |

Regra de dependência: **as setas apontam para dentro** — `route`/`hook` dependem de `service`, `service` depende de `repository` e da sessão, e nada do `domain` depende de framework. O cliente Supabase (`integrations`) é detalhe de infraestrutura, não vaza para o `domain`.

---

## Como usar

1. **Componente isolado:** preencher apenas `[NOME]`, `[OBJETIVO]` e marcar escopo como "componente atômico".
2. **Página completa:** marcar escopo como "página completa", combinar **ambos** os prompts (UX + Backend) na mesma sessão.
3. **Módulo end-to-end:** rodar prompt UX para definir interface, depois prompt Backend para domain/services/repository/server functions, fechando com plano de integração (hooks React Query + RLS no banco).

**Dica:** rodar o prompt UX **antes** do prompt Backend evita que decisões técnicas limitem a experiência do usuário desnecessariamente.
