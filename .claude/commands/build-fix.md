---
description: Fix TypeScript build errors using the build-resolver agent
---

# /build-fix — Resolve Build Errors

Invoke the build-resolver agent to diagnose and fix TypeScript compilation errors.

## Steps

1. **Run the build**: Execute `npx tsc --noEmit` to get the full error list.

2. **Categorize errors**:
   - Import resolution (missing `.js` extensions, wrong paths)
   - Type mismatches (incompatible types, missing properties)
   - Missing declarations (undeclared variables, missing type exports)
   - ESM compatibility (dynamic imports, `import type` usage)

3. **Fix in dependency order**:
   - `src/types.ts` first (type definitions)
   - Then utility modules (`cli-finder.ts`, `tool-builder.ts`)
   - Then core modules (`patcher.ts`)
   - Finally `cli.ts` (depends on everything else)

4. **Verify**: Run `npm run build` to confirm compilation succeeds.

5. **Lint check**: Run `npm run lint` to catch remaining style issues.

## Common Fixes
- Missing `.js` in imports → add `.js` extension
- `any` type errors → replace with `unknown` + type guard
- Missing `node:` prefix → add `node:` to Node.js built-in imports
