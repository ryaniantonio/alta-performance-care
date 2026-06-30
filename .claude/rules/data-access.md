---
paths:
  - "src/services/**"
  - "src/infrastructure/**"
  - "src/integrations/supabase/**"
  - "src/lib/*.functions.ts"
  - "src/hooks/**"
---

# Acesso a Dados — Arquitetura em Camadas

Todo acesso a dados neste projeto segue **uma** arquitetura em camadas. Cada
camada tem uma responsabilidade e só conversa com a camada imediatamente abaixo.
Misturar camadas (componente chamando o Supabase direto, repository resolvendo
sessão, UI importando tipo `Row` gerado) é violação direta desta regra — não há
exceção para "só uma query rápida".

## O fluxo (de cima para baixo)

```
Componente / rota (src/routes/**, src/components/**)
  -> React Query hook        (@/hooks/clinical/*)        # leitura/escrita no client
     OU server function      (@/lib/*.functions.ts)      # quando precisa rodar no servidor
  -> service                 (@/services/*.service.ts)   # regra de negócio + sessão
  -> repository              (@/infrastructure/repositories/*.repository.ts)  # data-access puro
  -> Supabase client         (@/integrations/supabase/client)
```

| Camada | Responsabilidade | NÃO faz |
|--------|------------------|---------|
| **Hook** ([usePatients.ts](../../src/hooks/clinical/usePatients.ts)) | `useQuery`/`useMutation`, `queryKey`, invalidação de cache | regra de negócio, query SQL |
| **Server function** ([profile.functions.ts](../../src/lib/profile.functions.ts)) | borda servidor: `createServerFn` + Zod + `requireSupabaseAuth` | acesso direto do client |
| **Service** ([patients.service.ts](../../src/services/patients.service.ts)) | regra de negócio, resolve `user_id` via sessão, orquestra repositories | montar query do Supabase |
| **Repository** ([patients.repository.ts](../../src/infrastructure/repositories/patients.repository.ts)) | data-access **puro**: `.from().select()/.insert()/.update()/.delete()` | resolver auth, aplicar regra de negócio |
| **Client** ([client.ts](../../src/integrations/supabase/client.ts)) | instância única do `supabase` (proxy lazy) | ser importado fora de repository/middleware |

As dependências apontam **para dentro**: a UI conhece o hook, o hook conhece o
service, o service conhece o repository. Nunca o contrário.

## Regra 1 — Componentes NUNCA chamam o Supabase

Um componente (`src/routes/**`, `src/components/**`) **jamais** importa
`@/integrations/supabase/client` nem monta um `.from(...)`. Ele consome um hook
de [`@/hooks/clinical`](../../src/hooks/clinical) (leitura/mutação no client) ou
uma server function de [`@/lib/*.functions.ts`](../../src/lib/profile.functions.ts).

```tsx
// ERRADO — componente falando direto com o banco
import { supabase } from "@/integrations/supabase/client";
const { data } = await supabase.from("patients").select("*"); // proibido na UI

// CERTO — componente consome o hook
import { usePatients } from "@/hooks/clinical/usePatients";
const { data: patients, isLoading } = usePatients();
```

O **único** lugar que importa `@/integrations/supabase/client` é a camada de
repository (e [`session.ts`](../../src/infrastructure/supabase/session.ts), que
resolve o usuário atual). Se você precisou importar o client em outro lugar, está
furando uma camada.

## Regra 2 — Repository é data-access puro

O repository só fala SQL via Supabase. **Sem** resolução de auth, **sem** regra
de negócio. Toda função `async/await`, com early-return no erro:

```ts
async insert(row: PatientInsert): Promise<PatientRow> {
  const { data, error } = await supabase
    .from("patients")
    .insert(row)
    .select()
    .single();
  if (error) throw error;   // early-return da falha
  return data;
}
```

Quem decide *qual* `user_id` gravar, *quais* validações aplicar, *o que*
acontece depois — isso é do **service**, não do repository.

## Regra 3 — Service detém a sessão e a regra de negócio

O service é onde a regra de negócio mora e onde o `user_id` é resolvido, via
`getCurrentUserId()` de
[`@/infrastructure/supabase/session`](../../src/infrastructure/supabase/session.ts).
O repository fica puro porque o service carrega esse peso:

```ts
async create(input: CreatePatientDTO): Promise<PatientRow> {
  const user_id = await getCurrentUserId();           // sessão resolvida aqui
  return patientsRepository.insert({ ...input, user_id });
}
```

`getCurrentUserId()` faz early-return com mensagem **pt-BR** (`"Não
autenticado"`) — siga esse padrão em qualquer erro novo voltado ao usuário.

## Regra 4 — RLS é a fronteira de auth real

A segurança **não** depende de checagem em JavaScript. Toda tabela
(`patients`, `appointments`, `patient_records`) tem **Row Level Security** com
`USING (auth.uid() = user_id)` nas migrations
([`supabase/migrations/`](../../supabase/migrations)). O banco recusa linhas de
outro usuário mesmo que uma camada esqueça de filtrar. Tratar a RLS como a
fronteira real significa:

- **Nunca** dependa de um `.eq("user_id", ...)` no client como se fosse
  segurança — é conveniência; a RLS é a barreira.
- O `user_id` resolvido no service **alimenta** as linhas que você grava
  (`INSERT`); a RLS garante que ninguém leia/escreva fora do próprio escopo.
- Tabela nova **nasce com RLS** `auth.uid() = user_id` na própria migration.

## Regra 5 — Server functions: borda validada + autenticada

Quando a operação precisa rodar no **servidor** (segredo, lógica que não pode ir
ao bundle, SSR), use uma **server function** TanStack Start em
[`@/lib/*.functions.ts`](../../src/lib/profile.functions.ts). Toda server
function que toca dados **DEVE**:

1. Encadear `.middleware([requireSupabaseAuth])` de
   [`@/integrations/supabase/auth-middleware`](../../src/integrations/supabase/auth-middleware.ts)
   — valida o Bearer JWT e injeta `context.supabase` (client autenticado) e
   `context.userId` no handler.
2. Validar a entrada com **Zod** via `.inputValidator((input) => Schema.parse(input))`.
3. Filtrar pelo dono via `context.userId` e fazer early-return no erro.

```ts
// src/lib/profile.functions.ts (referência canônica)
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ProfileUpdateSchema = z.object({
  full_name: z.string().trim().max(120).nullable().optional(),
  clinic_email: z.string().trim().email().max(160).nullable().or(z.literal("")).optional(),
  // ...
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])                              // auth na borda
  .inputValidator((input: unknown) => ProfileUpdateSchema.parse(input)) // Zod na borda
  .handler(async ({ data, context }) => {
    const payload = { ...data, clinic_email: data.clinic_email === "" ? null : data.clinic_email };
    const { data: row, error } = await context.supabase
      .from("profiles")
      .update(payload)
      .eq("id", context.userId)                                  // dono via context
      .select()
      .single();
    if (error) throw new Error(error.message);                   // early-return
    return { profile: row };
  });
```

Mesmo com a server function autenticada, a **RLS continua valendo** — as duas
camadas de defesa coexistem (Regra 4).

## Regra 6 — DTOs do domínio na fronteira; nunca vaze tipos `Row`

Os tipos gerados do Supabase
([`@/integrations/supabase/types`](../../src/integrations/supabase/types.ts) —
`Database`, `Tables<>`, `Insert`, `Update`) são **detalhe de infraestrutura**.
A UI, os hooks e os services trabalham com os **DTOs** de
[`@/domain/clinical/types`](../../src/domain/clinical/types.ts)
(`PatientRow`, `CreatePatientDTO`, `UpdatePatientDTO`, `RecordKind`, ...), que
reexportam/recortam aqueles tipos num único ponto:

```ts
// @/domain/clinical/types — o ÚNICO arquivo que importa o Database gerado
export type PatientRow = Database["public"]["Tables"]["patients"]["Row"];
export type CreatePatientDTO = Omit<PatientInsert, "user_id">; // UI não envia user_id
```

- **Nunca** `import ... from "@/integrations/supabase/types"` num componente,
  hook ou service. Importe de `@/domain/clinical/types`.
- DTOs de entrada (`Create*DTO`) **omitem** `user_id` — quem o injeta é o service
  (Regra 3), não o chamador.
- Precisou de um campo novo da tabela na UI? Exponha um DTO no domínio; não puxe
  o `Row` cru.

## Padrões obrigatórios (todas as camadas)

- **`async/await` com tratamento de erro** — repository/service propagam o
  `error` do Supabase via `throw`; server functions fazem
  `if (error) throw new Error(error.message)`.
- **Early-return** em falha e validação (ver [pt-br-content.md](pt-br-content.md)
  para o texto).
- **Sem `any`** — use `unknown` + Zod na borda (o `.inputValidator` recebe
  `unknown`) e os DTOs do domínio nas camadas internas.
- **Mensagens de erro voltadas ao usuário em pt-BR** com acentuação correta (ver
  [pt-br-content.md](pt-br-content.md)); para contagens, ver
  [plural-singular.md](plural-singular.md).
- **Feedback de UI** (sucesso/erro de mutação) é `toast` do `sonner` no
  componente, **não** diálogo nativo (ver [no-native-dialogs.md](no-native-dialogs.md)).

## Onde colocar código novo

| Você quer... | Crie/edite em |
|--------------|---------------|
| Ler/gravar dados a partir de um componente | hook em [`@/hooks/clinical`](../../src/hooks/clinical) |
| Uma operação que precisa rodar no servidor | server function em `@/lib/<nome>.functions.ts` |
| Regra de negócio / orquestração / resolver dono | service em `@/services/<nome>.service.ts` |
| Uma query/mutação SQL nova | método no repository em `@/infrastructure/repositories/<nome>.repository.ts` |
| Um tipo que a UI/serviço consome | DTO em [`@/domain/clinical/types`](../../src/domain/clinical/types.ts) |
| Uma tabela nova | migration em [`supabase/migrations`](../../supabase/migrations) **com RLS** `auth.uid() = user_id` |

Antes de criar uma camada nova, confira se já não existe um service/repository
para o mesmo domínio — reuse antes de criar (ver
[component-reuse.md](component-reuse.md)). Mudança de schema (coluna, RLS,
trigger) deve refletir em [supabase-schema.md](supabase-schema.md) e nos DTOs.

## Por que esta regra existe

A separação em camadas mantém a UI ignorante de SQL, concentra a resolução de
sessão num único ponto (service) e isola o tipo gerado do Supabase atrás de DTOs
— então trocar uma query, renomear uma coluna ou ajustar uma regra não se
espalha pela árvore de componentes. E, acima de tudo, deixa claro que a
**segurança vive na RLS** (`auth.uid() = user_id`), não em condicionais de
JavaScript que qualquer refactor pode remover sem o banco perceber.

## Relação com outras regras

- [supabase-schema.md](supabase-schema.md) — tabelas, RLS e migrations; toda
  tabela nasce com RLS por `user_id`.
- [component-reuse.md](component-reuse.md) — reuse service/repository/hook
  existente antes de criar um novo.
- [ui-components.md](ui-components.md) — componentes consomem hooks/server
  functions, nunca o Supabase direto.
- [pt-br-content.md](pt-br-content.md) / [plural-singular.md](plural-singular.md)
  — mensagens de erro e contagens voltadas ao usuário.
- [no-native-dialogs.md](no-native-dialogs.md) — feedback de mutação via `toast`,
  não diálogo nativo.
- [testing.md](testing.md) — quando houver testes, a lógica pura de service é o
  alvo natural de cobertura.
