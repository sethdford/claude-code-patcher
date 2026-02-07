# Security Rules

## Secrets
- **Never** commit API keys, tokens, or credentials to source code
- Use environment variables for all secrets
- `.env` and `.env.local` are gitignored — keep secrets there
- Hook scripts must not log environment variable values

## Input Validation
- Validate all external inputs (CLI args, config files, JSON payloads)
- Use Zod schemas for structured validation
- File paths: validate against traversal attacks (`../`)
- Reject untrusted input before processing

## Code Execution
- No `eval()`, `new Function()`, or dynamic code execution from user input
- `execSync` / `exec` calls must not interpolate user input into commands
- Config file loading via `import()` is acceptable (ESM module loading)
- Shell commands must use proper escaping or argument arrays

## File Operations
- Use absolute paths or validated relative paths
- Backup operations must be atomic (write temp file, then rename)
- Preserve file permissions when modifying files
- Clean up temporary files on error

## Dependencies
- Zero runtime dependencies — maintain this
- Audit dev dependencies: `npm audit`
- Pin critical dev dependency versions
- Review any new dependency additions carefully

## Error Messages
- Do not leak file system paths in user-facing errors
- Do not expose stack traces in production output
- Log errors to stderr, not stdout (stdout is for tool output)
