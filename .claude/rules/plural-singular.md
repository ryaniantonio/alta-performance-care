---
paths:
  - "src/**"
---

# Plural / Singular (pt-BR)

Texto visível ao usuário **nunca** deve usar as gambiarras `"(s)"`, `"(is)"`,
`"(es)"` ou `"(ões)"` para "resolver" plural. A interface deve escolher a forma
correta conforme a quantidade.

## Helper obrigatório

Usar `pluralize` / `formatPlural` de [`@/lib/pluralize`](../../src/lib/pluralize.ts):

```ts
import { pluralize, formatPlural } from "@/lib/pluralize";

pluralize(count, singular, plural); // apenas a palavra
formatPlural(count, singular, plural); // "<count> <palavra>"
```

- `pluralize(1, "paciente", "pacientes")` → `'paciente'`
- `pluralize(2, "paciente", "pacientes")` → `'pacientes'`
- `formatPlural(1, "consulta", "consultas")` → `'1 consulta'`
- `formatPlural(0, "consulta", "consultas")` → `'0 consultas'`

## Regras

1. **Formas explícitas:** sempre passar singular **e** plural. O plural em
   português é irregular (`avaliação → avaliações`, `animal → animais`,
   `país → países`, `cidadão → cidadãos`), então **não** derivar o plural
   automaticamente (concatenar `'s'` quebra a maioria dos casos).
2. **Zero é plural:** convenção pt-BR — `0 pacientes`, `0 consultas`. Apenas `1`
   (e `-1`) usam o singular. O helper já trata isso.
3. **Abrange tudo que o usuário lê:** labels, badges, toasts (`sonner`),
   placeholders, títulos, descrições de cards, mensagens de erro e textos do site
   público.
4. **Concordância completa:** ao pluralizar, lembrar do restante da frase
   (artigo/particípio). Ex.: não `"1 registros salvos"`, e sim
   `formatPlural(n, "registro salvo", "registros salvos")` (ou compor as partes
   com `pluralize`).

## Exemplos

```tsx
// ❌ Errado
<span>{count} paciente(s)</span>;
toast.success(`${n} registro(s) atualizado(s).`);

// ✅ Certo
<span>{formatPlural(count, "paciente", "pacientes")}</span>;
toast.success(
  `${formatPlural(n, "registro atualizado", "registros atualizados")}.`,
);
```

## Exceções

- Logs técnicos internos (`console.*`) — não são texto de UI.
- Slugs/URLs e nomes de variáveis/campos do Supabase (código em inglês).

## Migração

Ao **tocar** um componente que ainda usa `"(s)"`/`"(es)"`/`"(ões)"` em string
visível, migrar para o helper no mesmo commit. Não é necessário varrer o projeto
inteiro de uma vez, mas todo novo texto deve já nascer correto.

## Por que esta regra existe

`"paciente(s)"` é deselegante e denuncia software amador — num produto clínico de
marca, cada microcópia comunica cuidado. Centralizar a decisão de plural num
helper testável (em vez de espalhar `"(s)"` pelas telas) garante texto correto e
consistente em toda a aplicação.

## Relação com outras regras

- [pt-br-content.md](pt-br-content.md) — toda string visível em pt-BR usa
  acentuação correta; plural e acento andam juntos.
- [ui-components.md](ui-components.md) — labels, badges e toasts dos primitivos de
  UI seguem esta regra.
