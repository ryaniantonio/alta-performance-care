## Visão geral

Site de marca pessoal premium para a nutricionista **Ryani Antonio (CRN-9 29813)**, com home single-page de alta conversão + páginas internas para 3 artigos do blog. Tudo em pt-BR, mobile-first, com a paleta marinho/areia/coral e tipografia Playfair Display + Inter.

WhatsApp dos CTAs: `5527998223080` (link `https://wa.me/5527998223080?text=...`).
Redes: Instagram `@ryaniantonio`, LinkedIn `ryani-antonio-987a0b179`.

## Sistema de design (src/styles.css)

Tokens em oklch:
- `--background` (areia quente off-white)
- `--foreground` (marinho profundo)
- `--primary` (azul petróleo profundo) — autoridade
- `--accent` (coral/terracota) — CTAs, esporte/performance
- `--muted` (areia mais clara para cards)
- `--card`, `--border`, `--ring` derivados
- Variante `dark` para a seção de conversão (fundo petróleo, texto claro)
- Gradientes/shadows utilitários: `--gradient-hero`, `--shadow-premium`

Fontes via `<link>` Google Fonts no `__root.tsx`: Playfair Display (700/600) para `font-display`, Inter (400/500/600) para corpo. Tokens `--font-display` e `--font-sans` mapeados no `@theme inline`.

Animações: classes `animate-fade-in`, `hover-scale`, mais um hook `useInView` simples (IntersectionObserver) para fade/translate ao rolar.

## Arquitetura de rotas (TanStack Start)

```
src/routes/
  __root.tsx          (Google Fonts, meta global, Toaster sonner)
  index.tsx           (home single-page)
  blog.index.tsx      (lista dos 3 artigos)
  blog.$slug.tsx      (artigo individual, conteúdo estático por slug)
```

Navegação âncora dentro da home (`#sobre`, `#especialidades`, `#blog`, `#contato`) via `Link to="/" hash="..."` + `scroll-behavior: smooth`. "Blog" no menu vai para `/blog`. "Agendar Consulta" abre WhatsApp.

## Componentes (src/components/site/)

- `Navbar.tsx` — logo "Nutrição Avançada | Ryani Antonio", links, CTA coral. Mobile: drawer (Sheet).
- `Hero.tsx` — 2 colunas. Texto à esquerda + imagem de retrato gerada à direita. Abaixo, 2 cards "bifurcação de público" com âncoras para tabs.
- `AuthorityBar.tsx` — 4 selos com ícones lucide (Stethoscope, Activity, Dumbbell, Ruler).
- `SpecialtiesTabs.tsx` — `Tabs` shadcn (state: `adulto` | `pediatria`), 3 cards por aba com ícones e descrições do brief.
- `About.tsx` — split layout com segunda foto + texto de autoridade conectando residência hospitalar → rigor técnico.
- `BlogPreview.tsx` — grid 3 cards lincando para `/blog/<slug>`.
- `ConversionFAQ.tsx` — bloco escuro petróleo: título, 2 CTAs WhatsApp (presencial/online), Accordion FAQ com 4 perguntas.
- `Footer.tsx` — copyright, sociais (Instagram/LinkedIn reais), aviso CRN.

Cada seção scroll-revela com fade-in.

## Conteúdo do blog

Dados em `src/content/posts.ts`:
- `introducao-alimentar-segura` — Pediatria
- `avaliacao-antropometrica` — Esporte
- `nutricao-clinica-pos-alta` — Clínica

Cada post: título, categoria, tempo de leitura, hero image (gerada), corpo em ~6 parágrafos pt-BR com headings. `/blog` lista todos; `/blog/$slug` renderiza com `head()` próprio (title, description, og:image).

## Imagens (geradas com `imagegen--generate_image`, salvas em src/assets)

1. `hero-portrait.jpg` — retrato editorial vertical da nutricionista (genérico, sem rosto identificável), tons marinho/areia/coral.
2. `about-portrait.jpg` — segunda foto, ambiente clínico moderno.
3. 3 thumbnails de artigo (1 por post).

(Imagens estilizadas/abstratas-editoriais; a profissional troca depois pelas reais.)

## Conversão e CTAs

- Todos os botões "Agendar" / "WhatsApp" abrem `https://wa.me/5527998223080?text=<mensagem-contextual>` em nova aba.
- Toast (`sonner`) "Abrindo WhatsApp..." no clique para feedback.
- Estados hover/active refinados, focus-visible acessível.

## Requisitos técnicos

- 100% pt-BR.
- Mobile-first, breakpoints `sm/md/lg`.
- Estado de tabs com `useState` (shadcn Tabs já gerencia).
- SEO: `head()` por rota com title/description/OG em pt-BR; H1 único por página; alt nas imagens.
- Sem placeholder genérico restante em `src/routes/index.tsx`.

## Detalhes técnicos (resumo)

- shadcn já disponível: `tabs`, `accordion`, `button`, `card`, `sheet`, `sonner`.
- Adicionar `<Toaster />` (sonner) no `__root.tsx`.
- Fontes carregadas via `<link rel="preconnect">` + `<link href="...Playfair...Inter...">` no `head()` do root.
- `scroll-behavior: smooth` no `html` via `src/styles.css`.

## Entregáveis desta execução

1. Tokens + fontes em `src/styles.css` e `__root.tsx`.
2. Componentes em `src/components/site/`.
3. `src/routes/index.tsx` reescrito.
4. `src/routes/blog.index.tsx` e `src/routes/blog.$slug.tsx`.
5. `src/content/posts.ts`.
6. 5 imagens em `src/assets/`.
7. Toaster sonner global.