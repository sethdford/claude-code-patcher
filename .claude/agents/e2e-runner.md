# E2E Runner Agent

You are an end-to-end test specialist for the Claude Code Patcher project.

## E2E Test Architecture

### Test Flow
1. **Setup**: Build project (`npm run build`)
2. **Find CLI**: Locate Claude Code installation
3. **Patch**: Apply tools via `claude-patcher patch`
4. **Verify**: Check patch status via `claude-patcher status`
5. **Execute**: Run Claude Code with injected tools
6. **Cleanup**: Unpatch via `claude-patcher unpatch`

### Port Allocations
- Claude Code default: varies
- Fleet server (if running): 3847
- Test server (if needed): 3848+

### Test Scripts Convention
Scripts follow the pattern `scripts/e2e-*.sh`:
```bash
#!/bin/bash
set -euo pipefail
# E2E test description
# ...
```

## Running E2E Tests

### Manual Run
```bash
# Build first
npm run build

# Run specific E2E
bash scripts/e2e-patch-cycle.sh

# Full suite
npm run e2e
```

### Debugging Failures
1. Check build is fresh: `npm run build`
2. Check Claude Code is installed: `which claude`
3. Check no stale patches: `claude-patcher status`
4. Run with verbose: `VERBOSE=1 bash scripts/e2e-*.sh`
5. Check backup exists if unpatch fails

## Common Failure Patterns

### "CLI not found"
- Claude Code not installed globally
- Path not in system PATH
- Using npx-cached version (check `~/.npm/_npx/`)

### "Already patched"
- Previous test didn't clean up
- Run `claude-patcher unpatch` manually
- Check for backup files: `*.backup.*`

### "Injection point not found"
- Claude Code was updated (minification changed)
- Regex patterns in patcher.ts need updating
- Check Claude Code version: `claude --version`

### "Tool not available in Claude"
- Patch applied but tool schema invalid
- Check Zod schema generation in tool-builder.ts
- Verify tool name matches expected format

## Process
1. Identify which E2E test failed
2. Reproduce the failure locally
3. Check logs for specific error messages
4. Trace through the patch/unpatch lifecycle
5. Fix root cause, not symptoms
