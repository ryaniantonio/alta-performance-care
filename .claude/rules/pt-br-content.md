---
paths:
  - "src/**"
---

# Conteúdo em Português (pt-BR)

O produto é **inteiramente pt-BR** (site de marca + SaaS clínico da nutricionista
Ryani Antonio). Não há camada de internacionalização (i18n): **toda string visível
é literal hardcoded** no JSX/TS. Como não há dicionário central, a disciplina é
por arquivo — cada texto nasce já correto, com **acentuação ortográfica completa**.

## Acentuação obrigatória

Todo texto destinado ao usuário final deve usar acentos, cedilha e til
corretamente. Isso abrange:

- **UI**: labels, títulos, descrições, placeholders, botões, badges, menus, tabs
- **Toasts** (`sonner`): `toast.success(...)`, `toast.error(...)`, `toast.info(...)`
- **Diálogos de confirmação** (`AlertDialog`/`Dialog`): título, descrição, ações
- **Mensagens de erro** retornadas por services, server functions e validação `zod`
  (`.refine`, mensagens de schema) — o usuário lê essas strings
- **Conteúdo de marketing** do site (`src/components/site/**`) — Hero, About, FAQ,
  depoimentos, etc.

**Nunca** escrever pt-BR sem acento:

| Errado | Certo |
|--------|-------|
| `nutricao` | `nutrição` |
| `avaliacao` | `avaliação` |
| `nao` | `não` |
| `descricao` | `descrição` |
| `sessao` | `sessão` |
| `titulo` | `título` |
| `horario` | `horário` |
| `sera` / `esta` | `será` / `está` |
| `excluida` | `excluída` |

Vale **inclusive** dentro de template literals e de HTML/JSX embutido em
TypeScript. Em JSX, quando precisar de aspas literais no texto, use a entidade
(`&quot;`) em vez de quebrar a string.

```tsx
// ❌ Errado
toast.error("Nao foi possivel salvar o paciente.")
<p>Avaliacao nutricional e composicao corporal.</p>

// ✅ Certo
toast.error("Não foi possível salvar o paciente.")
<p>Avaliação nutricional e composição corporal.</p>
```

## Exceções (ficam em inglês / sem acento)

- **Código e identificadores**: nomes de variáveis, funções, tipos, props,
  arquivos e rotas — sempre em inglês (ex.: `createPatient`, `appointmentId`).
- **Slugs e URLs**: caminhos de rota e segmentos (ex.: `/admin/pacientes`,
  `admin.pacientes.$patientId`) — em inglês, sem acento.
- **Atributos HTML técnicos**: `id`, `name`, `data-*`, `aria-*` cujo valor é
  chave técnica (não texto lido). `aria-label`/`alt`/`title` **visíveis ou lidos
  por leitor de tela são texto de UI** → pt-BR com acento.
- **Chaves de banco e enums do Supabase**: nomes de coluna e valores de `Enums<>`
  (ver [`src/integrations/supabase/types.ts`](../../src/integrations/supabase/types.ts))
  são contrato do schema — em inglês. O **rótulo** que você exibe para um enum é
  texto de UI → traduza para pt-BR na camada de apresentação.
- **Logs técnicos internos** (`console.*`) e mensagens de erro de
  infraestrutura/desenvolvimento — não são diálogos de UI.
- **Documentação técnica** sob `docs/`: por convenção, **ASCII sem acentos**
  (ver [documentation.md](documentation.md)). Essa exceção vale **só** para os
  arquivos de documentação — nunca para strings de UI.

## Onde isso aparece neste projeto

- **Site público** — [`src/components/site/**`](../../src/components/site)
  (`Hero.tsx`, `About.tsx`, `ConversionFAQ.tsx`, `Testimonials.tsx`, …) e os
  textos de marca em [`src/lib/site.ts`](../../src/lib/site.ts).
- **Painel** — [`src/components/admin/**`](../../src/components/admin) e as rotas
  autenticadas em `src/routes/_authenticated/**`.
- **Primitivos** — placeholders e textos default de componentes em
  [`src/components/ui/**`](../../src/components/ui) (ver [ui-components.md](ui-components.md)).

## Por que esta regra existe

Sem i18n, cada string errada é um defeito permanente até alguém reescrever a
linha. Texto sem acento parece amador num produto de saúde voltado ao paciente e
quebra busca, leitura e acessibilidade. Padronizar acentuação correta em toda
string visível mantém a marca consistente e o conteúdo legível.

## Relação com outras regras

- [plural-singular.md](plural-singular.md) — além de acentuar, escolher a forma
  singular/plural correta (sem gambiarra `(s)`).
- [no-native-dialogs.md](no-native-dialogs.md) — confirmações e avisos usam
  componentes estilizados com texto pt-BR, nunca `alert`/`confirm` nativos.
- [ui-components.md](ui-components.md) — onde os textos de UI são montados.
- [documentation.md](documentation.md) — a exceção ASCII para `docs/`.
