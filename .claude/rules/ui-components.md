---
paths:
  - "src/components/**"
  - "src/routes/**"
---

# Componentes de UI

> **Antes de criar qualquer componente**, ler [component-reuse.md](component-reuse.md)
> e reusar/estender o que já existe (`src/components/ui`, `src/components/site`,
> `src/components/admin`) antes de criar algo novo. Esta regra define os primitivos
> obrigatórios e os padrões de uso.

A UI é toda construída sobre **shadcn/ui** (estilo *new-york*, base *slate*) +
**Radix**, com Tailwind v4. Os primitivos vivem em
[`@/components/ui`](../../src/components/ui) (46 componentes: `button`, `input`,
`label`, `form`, `dialog`, `alert-dialog`, `table`, `tabs`, `select`, `tooltip`,
etc.). **Não** reescrever um primitivo já presente — importá-lo.

## Onde cada componente mora

A separação por pasta é convenção de arquitetura (ver
[component-reuse.md](component-reuse.md)) — respeitar ao criar algo novo:

| Pasta | Para que serve |
|-------|----------------|
| [`src/components/ui`](../../src/components/ui) | primitivos shadcn/Radix, agnósticos de domínio. Não colocar regra de negócio aqui. |
| [`src/components/site`](../../src/components/site) | seções/blocos do site público de marca (`Navbar`, `Hero`, `Footer`, `Testimonials`, ...). |
| [`src/components/admin`](../../src/components/admin) | chrome e componentes da área logada (`AdminShell`, `NewAppointmentDialog`). |

## `cn()` para classes — sempre

Toda composição de `className` condicional usa **`cn`** de
[`@/lib/utils`](../../src/lib/utils.ts) (`clsx` + `tailwind-merge`) — nunca
concatenar strings de classe à mão nem montar template-literals de Tailwind:

```tsx
import { cn } from "@/lib/utils";

<div className={cn("flex items-center gap-3", active && "bg-foreground text-background", className)} />
```

`tailwind-merge` resolve conflitos de classe (a última vence), então `cn` é o único
jeito seguro de permitir que o chamador sobrescreva estilos via prop `className`.

## Ícones — `lucide-react`

Ícones vêm **sempre** de `lucide-react` (importação nomeada). Não usar SVG inline
solto nem outra biblioteca de ícones. Botão **somente-ícone** precisa de rótulo
acessível (`aria-label`) e, quando não é óbvio, de um `Tooltip` (ver abaixo):

```tsx
import { LogOut } from "lucide-react";

<Button variant="ghost" size="icon" aria-label="Sair" onClick={signOut}>
  <LogOut className="h-4 w-4" />
</Button>
```

## Formulários — React Hook Form + Zod

Formulário com validação usa **react-hook-form** + **zod** via
`@hookform/resolvers/zod`, e os componentes `Form*` de
[`@/components/ui/form`](../../src/components/ui/form.tsx). Nunca montar um `<form>`
com estado manual quando há mais de um campo validável.

Hierarquia obrigatória:
`Form` (`FormProvider`) > `FormField` > `FormItem` > `FormLabel` > `FormControl`
> `FormMessage` (e `FormDescription` quando houver ajuda).

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({ name: z.string().min(1, "Informe o nome") });

const form = useForm<z.infer<typeof schema>>({
  resolver: zodResolver(schema),
  defaultValues: { name: "" },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome</FormLabel>
          <FormControl>
            <Input placeholder="Nome do paciente" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

`FormMessage` já renderiza a mensagem de erro do campo (do zod) automaticamente — as
mensagens de validação **em pt-BR com acento** (ver [pt-br-content.md](pt-br-content.md))
moram no schema. Para texto com contagem variável use
[plural-singular.md](plural-singular.md).

## Toasts (feedback) — `sonner`

Feedback de sucesso/erro/info usa **`toast`** de `sonner` (`toast.success`,
`toast.error`, `toast.info`). O `<Toaster />` (wrapper em
[`@/components/ui/sonner`](../../src/components/ui/sonner.tsx)) é montado uma vez na
raiz — não montar outro. **Proibido** `window.alert()` para notificar (ver
[no-native-dialogs.md](no-native-dialogs.md)).

```tsx
import { toast } from "sonner";

toast.success("Paciente cadastrado com sucesso.");
toast.error("Não foi possível salvar. Tente novamente.");
```

Confirmação (sim/não) e prompt de texto também **não** usam diálogos nativos — usar
`AlertDialog`/`Dialog` de `@/components/ui` (ver [no-native-dialogs.md](no-native-dialogs.md)).

## Tabelas — `Table` de `@/components/ui/table`

Não existe `DataTable` custom neste projeto. Tabela tabular usa os primitivos de
[`@/components/ui/table`](../../src/components/ui/table.tsx): `Table`,
`TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`. **Nunca** escrever
`<table>`/`<tr>`/`<td>` crus. O wrapper `Table` já provê scroll horizontal
(`overflow-auto`) — essencial no mobile.

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Última consulta</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {patients.map((p) => (
      <TableRow key={p.id}>
        <TableCell className="font-medium">{p.full_name}</TableCell>
        <TableCell>{/* ...célula formatada... */}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

Para formatar **data/hora** em células, usar `date-fns` com locale pt-BR seguindo
[timezone-dates.md](timezone-dates.md) — nunca `toLocaleString()` cru.

## Tooltips — `side="top"`, nunca `side="bottom"`

Hint visual usa o `Tooltip` de [`@/components/ui/tooltip`](../../src/components/ui/tooltip.tsx),
não o atributo HTML `title` (exceto casos triviais de ícone colapsado já existentes).
Hierarquia: `TooltipProvider` > `Tooltip` > `TooltipTrigger asChild` > `TooltipContent`.

**Posicionamento:** o Radix abre o tooltip **acima** do trigger por padrão e faz
auto-flip para baixo só quando falta espaço no topo. **Nunca** passar
`side="bottom"` em `TooltipContent` — fixar embaixo pode cobrir o conteúdo logo
abaixo do cursor. Não sobrescrever `side` a menos que haja motivo concreto, e nunca
para `"bottom"`.

```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon" aria-label="Excluir">
      <Trash2 className="h-4 w-4" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>Excluir paciente</TooltipContent>
</Tooltip>
```

## Layout da área logada — `AdminShell`

As páginas autenticadas (rotas sob
[`src/routes/_authenticated`](../../src/routes/_authenticated)) são renderizadas
dentro do **`AdminShell`** de [`@/components/admin/AdminShell`](../../src/components/admin/AdminShell.tsx)
— a rota `admin.tsx` usa `AdminShell` como `component` e o `<Outlet />` injeta a
página. Não recriar sidebar/topbar por página.

Para o cabeçalho de uma página, usar o **`PageHeader`** exportado pelo mesmo módulo
(`@/components/admin/AdminShell`), com `title`, `description` e `actions`:

```tsx
import { PageHeader } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";

<PageHeader
  title="Pacientes"
  description="Gerencie os pacientes da clínica."
  actions={<Button onClick={() => setOpen(true)}>Novo paciente</Button>}
/>
```

> Sem dark mode neste projeto: não há `next-themes`, `ThemeToggle` nem
> `useTheme()`. Estilize sempre pelos tokens de cor do tema (`bg-background`,
> `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-destructive`,
> ...), nunca cores fixas (`bg-white`, `text-black`).

## Responsividade (Mobile First)

Toda interface nasce **mobile-first** e cresce para desktop:

- Classes Tailwind na ordem base (mobile) → `sm:` → `md:` → `lg:` → `xl:`.
- O `AdminShell` já alterna topbar+drawer no mobile e sidebar fixa no `lg:` — seguir
  esse breakpoint ao adicionar chrome.
- Diálogos/sheets ocupam a largura no mobile e limitam no tablet+
  (`w-full` base, `sm:max-w-[480px]`).
- Tabelas rolam horizontalmente no mobile (o wrapper de `Table` já faz isso).
- Formulários: campos em coluna única no mobile, grid em telas maiores
  (`grid-cols-1 sm:grid-cols-2`).
- Quando a lógica do componente depende do tamanho da tela, usar o hook
  `useIsMobile()` de [`@/hooks/use-mobile`](../../src/hooks/use-mobile.tsx)
  (breakpoint 768px) — não ler `window.innerWidth` direto.

## Eventos de toque (touch)

Componentes com interação por ponteiro (drag/resize/swipe) devem funcionar no toque:

- Para cada `onMouseDown`/`mousemove`/`mouseup`, prover
  `onTouchStart`/`touchmove`/`touchend` — extrair a lógica compartilhada em um
  helper `startDrag(clientX, clientY)` chamado por ambos.
- `touch-none` em elementos arrastáveis/redimensionáveis (evita scroll/zoom durante
  a interação); `pointer-events-none` em camadas decorativas (SVG/overlays) que
  possam capturar o toque antes do alvo.
- Listeners de `touchmove` que precisam de `preventDefault()` registram com
  `{ passive: false }`.
- Alvos de toque com **mínimo de 44px** no mobile (classes responsivas, ex.:
  `w-4 h-8 sm:w-3 sm:h-6`).
- Testar drag/resize/seleção em viewport mobile antes de considerar pronto.

## Por que esta regra existe

A camada de apresentação só permanece consistente e barata de manter se todos
reusarem os mesmos primitivos e padrões: `cn` para classes, `Form*`+zod para
formulários, `sonner` para feedback, `Table` para tabelas, `Tooltip` (acima) para
hints e `AdminShell`/`PageHeader` para o chrome logado. Recriar tabelas cruas,
concatenar classes à mão, usar `alert()` ou fixar tooltip embaixo são justamente os
desvios que produzem UI inconsistente, inacessível e quebrada no mobile. O build é
só `vite build` (não roda `tsc`), então não há gate de tipo na compilação para
pegar esses deslizes — a disciplina precisa vir da revisão e desta regra.

## Relação com outras regras

- [component-reuse.md](component-reuse.md) — onde cada componente mora e reusar
  antes de criar.
- [no-native-dialogs.md](no-native-dialogs.md) — `toast`/`Dialog`/`AlertDialog` no
  lugar de `alert`/`confirm`/`prompt`.
- [pt-br-content.md](pt-br-content.md) / [plural-singular.md](plural-singular.md) —
  todo texto visível em pt-BR com acento e plural correto.
- [timezone-dates.md](timezone-dates.md) — formatar data/hora em células e campos
  pela lente certa.
