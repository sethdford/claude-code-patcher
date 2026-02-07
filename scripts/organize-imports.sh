#!/bin/bash
set -euo pipefail

# organize-imports.sh — Organize TypeScript imports via Claude
#
# Groups imports in order:
#   1. node:* (Node.js builtins)
#   2. External packages
#   3. Internal modules (absolute paths)
#   4. Relative imports
#
# Also converts type-only imports to `import type { ... }`.
#
# Usage:
#   ./scripts/organize-imports.sh                # All src/ .ts files
#   ./scripts/organize-imports.sh src/cli.ts     # Specific file

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

TARGET="${1:-}"

if [[ -n "$TARGET" ]]; then
  FILES="$TARGET"
else
  FILES=$(find "$PROJECT_ROOT/src" -name "*.ts" -not -name "*.d.ts" | sort)
fi

if ! command -v claude &>/dev/null; then
  echo "Error: Claude Code CLI not found."
  echo "Install with: npm i -g @anthropic-ai/claude-code"
  exit 1
fi

FILE_COUNT=$(echo "$FILES" | wc -l | tr -d ' ')
echo "Organizing imports in $FILE_COUNT file(s)..."
echo ""

for FILE in $FILES; do
  if [[ ! -f "$FILE" ]]; then
    echo "Skipping: $FILE (not found)"
    continue
  fi

  RELATIVE=$(realpath --relative-to="$PROJECT_ROOT" "$FILE" 2>/dev/null || echo "$FILE")
  echo "Processing: $RELATIVE"

  CONTENT=$(cat "$FILE")

  PROMPT="Reorganize the imports in this TypeScript file. Rules:
1. Group imports in this order (with blank line between groups):
   - node:* built-ins
   - External packages (from node_modules)
   - Internal absolute imports
   - Relative imports (./ and ../)
2. Within each group, sort alphabetically by module path
3. Use 'import type' for type-only imports
4. Remove any unused imports
5. Keep all non-import code exactly as-is

Output ONLY the complete file content with reorganized imports. No explanations.

File: $RELATIVE
\`\`\`typescript
$CONTENT
\`\`\`"

  RESULT=$(echo "$PROMPT" | claude --print 2>/dev/null || echo "")

  if [[ -n "$RESULT" && "$RESULT" != "$CONTENT" ]]; then
    echo "$RESULT" > "$FILE"
    echo "  ✅ Imports organized"
  else
    echo "  ⏭️  No changes needed"
  fi
done

echo ""
echo "Done. Run 'npm run build' to verify."
