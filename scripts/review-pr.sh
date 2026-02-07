#!/bin/bash
set -euo pipefail

# review-pr.sh — Automated Code Review via Claude
#
# Usage:
#   ./scripts/review-pr.sh <PR-number>
#   ./scripts/review-pr.sh <branch-name>
#   ./scripts/review-pr.sh              # Reviews current branch vs main

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Determine diff source
TARGET="${1:-}"
DIFF=""

if [[ -z "$TARGET" ]]; then
  # No argument — diff current branch against main
  echo "Reviewing current branch against main..."
  DIFF=$(git diff main...HEAD 2>/dev/null || git diff HEAD~5...HEAD 2>/dev/null || echo "")
elif [[ "$TARGET" =~ ^[0-9]+$ ]]; then
  # Numeric — treat as PR number
  echo "Reviewing PR #$TARGET..."
  if command -v gh &>/dev/null; then
    DIFF=$(gh pr diff "$TARGET" 2>/dev/null || echo "")
  else
    echo "Error: gh CLI not installed. Install with: brew install gh"
    exit 1
  fi
else
  # Branch name
  echo "Reviewing branch $TARGET against main..."
  DIFF=$(git diff "main...$TARGET" 2>/dev/null || echo "")
fi

if [[ -z "$DIFF" ]]; then
  echo "No changes found to review."
  exit 0
fi

# Count changed lines
ADDITIONS=$(echo "$DIFF" | grep -c "^+" || true)
DELETIONS=$(echo "$DIFF" | grep -c "^-" || true)
echo "Changes: +$ADDITIONS / -$DELETIONS lines"
echo ""

# Send to Claude for review
REVIEW_PROMPT="You are a code reviewer for the Claude Code Patcher project (TypeScript, ESM, zero runtime deps).

Review this diff and provide feedback in three categories:

## Critical (must fix)
Security issues, bugs, data loss risks, broken functionality.

## Warning (should fix)
Missing type annotations, explicit 'any' usage, missing error handling,
files over 500 lines, import order issues.

## Suggestion (nice to have)
Readability improvements, naming suggestions, documentation gaps.

For each finding, provide:
- File and line reference
- What's wrong
- Suggested fix (code snippet if applicable)

DIFF:
$DIFF"

if command -v claude &>/dev/null; then
  echo "$REVIEW_PROMPT" | claude --print
else
  echo "Error: Claude Code CLI not found."
  echo "Install with: npm i -g @anthropic-ai/claude-code"
  exit 1
fi
