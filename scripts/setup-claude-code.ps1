<#
  setup-claude-code.ps1 - bootstrap the Claude Code workflow for alta-performance-care.

  Run once after cloning, on Windows PowerShell:
    powershell -ExecutionPolicy Bypass -File scripts\setup-claude-code.ps1
  or PowerShell 7+:
    pwsh ./scripts/setup-claude-code.ps1

  What it does: checks prerequisites, installs deps, and verifies the committed
  AI artifacts are present. It does NOT install global tools for you - it prints
  the exact next steps. See docs/SETUP-CLAUDE-CODE.md for the full guide.
#>

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "==> Setup Claude Code - alta-performance-care" -ForegroundColor Cyan
Write-Host "    repo: $repoRoot"
Write-Host ""

function Test-Tool($label, $cmd) {
  $found = Get-Command $cmd -ErrorAction SilentlyContinue
  if ($found) {
    Write-Host ("  [ok]      {0} -> {1}" -f $label, $found.Source) -ForegroundColor Green
    return $true
  }
  Write-Host ("  [MISSING] {0} (command '{1}' not found)" -f $label, $cmd) -ForegroundColor Yellow
  return $false
}

Write-Host "== Prerequisites =="
[void](Test-Tool "Node.js"         "node")
$hasNpm = Test-Tool "npm"          "npm"
[void](Test-Tool "git"             "git")
[void](Test-Tool "GitHub CLI (gh)" "gh")
[void](Test-Tool "Claude Code CLI" "claude")
$hasBun = Test-Tool "bun (optional)" "bun"
Write-Host ""

Write-Host "== Install dependencies =="
if ((Test-Path (Join-Path $repoRoot "bun.lock")) -and $hasBun) {
  Write-Host "  bun.lock found - running 'bun install'"
  Push-Location $repoRoot; try { bun install } finally { Pop-Location }
}
elseif ($hasNpm) {
  Write-Host "  running 'npm install'"
  Push-Location $repoRoot; try { npm install } finally { Pop-Location }
}
else {
  Write-Host "  [skip] no npm/bun available - install Node.js first" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "== Committed AI artifacts (arrive via git clone) =="
$artifacts = @(
  "CLAUDE.md",
  ".claude/rules",
  ".claude/settings.json",
  ".agents",
  "docs/prompts/prompts-design-backend-senior.md",
  "docs/components-catalog.md",
  "docs/TRANSFER-MANIFEST.md"
)
foreach ($a in $artifacts) {
  if (Test-Path (Join-Path $repoRoot $a)) {
    Write-Host ("  [ok]      {0}" -f $a) -ForegroundColor Green
  }
  else {
    Write-Host ("  [MISSING] {0}" -f $a) -ForegroundColor Yellow
    if ($a -eq ".claude/settings.json") {
      Write-Host "            -> create it from docs/SETUP-CLAUDE-CODE.md (team permission baseline)"
    }
  }
}
Write-Host ""

Write-Host "== Manual steps (per machine, NOT in the repo) ==" -ForegroundColor Cyan
Write-Host "  1. Install Claude Code (CLI + VS Code extension):"
Write-Host "       - VS Code: install the 'Claude Code' extension from the Marketplace, then sign in."
Write-Host "       - CLI: follow https://docs.claude.com/claude-code (npm i -g @anthropic-ai/claude-code, or the native installer)."
Write-Host "  2. Authenticate GitHub CLI so 'gh issue create' works:  gh auth login"
Write-Host "  3. Open this folder in VS Code. Rules in .claude/rules/ auto-load by path; CLAUDE.md loads globally."
Write-Host "  4. (Optional) Connect MCP servers / connectors you use (Playwright, etc.)."
Write-Host "  5. Memory is PERSONAL and per-machine (~/.claude/...) - it is NOT shared and builds itself as you work."
Write-Host ""
Write-Host "Done. See docs/SETUP-CLAUDE-CODE.md for the full split and details."
