---
paths:
  - "supabase/**"
  - "src/integrations/supabase/**"
---

# Schema e RLS do Supabase

O banco é Postgres gerenciado pelo Supabase. **Toda** mudança de schema nasce de
uma **migration SQL versionada** em [`supabase/migrations`](../../supabase/migrations)
— nunca editando tabelas pela UI sem registrar o SQL, nunca mexendo no banco "na
mão". A fronteira de segurança real do sistema **não** é o código React nem as
server functions: é a **Row Level Security (RLS)** por `user_id`. Uma tabela sem
RLS é um vazamento de dados clínicos de pacientes. Esta regra é obrigatória para
qualquer arquivo sob `supabase/**` ou `src/integrations/supabase/**`.

## Migrations versionadas

- Cada mudança = **um arquivo `.sql` novo** com prefixo de timestamp em
  `supabase/migrations/` (ex.: `20260606215610_<descrição>.sql`). Migrations são
  **append-only**: corrija um schema com uma migration nova, **nunca** reescrevendo
  uma migration já aplicada.
- O `project_id` fica em [`supabase/config.toml`](../../supabase/config.toml) — é a
  única coisa que aquele arquivo guarda; não colocar segredo ali.
- SQL idempotente onde fizer sentido (`CREATE OR REPLACE FUNCTION`); `CREATE TABLE`
  cru para tabela nova.

## Checklist de tabela nova (sem exceção)

Toda `CREATE TABLE public.<tabela>` **deve** vir com, na mesma migration:

| # | Item | Exemplo (extraído da migration atual) |
|---|------|----------------------------------------|
| 1 | PK `id UUID` gerado no servidor | `id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY` |
| 2 | `user_id` com FK e cascade | `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` |
| 3 | Auditoria `created_at` + `updated_at` | `created_at TIMESTAMPTZ NOT NULL DEFAULT now()` / `updated_at TIMESTAMPTZ NOT NULL DEFAULT now()` |
| 4 | Grants explícitos | `GRANT SELECT, INSERT, UPDATE, DELETE ON public.<tabela> TO authenticated;` + `GRANT ALL ... TO service_role;` |
| 5 | **RLS habilitada** | `ALTER TABLE public.<tabela> ENABLE ROW LEVEL SECURITY;` |
| 6 | **Policy por dono** | `CREATE POLICY "Own <tabela>" ON public.<tabela> FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);` |
| 7 | Trigger de `updated_at` | `CREATE TRIGGER ... BEFORE UPDATE ... EXECUTE FUNCTION public.update_updated_at_column();` |
| 8 | Index em `user_id` (e nas FKs de leitura quente) | `CREATE INDEX <tabela>_user_id_idx ON public.<tabela>(user_id);` |

Pular **qualquer** linha de RLS (5 e 6) é violação direta desta regra: sem a
policy, ou a tabela fica inacessível ao app, ou — pior, se alguém afrouxar o grant
— expõe dados de todos os usuários.

### Modelo de referência

A migration atual (`patients`, `appointments`, `patient_records`) é o **template
canônico** — copie a estrutura dela para qualquer tabela nova.

```sql
-- shared trigger fn (já existe; só CREATE OR REPLACE se precisar)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.exames (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exames TO authenticated;
GRANT ALL ON public.exames TO service_role;
ALTER TABLE public.exames ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own exames" ON public.exames FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_exames_updated_at BEFORE UPDATE ON public.exames
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX exames_user_id_idx ON public.exames(user_id);
CREATE INDEX exames_patient_idx ON public.exames(patient_id);
```

## RLS é a fronteira de segurança

- A policy padrão é **`FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid()
  = user_id)`**. `USING` filtra leitura/update/delete; `WITH CHECK` impede inserir
  ou mover uma linha para outro `user_id`. Sempre os **dois**.
- Auth é Supabase JWT (em `localStorage`) + OAuth Lovable no client; no servidor as
  server functions passam por `requireSupabaseAuth`. Mas o que realmente **isola
  os dados de um profissional dos de outro** é a RLS — código de aplicação pode ter
  bug, a RLS é a última linha.
- `auth.users(id)` é a tabela de usuários do Supabase; `user_id` sempre referencia
  ela com `ON DELETE CASCADE` (apagar o usuário leva junto os dados clínicos).

## Campos gerados no servidor — nunca via input do cliente

`id`, `created_at`, `updated_at` e `user_id` são **gerados/garantidos pelo banco**
(defaults + trigger + RLS `WITH CHECK`). O cliente **não** os fornece:

- `id` ← `gen_random_uuid()`; `created_at`/`updated_at` ← `now()` + trigger.
- `user_id` ← preenchido no servidor a partir da sessão (ver
  `getCurrentUserId()` em [`src/infrastructure/supabase/session.ts`](../../src/infrastructure/supabase/session.ts)),
  **nunca** aceito do corpo da requisição. Mesmo que viesse, a policy `WITH CHECK`
  rejeitaria um `user_id` diferente do dono.
- Validar a entrada do cliente com **zod** (`.inputValidator` nas server functions
  `.functions.ts`) cobrindo **apenas** os campos de domínio — `name`, `data`,
  `scheduled_at`, etc. — jamais os sensíveis acima.

## JSONB para dados flexíveis

Campos cujo formato evolui ou varia por tipo usam **`JSONB`** com default não-nulo,
em vez de explodir em dezenas de colunas:

- `patients.alerts JSONB NOT NULL DEFAULT '[]'::jsonb` (lista de alertas).
- `patient_records.data JSONB NOT NULL DEFAULT '{}'::jsonb` (payload variável por
  `kind`).

Regra: **default explícito** (`'[]'`/`'{}'`) e `NOT NULL`, para nunca tratar
ausência como `null` no app. A **forma** do JSONB é validada na borda do app com
zod (o Postgres só garante "é JSON válido"). No TypeScript ele chega como o tipo
`Json` de [`types.ts`](../../src/integrations/supabase/types.ts) — refine para a
interface do domínio em [`src/domain/clinical/types.ts`](../../src/domain/clinical/types.ts)
antes de usar.

## Constraints e enums

- **`UNIQUE`** quando o domínio garante unicidade — ex.: um registro por tipo por
  paciente: `UNIQUE (patient_id, kind)` em `patient_records`.
- **`CHECK`** para conjuntos fechados de valores, em vez de confiar só no app —
  ex.: `sex TEXT CHECK (sex IN ('F','M','O'))`, `kind TEXT CHECK (kind IN
  ('anamnese','avaliacao','gasto','recordatorio','plano','prescricao'))`.
- Quando o conjunto for estável e reutilizado, considerar `CREATE TYPE ... AS ENUM`
  (aparece em `Database['public']['Enums']` no `types.ts` regerado); para valores
  voláteis, `CHECK` é mais simples de evoluir por migration.

## Após mudar o schema: **regere os tipos**

[`src/integrations/supabase/types.ts`](../../src/integrations/supabase/types.ts) é
**auto-gerado** ("This file is automatically generated. Do not edit it directly.").
Qualquer migration que altere tabelas/colunas/enums **exige regerar** esse arquivo,
senão o `Database` tipado fica defasado e o app passa a mentir sobre o shape.

- Regere com a CLI do Supabase (`supabase gen types typescript --project-id
  <project_id> > src/integrations/supabase/types.ts`) e **commite junto** com a
  migration, no mesmo PR.
- **Nunca** editar `types.ts` à mão. Consuma o schema via os helpers exportados —
  `Tables<'patients'>`, `TablesInsert<'appointments'>`, `TablesUpdate<'patient_records'>`,
  `Enums<...>` — em vez de redeclarar shapes.

## Chaves: nunca a service-role no client

- O client do navegador ([`src/integrations/supabase/client.ts`](../../src/integrations/supabase/client.ts))
  usa **somente** `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (a chave
  **anon**/pública). Variáveis `VITE_*` são **embutidas no bundle** pelo Vite e
  ficam visíveis no navegador.
- A **service-role key** (que **ignora a RLS**) **jamais** entra em variável `VITE_*`
  nem em qualquer código que chega ao client. Se algum fluxo de servidor precisar
  dela, fica fora do bundle do browser (env de servidor, sem prefixo `VITE_`). Vazar
  a service-role key = acesso total ao banco, contornando toda a RLS.

## Por que esta regra existe

São dados clínicos de pacientes sob LGPD. O isolamento entre profissionais depende
inteiramente da RLS por `user_id` — não do React, não da rota, não de um `if` no
serviço. Esquecer `ENABLE ROW LEVEL SECURITY` ou a policy, aceitar `user_id` do
cliente, ou vazar a service-role key transforma um detalhe de schema em incidente
de privacidade. Padronizar o template de tabela (UUID + user_id + auditoria + RLS +
trigger + index) e tratar `types.ts` como artefato regerado mantém banco e código
em sincronia e o dado de cada profissional trancado ao dono.

## Relação com outras regras

- [data-access.md](data-access.md) — repositórios/serviços consomem este schema; a
  RLS definida aqui é o que esses caminhos pressupõem.
- [ui-components.md](ui-components.md) e [component-reuse.md](component-reuse.md) —
  formulários que escrevem nessas tabelas validam só campos de domínio (nunca os
  gerados no servidor).
- [pt-br-content.md](pt-br-content.md) — labels/mensagens em pt-BR; nomes de
  tabela/coluna seguem em inglês (código).
- [documentation.md](documentation.md) — mudança relevante de schema atualiza a
  documentação correspondente.
