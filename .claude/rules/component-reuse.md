---
paths:
  - "src/components/**"
  - "src/routes/**/*.tsx"
---

# Reuso de Componentes

Antes de criar **qualquer** componente, é **obrigatório** consultar o catálogo
[docs/components-catalog.md](../../docs/components-catalog.md) — a fonte de verdade
de tudo que já existe. Criar um componente que duplica algo existente viola o
princípio **DRY** do projeto e gera dívida (dois componentes para a mesma coisa,
estilos divergentes, manutenção dobrada).

O projeto já tem um conjunto rico de primitivos. Em
[`src/components/ui`](../../src/components/ui) vivem **46 primitivos shadcn/ui**
(estilo new-york, base slate) — `button`, `input`, `label`, `form`, `dialog`,
`alert-dialog`, `table`, `tabs`, `select`, `tooltip`, `card`, `sheet`, `dropdown-menu`,
`command`, `calendar`, `breadcrumb`, `sonner`, entre outros. Quase nada de UI genérica
precisa ser escrito do zero: comece sempre por aqui.

## Fluxo obrigatório antes de criar um componente

1. **Consultar o catálogo** [docs/components-catalog.md](../../docs/components-catalog.md):
   - Comece pela tabela **"Atalho por necessidade"**.
   - Se não achar, faça busca por palavra-chave (ex.: "modal", "tabela", "select",
     "toast", "data", "busca").
2. **Reusar quando existir.** Se já houver um componente que atende — primitivo de
   [`src/components/ui`](../../src/components/ui) ou compartilhado de
   [`src/components/site`](../../src/components/site) /
   [`src/components/admin`](../../src/components/admin) — **use-o**. Nunca recrie um
   componente que já está pronto (ex.: não escreva outro `dialog`; componha sobre o
   `Dialog` existente — é o que o [`NewAppointmentDialog`](../../src/components/admin/NewAppointmentDialog.tsx)
   faz).
3. **Avaliar refatoração quando for semelhante.** Se existir um componente
   **parecido** com o que você precisa (cobre parte das funcionalidades), **antes de
   criar um novo**, analisar se dá para **estender/refatorar** o existente para
   reaproveitá-lo:
   - Dá para atender o novo caso via **nova prop / variante** sem distorcer o
     componente nem quebrar os consumidores atuais? → estender.
   - A diferença é só de estilo/composição? → compor sobre o existente (com `cn()`),
     não duplicar a lógica.
   - Só criar um componente novo quando estender o existente o tornaria confuso,
     sobrecarregado ou acoplado a casos incompatíveis.
4. **Refatoração não trivial → issue.** Se reaproveitar exige refatorar um
   componente compartilhado (mexe em consumidores, muda shape/props públicas),
   seguir [refactoring.md](refactoring.md): criar a issue **antes** de codar.

## Onde colocar um componente novo

| Tipo | Pasta |
|------|-------|
| Primitivo genérico de UI (sem regra de negócio, reutilizável em qualquer tela) | [`src/components/ui`](../../src/components/ui) |
| Compartilhado do **site público** (landing/marca — navbar, hero, seções) | [`src/components/site`](../../src/components/site) |
| Compartilhado da **área logada** (admin, atrás da guarda `_authenticated`) | [`src/components/admin`](../../src/components/admin) |
| Específico de **uma feature/rota** e usado só ali | colocá-lo junto da rota em [`src/routes/**`](../../src/routes) (ou numa subpasta da feature) |

Regra de bolso: se mais de uma rota usa, promova para `ui`/`site`/`admin` conforme o
escopo; se só uma usa, mantenha pontual. **Não** crie um compartilhado especulativo
(YAGNI) — promova quando o segundo consumidor aparecer.

## Atualização obrigatória do catálogo

Sempre que um componente **reutilizável** for **criado** (ou um existente for
promovido a reutilizável, renomeado, movido ou removido), **atualizar
[docs/components-catalog.md](../../docs/components-catalog.md) no mesmo commit**:

- Adicionar/editar a entrada na seção correspondente (`ui` / `site` / `admin`), no
  formato do documento: `**`Name`** — `caminho` — descrição. Props: `a`, `b`.`.
- Atualizar a tabela **"Atalho por necessidade"** quando o componente atender uma
  necessidade comum.
- Manter o documento em **ASCII (sem acentos)**, conforme a convenção de documentação
  de `docs/` ([documentation.md](documentation.md)).

> "Reutilizável" = primitivo de [`src/components/ui`](../../src/components/ui) ou
> compartilhado de [`src/components/site`](../../src/components/site) /
> [`src/components/admin`](../../src/components/admin). Componentes de **feature**
> pontuais (colados a uma rota) não precisam de entrada detalhada — uma linha
> resumida basta.

## Padrões obrigatórios ao criar/estender

- **Mobile-first.** Comece pelo layout estreito e adicione breakpoints (`sm:`/`md:`/…)
  para telas maiores; nunca o contrário. Use o hook
  [`use-mobile`](../../src/hooks/use-mobile.tsx) quando precisar de lógica condicional.
- **Tipagem estrita.** Proibido `any` (TS `strict` ligado) — use `unknown`, generics
  ou os tipos gerados em
  [`src/integrations/supabase/types.ts`](../../src/integrations/supabase/types.ts)
  (`Tables<>`, `TablesInsert<>`, `Enums<>`). O build (`vite build`) **não** roda
  `tsc`, então o type-checker não te protege em CI — capriche na tipagem manualmente.
- **Early-return** para falhas/validações e estados de carregamento/vazio, em vez de
  aninhar `if`.
- **`cn()`** de [`@/lib/utils`](../../src/lib/utils.ts) para compor classes Tailwind
  (clsx + tailwind-merge) — nunca concatenar strings de classe à mão.
- **Plural/singular** em texto visível via o helper compartilhado (ver
  [plural-singular.md](plural-singular.md)) — nada de `"(s)"`.
- **Texto em pt-BR com acento** (labels, toasts, placeholders) — ver
  [pt-br-content.md](pt-br-content.md). Não use diálogos nativos do navegador
  ([no-native-dialogs.md](no-native-dialogs.md)).
- **Datas** via os helpers de `date-fns`/projeto ([timezone-dates.md](timezone-dates.md)),
  nunca formatação manual.
- Extrair lógica testável para **funções puras** exportadas, mantendo o componente
  focado em render.

## Relação com outras regras

- [ui-components.md](ui-components.md) — lista os componentes **obrigatórios** de UI
  (quando usar `Dialog`/`AlertDialog`, `Form`, `Tooltip`, `sonner` etc.). Esta regra
  generaliza: consultar o catálogo antes de criar **qualquer** componente.
- [refactoring.md](refactoring.md) — reaproveitar via refatoração não trivial exige
  issue antes de codar.
- [issue-prompts.md](issue-prompts.md) — a issue de refatoração referencia os prompts
  de senior.
- [documentation.md](documentation.md) — o catálogo vive em `docs/` e segue ASCII
  sem acentos.

## Por que esta regra existe

Sem um catálogo consultado de forma disciplinada, o mesmo componente é recriado
várias vezes com nomes e estilos diferentes, o design system fragmenta e a
manutenção explode. Como o build aqui não tem gate de tipo (`vite build` sem `tsc`)
e não há testes automatizados, a coerência depende ainda mais de **reusar antes de
criar**. Consultar o catálogo, preferir reuso/refatoração e mantê-lo atualizado
garante um conjunto único e coerente de componentes.
