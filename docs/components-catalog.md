# Catalogo de Componentes Reutilizaveis

Fonte da verdade dos componentes reutilizaveis deste projeto. Consulte este
catalogo ANTES de criar qualquer componente novo: reutilize ou estenda o que ja
existe em vez de duplicar (ver a regra component-reuse.md). Ao criar um
componente reutilizavel novo, registre-o aqui no mesmo commit.

Convencao de docs: este arquivo e ASCII sem acentos.

Legenda das entradas:

- _[Primitivo]_   shadcn/ui em `src/components/ui` (base; nao mexer no estilo, so compor)
- _[Compartilhado]_ componente de dominio reutilizado entre rotas/secoes
- _[Helper]_      funcao/utilitario (nao e componente visual)

---

## Atalho por necessidade

| Necessidade        | Use                                                                 |
|--------------------|---------------------------------------------------------------------|
| tabela             | `Table` e subcomponentes - `@/components/ui/table`                   |
| modal / dialog     | `Dialog` - `@/components/ui/dialog` (no mobile considere `Drawer`/`Sheet`) |
| confirmacao        | `AlertDialog` - `@/components/ui/alert-dialog` (NAO usar `window.confirm`) |
| toast              | `toast` de `sonner` + `<Toaster />` (`@/components/ui/sonner`)       |
| formulario         | `Form` + `react-hook-form` + `zodResolver` - `@/components/ui/form`  |
| busca / palette    | `Command` - `@/components/ui/command`                                |
| tooltip            | `Tooltip` - `@/components/ui/tooltip`                                |
| icone              | `lucide-react` (ex.: `import { Leaf } from "lucide-react"`)          |
| grafico            | `Chart*` (recharts) - `@/components/ui/chart`                        |

Notas:

- Nao existe hook `useConfirm` neste projeto. Para confirmacao, componha
  `AlertDialog` diretamente. Nunca use `window.alert` / `window.confirm` /
  `window.prompt` (ver no-native-dialogs.md).
- Nao existe helper `pluralize` neste projeto. Se precisar pluralizar texto pt-BR
  variavel, crie o helper primeiro (ver plural-singular.md) e registre-o aqui;
  nao use a gambiarra `(s)`.

---

## Primitivos shadcn/ui (`src/components/ui`)

Base do design system (shadcn estilo new-york, base slate, Radix por baixo).
Sao a fundacao: componha-os, nao recrie. Estilizados via `cn` + tokens Tailwind.

- **`Accordion`** - `@/components/ui/accordion` - secoes expansiveis (Radix). _[Primitivo]_
- **`AlertDialog`** - `@/components/ui/alert-dialog` - dialog de confirmacao bloqueante (substitui `confirm()`). _[Primitivo]_
- **`Alert`** - `@/components/ui/alert` - faixa de aviso/informacao inline. _[Primitivo]_
- **`AspectRatio`** - `@/components/ui/aspect-ratio` - mantem proporcao de midia. _[Primitivo]_
- **`Avatar`** - `@/components/ui/avatar` - imagem/iniciais de usuario com fallback. _[Primitivo]_
- **`Badge`** - `@/components/ui/badge` - rotulo de status/contagem. _[Primitivo]_
- **`Breadcrumb`** - `@/components/ui/breadcrumb` - trilha de navegacao. _[Primitivo]_
- **`Button`** - `@/components/ui/button` - botao base. Props: `variant` (`default|destructive|outline|secondary|ghost|link`), `size` (`default|sm|lg|icon`), `asChild`. _[Primitivo]_
- **`Calendar`** - `@/components/ui/calendar` - seletor de datas (react-day-picker). _[Primitivo]_
- **`Card`** - `@/components/ui/card` - container com `CardHeader/Title/Description/Content/Footer`. _[Primitivo]_
- **`Carousel`** - `@/components/ui/carousel` - carrossel (embla). _[Primitivo]_
- **`Chart`** - `@/components/ui/chart` - wrapper recharts (`ChartContainer`, `ChartTooltip`, `ChartLegend`). Use para graficos do dashboard. _[Primitivo]_
- **`Checkbox`** - `@/components/ui/checkbox` - caixa de selecao. _[Primitivo]_
- **`Collapsible`** - `@/components/ui/collapsible` - regiao recolhivel simples. _[Primitivo]_
- **`Command`** - `@/components/ui/command` - lista de comandos / busca filtravel (cmdk). Use para busca e command palette. _[Primitivo]_
- **`ContextMenu`** - `@/components/ui/context-menu` - menu de clique direito. _[Primitivo]_
- **`Dialog`** - `@/components/ui/dialog` - modal central. Subcomponentes: `DialogContent/Header/Title/Description/Footer`. Controle via `open`/`onOpenChange`. _[Primitivo]_
- **`Drawer`** - `@/components/ui/drawer` - painel deslizante de baixo (vaul), bom para mobile. _[Primitivo]_
- **`DropdownMenu`** - `@/components/ui/dropdown-menu` - menu suspenso de acoes. _[Primitivo]_
- **`Form`** - `@/components/ui/form` - integra react-hook-form: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`. Use com `zodResolver`. _[Primitivo]_
- **`HoverCard`** - `@/components/ui/hover-card` - cartao em hover. _[Primitivo]_
- **`InputOTP`** - `@/components/ui/input-otp` - entrada de codigo OTP. _[Primitivo]_
- **`Input`** - `@/components/ui/input` - campo de texto. Aceita `type` (`text|email|datetime-local|...`). _[Primitivo]_
- **`Label`** - `@/components/ui/label` - rotulo de campo (Radix). _[Primitivo]_
- **`Menubar`** - `@/components/ui/menubar` - barra de menus. _[Primitivo]_
- **`NavigationMenu`** - `@/components/ui/navigation-menu` - menu de navegacao com submenus. _[Primitivo]_
- **`Pagination`** - `@/components/ui/pagination` - controles de paginacao. _[Primitivo]_
- **`Popover`** - `@/components/ui/popover` - flutuante ancorado. _[Primitivo]_
- **`Progress`** - `@/components/ui/progress` - barra de progresso. _[Primitivo]_
- **`RadioGroup`** - `@/components/ui/radio-group` - grupo de radio buttons. _[Primitivo]_
- **`Resizable`** - `@/components/ui/resizable` - paineis redimensionaveis. _[Primitivo]_
- **`ScrollArea`** - `@/components/ui/scroll-area` - area de rolagem estilizada. _[Primitivo]_
- **`Select`** - `@/components/ui/select` - dropdown de selecao. Subcomponentes: `SelectTrigger/Value/Content/Item`. _[Primitivo]_
- **`Separator`** - `@/components/ui/separator` - divisor horizontal/vertical. _[Primitivo]_
- **`Sheet`** - `@/components/ui/sheet` - painel lateral deslizante. Props: `side` (`left|right|top|bottom`). Usado no menu mobile do site. _[Primitivo]_
- **`Sidebar`** - `@/components/ui/sidebar` - kit de barra lateral colapsavel. _[Primitivo]_
- **`Skeleton`** - `@/components/ui/skeleton` - placeholder de carregamento. _[Primitivo]_
- **`Slider`** - `@/components/ui/slider` - controle deslizante. _[Primitivo]_
- **`Sonner`** - `@/components/ui/sonner` - `<Toaster />` de notificacoes. Monte uma vez na raiz; dispare com `toast` de `sonner`. _[Primitivo]_
- **`Switch`** - `@/components/ui/switch` - liga/desliga. _[Primitivo]_
- **`Table`** - `@/components/ui/table` - tabela. Subcomponentes: `TableHeader/Body/Row/Head/Cell/Caption`. _[Primitivo]_
- **`Tabs`** - `@/components/ui/tabs` - abas. Subcomponentes: `TabsList/Trigger/Content`. _[Primitivo]_
- **`Textarea`** - `@/components/ui/textarea` - texto multilinha. _[Primitivo]_
- **`ToggleGroup`** - `@/components/ui/toggle-group` - grupo de toggles exclusivo/multiplo. _[Primitivo]_
- **`Toggle`** - `@/components/ui/toggle` - botao de estado on/off. _[Primitivo]_
- **`Tooltip`** - `@/components/ui/tooltip` - dica em hover/foco. Subcomponentes: `TooltipProvider/Trigger/Content`. _[Primitivo]_

---

## Componentes do site publico (`src/components/site`)

Secoes e blocos da landing/site de marca. Pt-BR no conteudo visivel.

- **`Navbar`** - `src/components/site/Navbar.tsx` - cabecalho fixo do site; vira solido ao rolar; menu mobile via `Sheet`; CTA de WhatsApp + link `Entrar`. _[Compartilhado]_
- **`Hero`** - `src/components/site/Hero.tsx` - secao principal de abertura (titulo, subtitulo, CTA). _[Compartilhado]_
- **`About`** - `src/components/site/About.tsx` - bloco "Sobre" da profissional. _[Compartilhado]_
- **`SpecialtiesTabs`** - `src/components/site/SpecialtiesTabs.tsx` - especialidades em abas (`Tabs`). _[Compartilhado]_
- **`AuthorityBar`** - `src/components/site/AuthorityBar.tsx` - faixa de credenciais/autoridade. _[Compartilhado]_
- **`Testimonials`** - `src/components/site/Testimonials.tsx` - depoimentos de pacientes. _[Compartilhado]_
- **`GoogleReview`** - `src/components/site/GoogleReview.tsx` - CTA/cartao para avaliacao no Google (usa `GOOGLE_REVIEW_URL` de `@/lib/site`). _[Compartilhado]_
- **`ConversionFAQ`** - `src/components/site/ConversionFAQ.tsx` - FAQ de conversao (provavel `Accordion`). _[Compartilhado]_
- **`BlogPreview`** - `src/components/site/BlogPreview.tsx` - previa de posts do blog. _[Compartilhado]_
- **`Footer`** - `src/components/site/Footer.tsx` - rodape do site (contatos, redes, links). _[Compartilhado]_
- **`WhatsAppButton`** - `src/components/site/WhatsAppButton.tsx` - CTA de WhatsApp; abre `whatsappLink(message)` de `@/lib/site`. Props: `message`, `size`, `className`, `children`. _[Compartilhado]_

---

## Componentes do admin (`src/components/admin`)

Area autenticada (rotas sob `_authenticated`), protegida por RLS (`auth.uid()`).

- **`AdminShell`** - `src/components/admin/AdminShell.tsx` - layout da area admin: sidebar colapsavel (desktop) + drawer (mobile), navegacao (Agenda/Pacientes/Modelos/Perfil), rodape de perfil e logout (`supabase.auth.signOut`), `<Outlet />` para a rota filha. _[Compartilhado]_
- **`PageHeader`** - `src/components/admin/AdminShell.tsx` (export nomeado) - cabecalho de pagina admin. Props: `title`, `description?`, `actions?` (ReactNode a direita). Use no topo de cada pagina admin. _[Compartilhado]_
- **`NewAppointmentDialog`** - `src/components/admin/NewAppointmentDialog.tsx` - `Dialog` para agendar consulta: seleciona paciente, data/hora, tipo, observacoes; `useMutation` + `toast` + invalida `["appointments"]`. Props: `open`, `onOpenChange`, `defaultPatientId?`. _[Compartilhado]_

---

## Helpers

- **`cn`** - `@/lib/utils` - junta classes com `clsx` + `tailwind-merge` (resolve conflitos Tailwind). Padrao para `className` condicional. _[Helper]_
- **`SITE` / `qrCodeUrl` / `whatsappLink`** - `@/lib/site` - constantes da marca (nome, CRN, WhatsApp, redes) e geradores de URL (QR code, link wa.me). _[Helper]_
- **`toast`** - de `sonner` (nao e modulo local) - dispara notificacoes (`toast.success`, `toast.error(msg, { description })`). Requer `<Toaster />` montado (`@/components/ui/sonner`). _[Helper]_

### Helpers que NAO existem (nao referencie sem criar)

- `useConfirm` (`@/hooks/use-confirm`) - **inexistente** aqui. Para confirmacao,
  componha `AlertDialog` (`@/components/ui/alert-dialog`).
- `pluralize` / `formatPlural` (`@/lib/pluralize`) - **inexistente** aqui. Se for
  necessario, crie o helper, registre nesta secao e siga plural-singular.md.

---

## Por que este catalogo existe

Sem um inventario unico, componentes equivalentes nascem duplicados (dois cartoes
de paciente, dois headers de pagina) e a base diverge. Centralizar aqui torna a
reutilizacao a opcao mais barata e mantem o design system coeso. O catalogo
tambem deixa explicito o que NAO existe (ex.: `useConfirm`, `pluralize`),
evitando que codigo novo referencie helpers fantasmas.

## Relacao com outras regras

- component-reuse.md - consultar este catalogo antes de criar componente; reusar
  ou refatorar o existente antes de criar novo; manter este arquivo atualizado.
- ui-components.md - como compor os primitivos shadcn e tokens do design system.
- no-native-dialogs.md - confirmacao via `AlertDialog`, feedback via `toast`;
  proibido `alert`/`confirm`/`prompt`.
- plural-singular.md - texto plural correto em pt-BR (sem `(s)`).
- pt-br-content.md - conteudo visivel ao usuario em pt-BR com acentuacao correta.
- documentation.md - este arquivo e documentacao: ASCII sem acentos.
