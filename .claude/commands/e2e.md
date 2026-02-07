---
description: Run the full end-to-end test suite
---

# /e2e — End-to-End Tests

Run the E2E test suite using the e2e-runner agent.

## Steps

1. **Pre-flight checks**:
   - Verify `npm run build` succeeds (fresh build)
   - Verify Claude Code is installed (`which claude`)
   - Verify no stale patches (`claude-patcher status`)

2. **Run E2E suite**:
   - Execute E2E test scripts in `scripts/e2e-*.sh`
   - If no E2E scripts exist, run the patch → verify → unpatch lifecycle manually

3. **Patch lifecycle test**:
   ```bash
   npm run build
   node dist/cli.js patch --all
   node dist/cli.js status
   node dist/cli.js unpatch
   ```

4. **Report results**: Pass/fail for each test, with failure details.

5. **Cleanup**: Ensure Claude Code is unpatched after tests complete.

## Troubleshooting
- "CLI not found" → install Claude Code: `npm i -g @anthropic-ai/claude-code`
- "Already patched" → run `node dist/cli.js unpatch` first
- Build failures → run `/build-fix` first
