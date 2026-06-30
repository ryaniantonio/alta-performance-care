#!/usr/bin/env bash
# setup-claude-code.sh - bootstrap the Claude Code workflow for alta-performance-care.
#
# Run once after cloning, on macOS / Linux (or Git Bash / WSL on Windows):
#   bash scripts/setup-claude-code.sh
#
# What it does: checks prerequisites, installs deps, and verifies the committed
# AI artifacts are present. It does NOT install global tools for you - it prints
# the exact next steps. See docs/SETUP-CLAUDE-CODE.md for the full guide.

set -euo pipefail

# Resolve repo root (this script lives in <root>/scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "==> Setup Claude Code - alta-performance-care"
echo "    repo: $ROOT"
echo

check() { # check "<label>" "<command>"
  if command -v "$2" >/dev/null 2>&1; then
    echo "  [ok]    $1 -> $(command -v "$2")"
    return 0
  else
    echo "  [MISSING] $1 (command '$2' not found)"
    return 1
  fi
}

echo "== Prerequisites =="
check "Node.js"          node   || true
check "npm"              npm    || true
check "git"              git    || true
check "GitHub CLI (gh)"  gh     || true
check "Claude Code CLI"  claude || true
HAS_BUN=0; check "bun (optional)" bun && HAS_BUN=1 || true
echo

echo "== Install dependencies =="
if [ -f "$ROOT/bun.lock" ] && [ "$HAS_BUN" -eq 1 ]; then
  echo "  bun.lock found - running 'bun install'"
  ( cd "$ROOT" && bun install )
elif command -v npm >/dev/null 2>&1; then
  echo "  running 'npm install'"
  ( cd "$ROOT" && npm install )
else
  echo "  [skip] no npm/bun available - install Node.js first"
fi
echo

echo "== Committed AI artifacts (arrive via git clone) =="
for a in \
  "CLAUDE.md" \
  ".claude/rules" \
  ".claude/settings.json" \
  ".agents" \
  "docs/prompts/prompts-design-backend-senior.md" \
  "docs/components-catalog.md" \
  "docs/TRANSFER-MANIFEST.md"; do
  if [ -e "$ROOT/$a" ]; then
    echo "  [ok]    $a"
  else
    echo "  [MISSING] $a"
    if [ "$a" = ".claude/settings.json" ]; then
      echo "            -> create it from docs/SETUP-CLAUDE-CODE.md (team permission baseline)"
    fi
  fi
done
echo

echo "== Manual steps (per machine, NOT in the repo) =="
echo "  1. Install Claude Code (CLI + VS Code extension):"
echo "       - VS Code: install the 'Claude Code' extension from the Marketplace, then sign in."
echo "       - CLI: follow https://docs.claude.com/claude-code (npm i -g @anthropic-ai/claude-code, or the native installer)."
echo "  2. Authenticate GitHub CLI so 'gh issue create' works:  gh auth login"
echo "  3. Open this folder in VS Code. Rules in .claude/rules/ auto-load by path; CLAUDE.md loads globally."
echo "  4. (Optional) Connect MCP servers / connectors you use (Playwright, etc.)."
echo "  5. Memory is PERSONAL and per-machine (~/.claude/...) - it is NOT shared and builds itself as you work."
echo
echo "Done. See docs/SETUP-CLAUDE-CODE.md for the full split and details."
