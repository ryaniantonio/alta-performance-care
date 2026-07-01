# Variaveis de Ambiente e Segredos

Como este projeto gerencia configuracao por ambiente e mantem segredos fora do Git.
Texto em ASCII (convencao de docs/). Rastreado pela issue #2.

## Decisao

Segredos ficam em **variaveis de ambiente**, nao no banco nem no cliente:

- **Producao:** Environment Variables do **Vercel** (onde o sistema roda de fato).
- **Desenvolvimento local:** arquivo **`.env.local`** (ignorado pelo Git).
- **Nunca:** segredo em codigo do cliente / React Context, nem chave criptografada
  no banco (ver "Alternativa avaliada" abaixo).

## Modelo dos arquivos

| Arquivo | Versionado? | Conteudo | Quem le |
|---------|-------------|----------|---------|
| `.env` | SIM | SOMENTE variaveis publicas: `VITE_SUPABASE_*` e Supabase anon/publishable | Vite (inline em build-time) + SSR |
| `.env.local` | NAO (`*.local`) | SEGREDOS de dev: `EMAIL_*`, `SUPABASE_SERVICE_ROLE_KEY` | `process.env` no servidor |
| `.env.example` | SIM | Template documentando todas as variaveis (sem valores de segredo) | Humanos |
| Vercel > Env Vars | (plataforma) | SEGREDOS de producao | `process.env` no servidor |

O Vite carrega `.env` e `.env.local` e mescla os dois (`.env.local` tem precedencia),
entao o `.env.local` local so precisa conter os SEGREDOS; as publicas ja vem do `.env`.

## Publico vs. Segredo — a regra que evita quebrar a build

- **`VITE_*` (publico):** o Vite as **inlina no bundle em build-time**. A build do
  Vercel (producao) e do Lovable (preview de UI) DEPENDEM delas; por isso ficam no
  `.env` versionado. Sao chaves anon/publishable, publicas por design e protegidas
  pela RLS. Remover o `.env` do Git quebra a build (ver revert `9c2b8ad`).
- **Segredos de servidor (sem prefixo `VITE_`):** lidos via `process.env` em
  server functions, NAO vao ao bundle e NAO sao necessarios no `vite build`. Logo
  ficam FORA do Git (`.env.local` + Vercel). Ex.: `EMAIL_PASS` (senha de app do
  Gmail), `SUPABASE_SERVICE_ROLE_KEY` (ignora a RLS = acesso total; jamais no
  cliente).

Ver o padrao de acesso a env em `src/lib/config.server.ts`.

## Setup

### Desenvolvimento local (VSCode)

1. As variaveis publicas ja estao no `.env` versionado (nada a fazer).
2. Crie `.env.local` (ignorado) e preencha os segredos. Use `.env.example` como guia:
   `SUPABASE_SERVICE_ROLE_KEY`, `EMAIL_HOST`, `EMAIL_PORT`, `SERVER_SECURE`,
   `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`.

### Producao (Vercel)

1. Project Settings > Environment Variables (ou `vercel env add`).
2. Cadastrar os mesmos SEGREDOS do `.env.local`.
3. As `VITE_*` publicas ja vem do `.env` versionado na build; opcionalmente tambem
   podem ser definidas no Vercel.

### Lovable (apenas UI)

Nao precisa dos segredos de e-mail (nao executa envio). Depende so das `VITE_*`
publicas, que ja vem do `.env` versionado.

## Sincronizacao VSCode <-> Vercel

`.env.local` (dev) e as Env Vars do Vercel (prod) sao mantidos em paridade. Ao
adicionar/alterar um segredo: atualizar o `.env.local`, refletir o nome (sem
valor) no `.env.example` e propagar para o Vercel.

Para propagar os segredos do `.env.local` para o Vercel sem copiar var por var no
painel, use o script `scripts/sync-secrets-to-vercel.*`:

    # pre-requisito (uma vez):
    vercel login
    vercel link

    # sempre que os segredos mudarem:
    bash scripts/sync-secrets-to-vercel.sh                                       # Git Bash / Linux / macOS
    powershell -ExecutionPolicy Bypass -File scripts/sync-secrets-to-vercel.ps1  # Windows

O script le apenas os segredos allowlisted (EMAIL_*, SUPABASE_SERVICE_ROLE_KEY),
cadastra-os em `production` e `preview` de forma idempotente e nunca imprime os
valores. Ele NAO busca chaves: o `SUPABASE_SERVICE_ROLE_KEY` de um Supabase
gerenciado pelo Lovable e obtido manualmente 1x (painel do Lovable) e colado no
`.env.local` antes de rodar o script.

## Checkpoint pendente (para a issue de envio de e-mail)

Confirmar que o runtime de dev (Vite + Nitro/TanStack Start) carrega o `.env.local`
em `process.env` no servidor. Hoje nenhum codigo le `EMAIL_*` em runtime, entao nao
ha impacto. Ao implementar a server function de e-mail, validar esse carregamento; se
o Nitro carregar apenas `.env` e nao `.env.local`, ajustar o tooling (carregar
`.env.local` explicitamente em dev).

## Fora de escopo

O ENVIO de e-mail em si (server function, transporte SMTP, templates) e uma feature
separada. Nota: o runtime serverless Node do Vercel suporta SMTP de saida, entao
`nodemailer` e viavel em producao. O `@lovable.dev/vite-tanstack-config` usa
Cloudflare como default target do Nitro; garantir que o deploy do Vercel use preset
Node.

## Alternativa avaliada (e descartada por ora): segredos criptografados no banco

Considerou-se o padrao usado no projeto jmr26: guardar segredos criptografados no
banco e descriptografar em runtime. Analise:

- No jmr26 a descriptografia e **server-side only** (API routes Node); o cliente so
  recebe valores mascarados. NAO ha React Context guardando segredo. Levar segredo
  descriptografado ao React Context (cliente) seria uma falha grave (o valor vaza no
  bundle/rede) - descartado em qualquer cenario.
- O padrao real do jmr26 e solido, mas seu proposito e configuracao em runtime por
  uma UI de admin (e-mail, IA, WhatsApp, pagamento, storage). Este projeto ainda nao
  tem essa necessidade (YAGNI) e precisa apenas de `EMAIL_*` + service-role, estaticas
  por ambiente.
- A abordagem no banco tambem NAO elimina env vars: exige `ENCRYPTION_KEY` no env de
  todo ambiente e as chaves de bootstrap do Supabase (nao da para guardar no banco a
  credencial que abre o banco).

Decisao: usar env vars (Vercel + `.env.local`). Reavaliar o padrao criptografado no
banco SE/QUANDO surgir uma tela de admin para gerenciar integracoes sem redeploy - e,
nesse caso, descriptografar apenas dentro de server functions (`createServerFn` +
`requireSupabaseAuth`), com a tabela sob RLS, nunca no cliente.

## Relacao com as regras

- `.claude/rules/data-access.md` - segredos vivem no servidor; server functions com
  `requireSupabaseAuth` sao a borda validada.
- `.claude/rules/supabase-schema.md` - service-role nunca vai a variavel `VITE_*` nem
  ao cliente (ignora a RLS).
