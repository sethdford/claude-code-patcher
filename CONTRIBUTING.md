# Contributing to Claude Code Patcher

Thanks for your interest in contributing! This project reverse-engineers and patches Claude Code feature gates, so contributions around new gate discoveries, regex updates for new versions, and test coverage are especially welcome.

## Development Setup

```bash
git clone https://github.com/your-username/claude-code-patcher.git
cd claude-code-patcher
npm install
npm run build
```

## Running Tests

We use [Vitest](https://vitest.dev/) with a 60% coverage minimum for statements, lines, and functions.

```bash
npm test                        # Run all tests
npx vitest run --coverage       # Run with coverage report
npm run test:watch              # Watch mode
```

All tests must pass before merging. New features and bug fixes must include tests.

## Code Style

- TypeScript with strict typing (no `any`)
- Zero runtime dependencies
- Single quotes, semicolons, `const` by default
- See [.claude/rules/coding-style.md](.claude/rules/coding-style.md) for the full style guide

## Adding a New Gate

1. **Add the gate entry** to `src/gates/registry.ts` in either `PATCHABLE_GATES` or `DETECTION_ONLY_GATES`
2. **Include a `detectRegex`** that matches the gate in the minified bundle
3. **For patchable gates**, implement `patchFn`, `unpatchFn`, and `semanticReplacement`
4. **Add tests** covering detection, patching, and unpatching
5. **Update docs** — add the gate to `docs/FEATURE-GATES.md`
6. **Run the full test suite** to verify nothing breaks: `npm test`

## Commit Messages

Use [conventional commits](https://www.conventionalcommits.org/):

```
feat(gates): add new marble-anvil gate detection
fix(patcher): update silver-lantern regex for v2.1.37
docs: update FEATURE-GATES.md with new gate descriptions
test(gates): add coverage for binary patcher codesign
```

For AI-assisted contributions, include the co-author trailer:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

## Pull Requests

- Keep PRs small and focused — one feature or fix per PR
- CI must pass (lint, typecheck, tests)
- Link related issues in the PR description
- Describe what changed and why
