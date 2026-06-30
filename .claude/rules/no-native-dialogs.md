---
paths:
  - "src/**"
---

# Sem Diálogos Nativos do Navegador

É **proibido** usar os diálogos nativos do navegador para interagir com o usuário:
`window.alert()` / `alert()`, `window.confirm()` / `confirm()`, `window.prompt()` /
`prompt()`. Eles quebram a identidade visual (mostram "localhost:8080 diz…"), não
são estilizáveis, ignoram os tokens do tema, não são mobile-friendly e bloqueiam a
thread. Toda interação com o usuário usa os componentes shadcn/ui já instalados.

## O que usar no lugar

| Necessidade | Use |
|-------------|-----|
| **Confirmação** (sim/não antes de uma ação) | hook `useConfirm` de [`@/hooks/use-confirm`](../../src/hooks/use-confirm.tsx) — `const ok = await confirm({ title, description, destructive })` + renderizar `{confirmDialog}`. Promise-based, sem provider. Construído sobre o [`AlertDialog`](../../src/components/ui/alert-dialog.tsx). |
| **Notificação / feedback** (sucesso, erro, info) | `toast` de `sonner` (`toast.success`, `toast.error`) — `import { toast } from "sonner"`. O `<Toaster />` ([`sonner.tsx`](../../src/components/ui/sonner.tsx)) já está montado na raiz. |
| **Entrada de texto** (o que `prompt()` faria) | um [`Dialog`](../../src/components/ui/dialog.tsx) / `AlertDialog` com [`Input`](../../src/components/ui/input.tsx) — use [`Form`](../../src/components/ui/form.tsx) (react-hook-form + zod) quando for formulário. |

> O hook `useConfirm` é o canônico para confirmações. Se ele ainda não existir no
> momento em que você precisa, **crie-o** sobre o `AlertDialog` já instalado (não
> caia para `confirm()` nativo "só desta vez").

### Exemplo — confirmação

```tsx
import { useConfirm } from "@/hooks/use-confirm";

function DeletePatientButton() {
  const { confirm, confirmDialog } = useConfirm();

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Excluir paciente?",
      description: "Esta ação não pode ser desfeita.",
      confirmLabel: "Excluir",
      destructive: true,
    });
    if (!ok) return;
    // ... executar a ação (mutation, toast de sucesso/erro)
  };

  return (
    <>
      <Button variant="destructive" onClick={handleDelete}>
        Excluir
      </Button>
      {confirmDialog}
    </>
  );
}
```

## Regras

1. **Nada de `alert`/`confirm`/`prompt`** (com ou sem `window.`) em código de UI.
2. **Texto em pt-BR** com acentuação correta (ver [pt-br-content.md](pt-br-content.md)),
   e plural correto via helper (ver [plural-singular.md](plural-singular.md)).
3. **Mobile-first** — o `useConfirm` e os diálogos shadcn já são responsivos; novos
   diálogos devem seguir esse padrão (ver [ui-components.md](ui-components.md)).
4. **Acessibilidade** — sempre `AlertDialogTitle`/`DialogTitle`; descrição quando
   houver contexto; foco e Esc já são tratados pelo Radix (`AlertDialog`/`Dialog`).
5. **Reuso, não recriação** — use os primitivos de `@/components/ui` antes de montar
   um diálogo do zero (ver [component-reuse.md](component-reuse.md)).

## Migração

1. **Código novo nasce correto** — qualquer confirmação/alerta/prompt novo já usa
   `useConfirm` / `toast` / `Dialog`. Sem exceção.
2. **Migração na chamada que você tocar** — ao alterar uma interação que usa
   `confirm()` / `alert()` / `prompt()` nativo, migre **aquela chamada** no mesmo
   commit. Não é obrigatório varrer todas as chamadas nativas pré-existentes de um
   arquivo grande num toque pontual — mas é encorajado quando o esforço for
   proporcional.

## Exceções

- Logs técnicos internos (`console.*`) — não são diálogos de UI.
- Código que precise stubar/inspecionar esses globais por motivo técnico explícito.

## Por que esta regra existe

Um `confirm()` nativo no meio de um fluxo clínico polido quebra a confiança visual:
mostra "localhost:8080 diz…", não respeita os tokens do Tailwind v4 nem o estilo
new-york do shadcn, e trava a thread principal. Padronizar em `useConfirm` + `toast`
+ `Dialog` mantém toda interação consistente, acessível e responsiva.

## Relação com outras regras

- [ui-components.md](ui-components.md) — padrões dos primitivos shadcn/ui (Dialog,
  AlertDialog, Form, Input) e mobile-first.
- [component-reuse.md](component-reuse.md) — reutilizar `@/components/ui` e o hook
  `useConfirm` em vez de recriar diálogos.
- [pt-br-content.md](pt-br-content.md) — labels e mensagens em pt-BR com acentuação.
- [plural-singular.md](plural-singular.md) — plural correto em texto visível.
