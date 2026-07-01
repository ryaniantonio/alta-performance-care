<#
.SYNOPSIS
  Le os SEGREDOS de .env.local e os cadastra no Vercel via `vercel env add`.

.DESCRIPTION
  Nao faz "fetch" de chaves: o SUPABASE_SERVICE_ROLE_KEY de um Supabase
  gerenciado pelo Lovable e obtido manualmente 1x (pelo painel do Lovable) e
  colado no .env.local. Este script apenas PROPAGA .env.local -> Vercel.
  Ver docs/environment-variables.md e a issue #2.

  Pre-requisitos (uma vez):
    1) vercel login
    2) vercel link        (cria .vercel/project.json)
    3) .env.local preenchido com os segredos

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/sync-secrets-to-vercel.ps1
#>
$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env.local'

# Ambientes-alvo no Vercel (ajuste se necessario). "development" nao entra:
# em dev usamos o proprio .env.local.
$environments = @('production', 'preview')

# Somente segredos / config de servidor (nunca as VITE_* publicas, que ja vem
# do .env versionado na build).
$secretKeys = @('EMAIL_HOST','EMAIL_PORT','SERVER_SECURE','EMAIL_USER','EMAIL_PASS','EMAIL_FROM','SUPABASE_SERVICE_ROLE_KEY')

$vercelCmd = (Get-Command vercel -ErrorAction SilentlyContinue)
if ($null -eq $vercelCmd) { Write-Error "Vercel CLI nao encontrado. Instale com: npm i -g vercel"; exit 1 }

if (-not (Test-Path $envFile)) {
  Write-Error "$envFile nao encontrado. Crie o .env.local com os segredos."; exit 1
}
# O `vercel link` cria .vercel/project.json (link classico) OU .vercel/repo.json
# (link em nivel de repo / git). Aceita qualquer um dos dois.
if (-not (Test-Path (Join-Path $root '.vercel/project.json')) -and
    -not (Test-Path (Join-Path $root '.vercel/repo.json'))) {
  Write-Error "Projeto nao linkado ao Vercel. Rode antes:  vercel login ; vercel link"; exit 1
}

# Parse do .env.local -> hashtable (remove aspas externas simples/duplas).
$map = @{}
foreach ($raw in Get-Content -LiteralPath $envFile) {
  $line = $raw.Trim()
  if ($line -eq '' -or $line.StartsWith('#')) { continue }
  $idx = $line.IndexOf('=')
  if ($idx -lt 1) { continue }
  $k = $line.Substring(0, $idx).Trim()
  $v = $line.Substring($idx + 1).Trim()
  if ($v.Length -ge 2 -and
      (($v[0] -eq '"' -and $v[-1] -eq '"') -or ($v[0] -eq "'" -and $v[-1] -eq "'"))) {
    $v = $v.Substring(1, $v.Length - 2)
  }
  $map[$k] = $v
}

Write-Host "Sincronizando segredos de .env.local -> Vercel ($($environments -join ', '))"
$pushed = 0; $skipped = 0
foreach ($key in $secretKeys) {
  if (-not $map.ContainsKey($key) -or [string]::IsNullOrEmpty($map[$key])) {
    Write-Host "  - ${key}: ausente no .env.local -> pulado"
    $skipped++
    continue
  }
  $val = $map[$key]
  foreach ($target in $environments) {
    # Idempotente: remove se existir, depois adiciona. O valor vai por stdin,
    # nunca e impresso.
    & vercel env rm $key $target --yes *> $null
    $val | & vercel env add $key $target *> $null
    if ($LASTEXITCODE -ne 0) { Write-Warning "Falha ao cadastrar $key em $target"; continue }
    Write-Host "  + $key -> $target"
    $pushed++
  }
}

Write-Host "Concluido: $pushed cadastrada(s), $skipped pulada(s). Confira com:  vercel env ls"
