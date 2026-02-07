# Performance Rules

## Data Structures
- Use ring buffers (fixed-size arrays with index wrapping) for time-series data, not `Array.shift()` which is O(n)
- Prefer `Map` over plain objects for dynamic key collections (better lookup performance)
- Use `Set` for membership checks instead of `Array.includes()`

## Module Loading
- Lazy-load optional modules (native addons) — don't fail at import time
- Use `import()` for conditional dependencies
- Keep the main module export path fast — defer heavy initialization

## File I/O
- Read files once and cache when possible (config files, package.json)
- Use streaming for large files instead of `readFileSync` into memory
- Batch file system operations when processing multiple files

## Concurrency
- Mark read-only tools as `isConcurrencySafe: true` for parallel execution
- Use singleton patterns for stateful accumulators (store caching)
- File-level locks for shared state files (store.json) — use caching with TTL

## CLI Performance
- Minimize startup time — defer imports until needed
- Avoid synchronous operations in hot paths
- Cache CLI location lookups (filesystem traversal is slow)

## Hook Scripts
- Hook timeout budget: 5s for logging, 30s for format, 60s for tests
- Exit early if the hook doesn't apply (check file type first)
- Don't run expensive operations (tsc, vitest) on non-source files
