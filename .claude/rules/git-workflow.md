# Git Workflow Rules

## Commit Messages
Use conventional commit format:
```
type(scope): description

Optional body explaining why, not what.

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Types
- `feat`: New feature or capability
- `fix`: Bug fix
- `docs`: Documentation changes only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Maintenance tasks

### Scope
Use the module name: `cli`, `patcher`, `tools`, `types`, `hooks`, `agents`

## Branching
- `main` is the default branch — keep it stable
- Feature branches: `feat/description` or `fix/description`
- No force push to `main` — ever
- Prefer small, focused PRs over large omnibus changes

## AI Commits
- Include `Co-Authored-By: Claude <noreply@anthropic.com>` trailer
- Commit message should reflect the actual change, not "AI generated this"
- Review all changes before committing — AI suggestions need human approval

## Pull Requests
- PR title follows conventional commit format
- Include what changed and why in the description
- Link related issues
- Ensure CI passes before merging
