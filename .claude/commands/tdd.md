---
description: Start a TDD (test-driven development) workflow for a feature or fix
---

# /tdd — Test-Driven Development

Follow strict Red-Green-Refactor discipline using the tdd-guide agent.

## Steps

1. **Clarify the requirement**: Ask what behavior needs to be implemented or fixed.

2. **Red phase**: Write a failing test first.
   - Create or find the appropriate test file (co-located `*.test.ts`)
   - Write a test that describes the expected behavior
   - Run `npx vitest run <test-file>` to confirm it fails

3. **Green phase**: Write the minimum code to pass.
   - Implement only what's needed to make the test pass
   - Run `npx vitest run <test-file>` to confirm it passes

4. **Refactor phase**: Clean up without changing behavior.
   - Remove duplication, improve naming
   - Run `npx vitest run` to confirm all tests still pass

5. **Repeat** for the next behavior increment.

## Constraints
- Never write implementation code before a failing test
- Each test should verify one specific behavior
- Test file naming: `<module>.test.ts` in same directory as source
- Coverage target: 60% (statements, lines, functions)
