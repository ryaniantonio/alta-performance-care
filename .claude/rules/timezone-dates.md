---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# Datas e Fuso Horário (Timezone)

Fuso horário é fonte recorrente de bug silencioso. O Postgres do Supabase guarda
`timestamptz` em **UTC**; o servidor de build/preview e o runtime do TanStack
Start rodam em UTC; a clínica opera em **America/Sao_Paulo** (Vitória/ES). Quando
uma consulta agendada para "14:00" aparece como "11:00" — ou um `<input
type="datetime-local"></input>` muda de hora a cada save dependendo da máquina —, é
sempre esta confusão. Esta regra é **obrigatória** para qualquer código que leia,
grave, compare, formate ou receba uma data.

## Princípio: toda data pertence a UMA de duas categorias

| Categoria | O que é | Coluna típica | Exemplos |
|-----------|---------|---------------|----------|
| **Date-only** | um **dia** de calendário, sem hora | `DATE` | `patients.last_visit`, data de nascimento, dia de uma medição |
| **Timestamp** | um **instante** com hora relevante | `TIMESTAMPTZ` | `appointments.scheduled_at`, `created_at`, `updated_at` |

Decidir a categoria **antes** de escrever qualquer linha. Tratar uma como a outra
é a causa de praticamente todo bug de fuso. No schema atual (ver
[`supabase/migrations`](../../supabase/migrations)), só `last_visit` é date-only;
todo o resto com hora é `timestamptz` e precisa de fuso fixo na hora de exibir.

## Helper obrigatório: `@/lib/date-utils` — nunca reimplementar inline

Centralize a formatação/parse num único módulo `src/lib/date-utils.ts` e **sempre**
importe dele (`@/lib/date-utils`). Não espalhe `date-fns` cru nem `Intl` pelos
componentes — quando o fuso muda de lugar, muda em um só.

Para formatar um `timestamptz` no fuso fixo da clínica é preciso `date-fns-tz`
(o projeto já tem `date-fns` v4, mas **não** tem `date-fns-tz`). Instale quando
for criar o helper:

```bash
npm install date-fns-tz
```

| Necessidade | Date-only (UTC) | Timestamp (America/Sao_Paulo) |
|-------------|-----------------|-------------------------------|
| **Exibir** | `formatDateOnly(value, fmt)` | `formatInClinicTz(value, fmt)` |
| **Carregar `<input>`** | `toDateInputValue(value)` → `type="date"` | `toDateTimeInputValue(value)` → `type="datetime-local"` |
| **Salvar valor do `<input>`** | a própria string `yyyy-MM-dd` (já é date-only) | `parseDateTimeInput(value)` → `Date` em UTC, pronto p/ `.toISOString()` |

Esboço do módulo (fuso fixo, **nunca** o do browser):

```ts
// src/lib/date-utils.ts
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime, toZonedTime } from "date-fns-tz";

export const CLINIC_TZ = "America/Sao_Paulo";

// timestamptz -> texto BRT
export function formatInClinicTz(value: string | Date, fmt = "dd/MM/yyyy HH:mm") {
  return formatInTimeZone(value, CLINIC_TZ, fmt, { locale: ptBR });
}

// timestamptz -> valor de <input type="datetime-local"> (naive, em BRT)
export function toDateTimeInputValue(value: string | Date) {
  return formatInTimeZone(value, CLINIC_TZ, "yyyy-MM-dd'T'HH:mm");
}

// valor naive do <input> (BRT) -> Date absoluto (UTC) para gravar
export function parseDateTimeInput(value: string) {
  return fromZonedTime(value, CLINIC_TZ); // interpreta a string como BRT
}

// DATE (date-only) -> texto, sem deslocar o dia
export function formatDateOnly(value: string | Date, fmt = "dd/MM/yyyy") {
  const d = typeof value === "string" ? new Date(`${value.slice(0, 10)}T00:00:00Z`) : value;
  return formatInTimeZone(d, "UTC", fmt, { locale: ptBR });
}
```

## Proibições absolutas

1. **Nunca** `getTimezoneOffset()` para popular um `datetime-local`. O resultado
   muda conforme o fuso da **máquina do usuário** — funciona na sua, quebra na do
   cliente. Hoje há exatamente isso em
   [`NewAppointmentDialog.tsx`](../../src/components/admin/NewAppointmentDialog.tsx)
   (`new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,16)`)
   e em
   [`admin.agenda.$appointmentId.tsx`](../../src/routes/_authenticated/admin.agenda.$appointmentId.tsx).
   Trocar por `toDateTimeInputValue`.
2. **Nunca** `new Date(value).toISOString()` para **gravar** o valor de um
   `datetime-local`. `new Date("2026-06-30T14:00")` é interpretado no fuso do
   **processo/browser** — em produção (UTC) salva 3h deslocado. Use
   `parseDateTimeInput(value).toISOString()`.
3. **Nunca** `new Date(stringNaive)` dentro de uma **server function**
   (`createServerFn`, `*.functions.ts`). O runtime é UTC; a string sem `Z`/offset
   vira o instante errado. Receba ISO completo (com `Z`) do client ou normalize com
   `parseDateTimeInput`.
4. **Nunca** `toLocaleDateString()` / `toLocaleString()` / `toLocaleTimeString()` /
   formatação manual. Já há regressões disso em
   [`admin.index.tsx`](../../src/routes/_authenticated/admin.index.tsx)
   (`toLocaleTimeString`) e em
   [`admin.pacientes.index.tsx`](../../src/routes/_authenticated/admin.pacientes.index.tsx)
   (`toLocaleDateString` sobre `last_visit`). O `Intl` usa o fuso da máquina e não
   garante pt-BR. Use `formatInClinicTz` / `formatDateOnly`.
5. **Nunca** `formatInClinicTz` (lente de timestamp/BRT) num campo **date-only**
   (`last_visit`): `2026-06-30` (meia-noite UTC) vira "29/06 21:00". Use
   `formatDateOnly`.
6. **Nunca** `formatDateOnly` (UTC) num **timestamp** com hora (`scheduled_at`): a
   hora sai 3h errada.

## Armadilha: date-only comparado como instante (corte/deadline)

Um campo **date-only** (`DATE`, meia-noite UTC) **não pode** virar corte preciso:

```ts
// ERRADO: "2026-06-30" -> 30/06 00:00 UTC = 29/06 21:00 BRT.
// O filtro corta 3h antes, no dia errado.
if (now > new Date(patient.last_visit)) { /* ... */ }
```

Se o prazo precisa de **hora**, ele é `timestamptz` — edite com `datetime-local` e
grave com `parseDateTimeInput`. Se é mesmo date-only, compare contra o **fim do dia
no fuso** (não a meia-noite UTC crua). Não misture as semânticas.

## Filtros de range no Supabase (`.gte`/`.lt`)

[`appointments.repository.ts`](../../src/infrastructure/repositories/appointments.repository.ts)
filtra `scheduled_at` por range. Como a coluna é `timestamptz`, os limites do range
têm de ser **instantes absolutos em UTC** (ISO com `Z`). "Hoje na clínica" é o
intervalo `[início-do-dia-BRT, início-do-dia-seguinte-BRT)` convertido para UTC com
`fromZonedTime` — **não** `new Date(); setHours(0,0,0,0)` (que zera no fuso do
processo, e em UTC isso são 21:00 do dia anterior em BRT). Veja
[`admin.index.tsx`](../../src/routes/_authenticated/admin.index.tsx).

## Auditar SEMPRE os dois lados (load + save)

Ao tocar qualquer campo de data, verifique **carregamento (form)** e **gravação
(mutation/server function)** juntos — os dois precisam do **mesmo fuso fixo**. Um
lado em BRT e o outro no fuso do processo/browser produz desvio a cada salvamento
(efeito "as horas não salvam"). Faça grep pelos consumidores do campo antes de
mudar.

## Por que esta regra existe

A stack mascara o bug em desenvolvimento: o `vite dev` local roda no fuso da sua
máquina (BRT), então o `getTimezoneOffset()` "acerta" por acidente. Em
preview/produção (UTC) a mesma linha desloca a consulta em 3h, e o agendamento da
nutricionista fica errado sem aviso. O `build` é só `vite build` (não roda `tsc`),
então **não há rede de segurança de tipo** — o erro de fuso chega ao usuário.
Padronizar em um único `@/lib/date-utils` com fuso fixo elimina a classe inteira.

## Checklist antes de commitar mudança em data

- [ ] Classifiquei o campo: **date-only** (`DATE`) ou **timestamp** (`TIMESTAMPTZ`)?
- [ ] Usei o helper de `@/lib/date-utils` certo nos **dois** lados (exibir +
      carregar + salvar)?
- [ ] Nenhum `getTimezoneOffset`, nenhum `toLocale*`, nenhum `new Date(string-naive)`
      em server function?
- [ ] Range de `scheduled_at` no Supabase usa instantes UTC derivados do fuso da
      clínica (não `setHours` no fuso do processo)?
- [ ] Auditei os consumidores do campo (grep) e testei o round-trip salvar→recarregar?

## Relação com outras regras

- [data-access.md](data-access.md) — repositórios/serviços que filtram por
  `timestamptz` aplicam o range em UTC conforme esta regra.
- [supabase-schema.md](supabase-schema.md) — a escolha `DATE` vs `TIMESTAMPTZ` na
  migração é o que define a categoria da data.
- [pt-br-content.md](pt-br-content.md) — datas exibidas saem formatadas em pt-BR
  (`locale: ptBR`), nunca via `Intl` do browser.
