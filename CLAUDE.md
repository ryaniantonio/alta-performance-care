# CLAUDE.md

Convenções de trabalho e **regras de ouro** deste projeto.

Projeto: site de marca pessoal da nutricionista **Ryani Antonio (CRN-9 29813)** —
TanStack Start + Vite + React 19 + Tailwind v4, backend Supabase, gerado no Lovable.
Repositório GitHub: `ryaniantonio/alta-performance-care`. Idioma do produto: **pt-BR**.

---

## Regras de ouro (sempre seguir, sem exceção)

### 1. Issue no GitHub antes de qualquer trabalho relevante 🥇
Antes de iniciar **qualquer** refatoração, nova funcionalidade, correção não-trivial
ou alteração que gere algo minimamente importante, **crie primeiro uma issue no
GitHub** descrevendo:
- **Objetivo** (o problema ou a melhoria);
- **Escopo** (o que entra e o que não entra);
- **Critério de aceitação** (como saber que está pronto).

O trabalho sempre começa pela issue — nunca direto no código. Referencie o número da
issue na branch e na mensagem de commit (ex.: `Closes #12`).

**Não precisam de issue:** ajustes triviais óbvios (texto/conteúdo, typo), e o commit
de algo já explicitamente acordado na conversa em andamento.

> Para automatizar a criação de issues é necessário ter o **GitHub CLI (`gh`)
> instalado e autenticado**, ou um token com permissão `repo`. Se não houver, criar a
> issue manualmente antes de começar.

### 2. Fluxo de branches: desenvolver em `preview`, integrar com merge fast-forward
- Toda refatoração/desenvolvimento acontece na branch **`preview`**, **nunca** direto
  na `main`.
- Depois do **smoke test aprovado** na `preview`, integrar na `main` com
  **fast-forward apenas**, rodar o **build** e só então fazer o push da `main`:
  ```bash
  git checkout main
  git merge --ff-only preview
  npm run build          # gate obrigatório: só fazer push se o build passar
  git push origin main
  ```
- O **push da `main` só ocorre após o merge-ff E com o build verde**. Se o build
  falhar, corrigir antes de qualquer push — a `main` deve estar sempre publicável. Se
  o `--ff-only` falhar (histórico divergiu), rebasear a `preview` sobre a `main` antes
  de integrar — nunca forçar um merge commit na `main`.

### 3. Commits profissionais, detalhados e completos
- Formato **Conventional Commits**: `tipo(escopo): resumo` (`feat`, `fix`, `docs`,
  `refactor`, `chore`, `style`, `test`, `perf`).
- **Resumo** no imperativo, ≤ 72 caracteres, sem ponto final.
- **Corpo** obrigatório quando a mudança não é trivial: explica **o quê** e
  principalmente **por quê** (motivação, contexto, impacto). Liste as alterações
  relevantes em bullets quando houver várias.
- Referencie a issue relacionada (`Refs #N` / `Closes #N`).
- **Proibido** mensagens genéricas como "Changes", "update", "fix". Cada commit é
  autocontido e conta uma história completa.

---

## Como rodar localmente

```bash
npm install      # Node 18+; bun também funciona (há bun.lock)
npm run dev      # Vite dev server em http://localhost:8080
```

## Notas de assets (Lovable)
O Lovable guarda algumas imagens como placeholders `*.asset.json` que apontam para um
CDN interno (`/__l5e/...`) **indisponível fora da infraestrutura do Lovable**. Ao
clonar, esses assets quebram localmente — use arquivos reais em `src/assets/` e
importe-os diretamente (`import img from "@/assets/foo.jpg"; <img src={img} />`). O QR
code do Google é gerado dinamicamente por `qrCodeUrl()` em `src/lib/site.ts`.
