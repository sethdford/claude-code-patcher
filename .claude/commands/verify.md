---
description: Run the full verification pipeline (typecheck → lint → test → build)
---

# /verify — Full Verification Pipeline

Run all quality checks in sequence. Stops at the first failure.

## Pipeline

### 1. Type Check
```bash
npx tsc --noEmit
```
Ensures all TypeScript types are correct without producing output files.

### 2. Lint
```bash
npm run lint
```
Checks code style and catches common issues via ESLint.

### 3. Unit Tests
```bash
npx vitest run --reporter=verbose
```
Runs all unit tests. Target: 60% coverage.

### 4. Build
```bash
npm run build
```
Full TypeScript compilation to `dist/`.

### 5. Smoke Test
```bash
node dist/cli.js --help
node dist/cli.js list
```
Verify the built CLI is functional.

## On Failure
- Report which step failed
- Show the specific error output
- Suggest the fix (use `/build-fix` for type errors, manual fix for test failures)

## On Success
Report all steps passed with a summary:
```
✅ Type check passed
✅ Lint passed (0 warnings)
✅ Tests passed (X/Y)
✅ Build succeeded
✅ Smoke test passed
```
