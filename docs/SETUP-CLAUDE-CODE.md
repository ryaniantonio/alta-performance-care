# Setup do Claude Code (manual da IDE)

Este guia faz dois devs trabalharem com **o mesmo cerebro de convencoes** no VS Code:
as regras, personas e prompts que orientam o Claude Code neste projeto. Texto em
ASCII (convencao de docs/).

O ponto central: parte das entregaveis **vive no repositorio** (chega sozinha no
`git clone`/`git pull`) e parte e **por maquina** (cada dev configura uma vez). A
tabela abaixo separa os dois lados.

## 1. O que vem no repositorio (automatico via git)

Ao clonar `ryaniantonio/alta-performance-care`, o dev ja recebe:

| Artefato | Para que serve |
|----------|----------------|
| `CLAUDE.md` | Convencoes globais + regras de ouro (issue-first, branch flow, commits) |
| `.claude/rules/*.md` | Regras modulares carregadas por caminho (data-access, ui-components, ...) |
| `.claude/settings.json` | Baseline de permissoes do time (menos prompts) - ver secao 4 |
| `.agents/*.md` | 5 personas de apoio (AN, DEV, LT, PM, QA) |
| `docs/prompts/prompts-design-backend-senior.md` | Prompts senior de UX e Backend |
| `docs/components-catalog.md` | Catalogo de componentes reutilizaveis (consultar antes de criar) |
| `docs/TRANSFER-MANIFEST.md` | Inventario do que foi transferido do projeto SGE/jmr26 |
| `scripts/setup-claude-code.*` | Este bootstrap (verifica toolchain + instala deps) |
| `src/lib/pluralize.ts`, `src/hooks/use-confirm.tsx` | Helpers referenciados pelas regras |

Esses arquivos sao versionados de proposito: o "como trabalhamos" precisa viajar com
o codigo, nao ficar preso a uma maquina.

## 2. O que e por maquina (NAO vai no repo)

| Item | Onde fica | Como obter |
|------|-----------|------------|
| Claude Code (CLI + extensao VS Code) | instalacao do SO | ver secao 3 |
| Skills globais (deep-research, code-review, verify, ...) | vem com o Claude Code | instalar o Claude Code |
| Memoria do Claude | `~/.claude/projects/<slug>/memory/` | pessoal, auto-construida; **nao** compartilhar |
| `.claude/settings.local.json` | repo, mas **gitignored** | opcional, por dev |
| Auth do `gh`, conexoes MCP, modelo/ultracode | config local do usuario | `gh auth login`, painel do Claude |

Resumo: o repo carrega as **regras**; a maquina carrega a **ferramenta** que le essas
regras. Os dois juntos reproduzem o mesmo ambiente.

## 3. Passo a passo para um novo dev

1. **Clonar e instalar deps + verificar toolchain:**
   ```bash
   git clone https://github.com/ryaniantonio/alta-performance-care.git
   cd alta-performance-care
   # Windows:
   powershell -ExecutionPolicy Bypass -File scripts\setup-claude-code.ps1
   # macOS / Linux / Git Bash / WSL:
   bash scripts/setup-claude-code.sh
   ```
   O script checa Node/npm/git/gh/claude, roda `npm install` (ou `bun install`) e
   confere se os artefatos versionados chegaram. Ele **nao** instala ferramentas
   globais - so reporta e orienta.

2. **Instalar o Claude Code:**
   - **VS Code:** instalar a extensao **"Claude Code"** na Marketplace e fazer login.
   - **CLI:** seguir https://docs.claude.com/claude-code (caminho comum:
     `npm i -g @anthropic-ai/claude-code`, ou o instalador nativo da pagina oficial).

3. **Autenticar o GitHub CLI** (para `gh issue create` da regra de ouro 1):
   ```bash
   gh auth login
   ```

4. **Abrir a pasta no VS Code.** As regras de `.claude/rules/` carregam **por
   caminho** (cada arquivo tem um `paths:` no topo); o `CLAUDE.md` carrega sempre. Nao
   ha passo extra - basta editar arquivos que casem com os `paths`.

5. **(Opcional) Conectar MCP/connectors** que voce usa (Playwright para o skill
   `verify`, etc.).

## 4. `.claude/settings.json` (baseline de permissoes do time)

Esse arquivo reduz prompts de permissao repetidos (git read-only, npm, npx) e mantem
push/merge sob confirmacao. **Deve ser versionado** para os dois devs compartilharem o
mesmo baseline. Se ele faltar no clone, crie com este conteudo:

```json
{
  "permissions": {
    "allow": [
      "Bash(wc -l:*)",
      "Bash(find:*)",
      "Bash(cd:*)",
      "Bash(git status:*)",
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git show:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git restore:*)",
      "Bash(git checkout:*)",
      "Bash(git switch:*)",
      "Bash(git stash:*)",
      "Bash(git fetch:*)",
      "Bash(git branch:*)",
      "Bash(git rev-parse:*)",
      "Bash(git blame:*)",
      "Bash(git ls-files:*)",
      "Bash(git tag:*)",
      "Bash(git describe:*)",
      "Bash(git reflog:*)",
      "Bash(npm install:*)",
      "Bash(npm run:*)",
      "Bash(npm test:*)",
      "Bash(npm ls:*)",
      "Bash(npx:*)",
      "Bash(bun install:*)",
      "Bash(bun run:*)",
      "mcp__plugin_playwright_playwright__browser_navigate",
      "mcp__plugin_playwright_playwright__browser_snapshot",
      "mcp__plugin_playwright_playwright__browser_console_messages",
      "mcp__plugin_playwright_playwright__browser_take_screenshot",
      "mcp__plugin_playwright_playwright__browser_wait_for"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(git merge:*)"
    ]
  }
}
```

Permissoes especificas da maquina (que so um dev quer) vao em
`.claude/settings.local.json`, que e **gitignored** e nao afeta o outro dev.

## 5. Memoria - por que NAO esta no repo

A memoria do Claude (`~/.claude/projects/<slug>/memory/`) e **pessoal e por maquina**:
reflete o relacionamento de trabalho de **um** dev e usa um caminho que depende de onde
o repo foi clonado. Por isso ela **nao** e compartilhada nem versionada. O que e regra
do time mora nas regras versionadas (`.claude/rules/`, `CLAUDE.md`) - de proposito,
para nao depender da memoria de ninguem. Cada dev constroi a sua memoria ao trabalhar.

## 6. Skills - globais, nao do repo

As skills (deep-research, code-review, verify, run, ...) vem com a instalacao do Claude
Code, nao com o repositorio. Apos instalar o Claude Code (secao 3), elas ja ficam
disponiveis em qualquer projeto. Este repo **nao** define skills custom proprias.

## 7. Verificar que funcionou

- `npm run dev` sobe o app em http://localhost:8080.
- `npm run typecheck` roda o gate de tipos (`tsc --noEmit`).
- No VS Code com o Claude Code logado, ao editar (por exemplo) um arquivo em
  `src/services/`, a regra `data-access.md` passa a valer; ao editar
  `src/components/`, valem `component-reuse.md` e `ui-components.md`.
- `gh issue list` confirma que o `gh` esta autenticado no repo certo.
