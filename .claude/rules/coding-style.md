# Coding Style Rules

These rules apply to all TypeScript/JavaScript code in this project.

## Type Safety
- **No `any` types** — use `unknown` with type guards, generics, or specific types
- All function parameters must have type annotations
- All exported functions must have explicit return types
- Use `import type` for type-only imports
- Prefer interfaces over type aliases for object shapes

## Code Organization
- Types defined in `src/types.ts` — do not scatter type definitions
- One module per file, named to match its primary export
- Files must be under 500 lines — split into modules if larger
- Imports ordered: `node:*` → external packages → internal modules → relative

## Style
- Single quotes for strings
- Semicolons required
- `const` by default, `let` only when reassignment is needed, never `var`
- Template literals for string interpolation (not concatenation)
- Arrow functions for callbacks, regular functions for named exports

## Naming
- `camelCase` for variables and functions
- `PascalCase` for types, interfaces, and classes
- `UPPER_SNAKE_CASE` for constants
- Descriptive names — no single-letter variables except loop indices (`i`, `j`)
- Boolean variables prefixed with `is`, `has`, `should`, `can`

## Error Handling
- Always provide context in error messages: what happened, what was expected, what to do
- Use Error objects, not string throws
- Async functions: try/catch with proper error propagation
- Never swallow errors silently — at minimum log them
