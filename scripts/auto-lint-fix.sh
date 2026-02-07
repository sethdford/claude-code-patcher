#!/bin/bash
set -euo pipefail

# auto-lint-fix.sh — Two-pass ESLint fix
#
# Pass 1: ESLint --fix for auto-fixable issues
# Pass 2: Claude for non-auto-fixable issues
#
# Usage:
#   ./scripts/auto-lint-fix.sh              # Fix all src/ files
#   ./scripts/auto-lint-fix.sh src/cli.ts   # Fix specific file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

TARGET="${1:-src}"

echo "=== Pass 1: ESLint Auto-Fix ==="
echo ""

cd "$PROJECT_ROOT"

# Run ESLint --fix
ESLINT_OUTPUT=""
if npx eslint --fix "$TARGET" --ext .ts 2>&1; then
  echo "✅ All auto-fixable issues resolved."
  echo ""
else
  ESLINT_OUTPUT=$(npx eslint "$TARGET" --ext .ts --format stylish 2>&1 || true)
  REMAINING=$(echo "$ESLINT_OUTPUT" | grep -c "problem" || echo "0")
  echo "⚠️  $REMAINING remaining issues after auto-fix."
  echo ""
fi

# Check if there are remaining issues
ESLINT_OUTPUT=$(npx eslint "$TARGET" --ext .ts --format stylish 2>&1 || true)

if echo "$ESLINT_OUTPUT" | grep -q "0 problems"; then
  echo "✅ No lint issues remaining."
  exit 0
fi

if [[ -z "$ESLINT_OUTPUT" ]]; then
  echo "✅ No lint issues remaining."
  exit 0
fi

echo "=== Pass 2: Claude-Assisted Fixes ==="
echo ""

if ! command -v claude &>/dev/null; then
  echo "Remaining ESLint issues (install Claude Code for automated fixes):"
  echo "$ESLINT_OUTPUT"
  exit 1
fi

PROMPT="Fix these ESLint issues in the Claude Code Patcher project (TypeScript, ESM, strict mode).

ESLint output:
$ESLINT_OUTPUT

Rules:
- Replace 'any' with 'unknown' + type guards
- Add missing return types to exported functions
- Fix import ordering (node:* → external → internal → relative)
- Use 'import type' for type-only imports
- Remove unused variables/imports
- Apply prefer-const

For each file with issues, output the corrected code."

echo "$PROMPT" | claude --print 2>/dev/null || echo "⚠️  Claude analysis failed"

echo ""
echo "=== Verification ==="
echo ""

# Re-run lint to check
if npx eslint "$TARGET" --ext .ts 2>&1; then
  echo "✅ All lint issues resolved."
else
  echo "⚠️  Some issues remain. Review output above."
fi
