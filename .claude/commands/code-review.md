---
description: Run a comprehensive code review on recent changes
---

# /code-review — Code Review

Run the code-reviewer agent on the current changes.

## Steps

1. **Gather changes**: Run `git diff` to see unstaged changes, `git diff --cached` for staged.

2. **Review against checklist**:
   - TypeScript strict compliance (no `any`, proper null checks)
   - Architecture layer rules respected
   - Error handling is complete and user-friendly
   - No unused imports or dead code
   - Files under 500 lines
   - Input validation on all external inputs

3. **Check security concerns**:
   - No secrets in code
   - No command injection in execSync calls
   - File paths validated
   - JSON parsing wrapped in try/catch

4. **Report findings** categorized as Critical / Warning / Suggestion.

5. **Suggest fixes** with specific code snippets for each finding.

## Usage
```
/code-review              # Review all uncommitted changes
/code-review src/cli.ts   # Review specific file
```
