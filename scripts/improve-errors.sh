#!/bin/bash
set -euo pipefail

# improve-errors.sh — Enhance error messages via Claude
#
# Scans for generic error messages and improves them with:
#   - Context about what went wrong
#   - Actionable guidance for the user
#   - Consistent error prefix pattern: [MODULE] description
#
# Usage:
#   ./scripts/improve-errors.sh                # All src/ .ts files
#   ./scripts/improve-errors.sh src/cli.ts     # Specific file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

TARGET="${1:-}"

if [[ -n "$TARGET" ]]; then
  FILES="$TARGET"
else
  FILES=$(find "$PROJECT_ROOT/src" -name "*.ts" -not -name "*.d.ts" -not -name "*.test.ts" | sort)
fi

if ! command -v claude &>/dev/null; then
  echo "Error: Claude Code CLI not found."
  echo "Install with: npm i -g @anthropic-ai/claude-code"
  exit 1
fi

echo "Scanning for improvable error messages..."
echo ""

for FILE in $FILES; do
  if [[ ! -f "$FILE" ]]; then
    continue
  fi

  RELATIVE=$(realpath --relative-to="$PROJECT_ROOT" "$FILE" 2>/dev/null || echo "$FILE")

  # Check if file has error patterns worth improving
  if ! grep -qE "(throw new Error|console\.error|process\.exit\(1\)|catch)" "$FILE"; then
    continue
  fi

  echo "Analyzing: $RELATIVE"

  CONTENT=$(cat "$FILE")

  PROMPT="Review the error messages in this TypeScript file and suggest improvements.

Rules for good error messages:
1. Include what operation was being attempted
2. Include what went wrong (the actual error)
3. Include how to fix it (actionable next step)
4. Use consistent prefixes matching the module: [PATCHER], [CLI], [FINDER], [TOOLS]
5. Don't expose internal file paths or stack traces to users

For each improvable error message, output:
- Line number
- Current message
- Suggested improvement

File: $RELATIVE
\`\`\`typescript
$CONTENT
\`\`\`"

  echo "$PROMPT" | claude --print 2>/dev/null || echo "  ⚠️  Analysis failed"
  echo ""
done

echo "Done. Review suggestions and apply manually."
