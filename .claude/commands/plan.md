---
description: Create a detailed implementation plan before writing code
---

# /plan — Implementation Planning

Enter plan mode to design the implementation approach before writing code.

## Steps

1. **Understand the requirement**: Clarify what needs to be built or changed.

2. **Explore the codebase**:
   - Identify which files will be created or modified
   - Understand existing patterns and conventions
   - Map dependencies between modules

3. **Design the approach**:
   - List specific files to create/modify with descriptions of changes
   - Identify type changes needed in `src/types.ts`
   - Consider error handling strategy
   - Consider test strategy

4. **Assess risks**:
   - What could break? (existing patches, CLI compatibility)
   - What's the rollback plan?
   - Are there performance implications?

5. **Present the plan** for user review before implementation.

## Plan Template
```
## Goal
[One sentence describing what we're building]

## Files to Change
- `src/file.ts` — [what changes and why]

## New Files
- `src/new-file.ts` — [purpose]

## Test Plan
- Unit tests for [modules]
- E2E test for [workflow]

## Risks
- [risk] → [mitigation]
```
