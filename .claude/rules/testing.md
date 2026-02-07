# Testing Rules

## Framework
- **Vitest** for all unit and integration tests
- Test files: `*.test.ts` co-located with source files or in `tests/` directory
- E2E scripts: `scripts/e2e-*.sh` (bash)

## Coverage
- Minimum threshold: 60% for statements, lines, and functions
- Run coverage: `npx vitest run --coverage`
- New code must include tests — no untested features merged

## Test Structure
- One `describe` block per module/function
- Test names start with "should": `it('should return null for missing files')`
- Use `beforeEach` for shared setup, `afterEach` for cleanup
- Keep tests independent — no shared mutable state between tests

## Test Quality
- Test behavior, not implementation details
- Include both happy path and error path tests
- Mock external dependencies (file system, network, CLI binaries)
- No `any` types in test code either
- Test timeout: 10 seconds per test

## What to Test
- All exported functions
- Error conditions and edge cases
- Type validation (invalid inputs)
- CLI argument parsing
- Tool schema generation

## What Not to Test
- Private/internal functions directly (test via public API)
- Third-party library behavior
- TypeScript compiler behavior
