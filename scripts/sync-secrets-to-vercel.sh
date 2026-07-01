#!/usr/bin/env bash
#
# sync-secrets-to-vercel.sh
# Le os SEGREDOS de `.env.local` e os cadastra no Vercel via `vercel env add`.
#
# Nao faz "fetch" de chaves: o `SUPABASE_SERVICE_ROLE_KEY` de um Supabase
# gerenciado pelo Lovable e obtido manualmente 1x (pelo painel do Lovable) e
# colado no `.env.local`. Este script apenas PROPAGA `.env.local` -> Vercel.
# Ver docs/environment-variables.md e a issue #2.
#
# Pre-requisitos (uma vez):
#   1) vercel login
#   2) vercel link        (cria .vercel/project.json)
#   3) .env.local preenchido com os segredos
#
# Uso:  bash scripts/sync-secrets-to-vercel.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"

# Ambientes-alvo no Vercel (ajuste se necessario). "development" nao entra:
# em dev usamos o proprio .env.local.
ENVIRONMENTS=("production" "preview")

# Somente segredos / config de servidor (nunca as VITE_* publicas, que ja vem
# do .env versionado na build).
SECRET_KEYS=(EMAIL_HOST EMAIL_PORT SERVER_SECURE EMAIL_USER EMAIL_PASS EMAIL_FROM SUPABASE_SERVICE_ROLE_KEY)

if command -v vercel >/dev/null 2>&1; then VERCEL=(vercel); else VERCEL=(npx --yes vercel); fi

[ -f "$ENV_FILE" ] || { echo "ERRO: $ENV_FILE nao encontrado. Crie o .env.local com os segredos." >&2; exit 1; }
[ -f "$ROOT/.vercel/project.json" ] || {
  echo "ERRO: projeto nao linkado ao Vercel. Rode antes:  vercel login  &&  vercel link" >&2
  exit 1
}

# Extrai o valor de uma chave do .env.local (ultima ocorrencia, sem aspas externas).
get_val() {
  local key="$1" line val
  line="$(grep -E "^[[:space:]]*${key}=" "$ENV_FILE" | tail -n1 || true)"
  [ -n "$line" ] || return 1
  val="${line#*=}"
  val="${val%$'\r'}"   # remove CR de arquivos salvos no Windows
  if [[ "$val" == \"*\" ]]; then val="${val%\"}"; val="${val#\"}";
  elif [[ "$val" == \'*\' ]]; then val="${val%\'}"; val="${val#\'}"; fi
  printf '%s' "$val"
}

echo "Sincronizando segredos de .env.local -> Vercel (${ENVIRONMENTS[*]})"
pushed=0; skipped=0
for key in "${SECRET_KEYS[@]}"; do
  if ! val="$(get_val "$key")" || [ -z "$val" ]; then
    echo "  - $key: ausente no .env.local -> pulado"
    skipped=$((skipped + 1))
    continue
  fi
  for env in "${ENVIRONMENTS[@]}"; do
    # Idempotente: remove se existir, depois adiciona. O valor vai por stdin,
    # nunca e impresso.
    "${VERCEL[@]}" env rm "$key" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$val" | "${VERCEL[@]}" env add "$key" "$env" >/dev/null
    echo "  + $key -> $env"
    pushed=$((pushed + 1))
  done
done

echo "Concluido: $pushed cadastrada(s), $skipped pulada(s). Confira com:  vercel env ls"
