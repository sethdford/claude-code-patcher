# Claude Code Patcher

**Feature gate detection, analysis, and patching for Claude Code.**

Detect, scan, and patch Statsig feature gates (`tengu_*` flags) in Claude Code's JS bundle or native binary. Supports both npm-installed JS bundles and compiled native binaries (Node.js SEA).

## Quick Start

```bash
# Install
npm install -g claude-code-patcher

# List all detected feature gates
claude-patcher gates

# Enable a specific gate
claude-patcher gates enable swarm

# Enable all patchable gates
claude-patcher gates enable --all

# Scan binary for all tengu_* flags
claude-patcher gates scan

# Restore from backup
claude-patcher gates reset
```

## CLI Reference

```bash
claude-patcher gates                    # List all detected feature gates
claude-patcher gates scan               # Scan binary for all tengu_* flags
claude-patcher gates enable <name>      # Enable a patchable gate
claude-patcher gates enable --all       # Enable all patchable gates
claude-patcher gates disable <name>     # Disable a gate (restore from backup)
claude-patcher gates reset              # Restore all gates from backup
```

### Options

```bash
--cli <path>       # Specify Claude Code CLI path (auto-detected by default)
--help, -h         # Show help
--version, -v      # Show version
```

## Patchable Gates

These gates have reverse-engineered function bodies and can be force-enabled:

| Codename | Flag | Tier | Env Override | Description |
|----------|------|------|-------------|-------------|
| `swarm-mode` | `tengu_brass_pebble` | 2 | `CLAUDE_CODE_AGENT_SWARMS` | Multi-agent coordination (TeammateTool, delegate) |
| `team-mode` | `tengu_brass_pebble` | 3 | `CLAUDE_CODE_TEAM_MODE` | Team mode task/team features |
| `workout-v2` | `tengu_workout2` | 1 | | Workout v2 feature iteration |
| `keybinding-customization` | `tengu_keybinding_customization_release` | 1 | | Custom keyboard shortcut configuration |
| `session-memory` | `tengu_session_memory` | 1 | | Persistent memory across sessions |
| `oboe` | `tengu_oboe` | 2 | `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Auto Memory (~/.claude/memory/MEMORY.md) |
| `amber-flint` | `tengu_amber_flint` | 2 | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Agent Teams feature gate |
| `silver-lantern` | `tengu_silver_lantern` | 3 | | Promo mode selector (subscription-based) |
| `copper-lantern` | `tengu_copper_lantern` | 3 | | Pro/Max subscription promo banner |

### Gate Tiers

- **Tier 1** — Simple wrappers: `function X(){return checkGate("tengu_flag",!1)}`
- **Tier 2** — Env-guarded: env var check, then Statsig check
- **Tier 3** — Complex: multi-branch returns, subscription checks
- **Tier 4** — Too complex: env var override preferred (detection-only)
- **Tier 5** — Inline checks: no wrapper function (detection-only)

## Detection-Only Gates

These gates are detected in the binary but are either too complex to patch or have env var overrides:

| Codename | Flag | Notes |
|----------|------|-------|
| `chomp-inflection` | `tengu_chomp_inflection` | Prompt suggestions. Env: `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` |
| `vinteuil-phrase` | `tengu_vinteuil_phrase` | Simplified system prompt. Env: `CLAUDE_CODE_SIMPLE` |
| `speculation` | `tengu_speculation` | Speculative execution (inline, Tier 5) |
| `structured-output` | `tengu_structured_output_enabled` | Structured output mode (inline, Tier 5) |
| `streaming-tool-exec-v2` | `tengu_streaming_tool_execution2` | Streaming tool execution v2 (inline, Tier 5) |
| `thinkback` | `tengu_thinkback` | Year-in-review animation skill (inline, Tier 5) |
| `system-prompt-global-cache` | `tengu_system_prompt_global_cache` | Global prompt cache. Env: `CLAUDE_CODE_FORCE_GLOBAL_CACHE` |

Plus 15 reverse-engineered gates: `marble-anvil` (clear thinking beta), `marble-kite` (write/edit guardrail bypass), `coral-fern` (past session access), `quiet-fern` (VS Code experiment), `plank-river-frost` (prompt suggestions), `scarf-coffee` (conditional tool injection), `cork-m4q` (policy spec injection), `tst-kx7` (tool search experiment), `plum-vx3` (WebSearch behavior), `tool-pear` (tool schema filtering), `flicker` (TUI telemetry), `quartz-lantern` (subscription), `cache-plum-violet` (cache variant), `kv7-prompt-sort` (prompt reordering), `workout` (v1, superseded).

## Flag Taxonomy

Of the **605 unique `tengu_*` flags** in the v2.1.37 binary, most are telemetry event names (passed to `logEvent()`), not feature gates. The ~30 codename-style gates above are the ones that control feature availability via `checkGate()`. Additionally, 114 `CLAUDE_CODE_*` env vars, 23 `DISABLE_*` toggles, and 12 `ENABLE_*` toggles provide runtime feature control.

See [docs/TENGU-FLAGS.md](docs/TENGU-FLAGS.md) for the complete flag catalog organized by category.
See [docs/ENV-VARS.md](docs/ENV-VARS.md) for the complete environment variable reference.

## Environment Variable Overrides

Some features can be toggled via environment variables without binary patching:

| Variable | Effect |
|----------|--------|
| `CLAUDE_CODE_AGENT_SWARMS` | Controls swarm/multi-agent features |
| `CLAUDE_CODE_TEAM_MODE` | Experimental team mode |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Disable auto memory (oboe gate) |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Agent teams (amber-flint gate) |
| `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | Prompt suggestions (detection-only) |
| `CLAUDE_CODE_SIMPLE` | Simplified system prompt (detection-only) |
| `CLAUDE_CODE_FORCE_GLOBAL_CACHE` | Global system prompt cache (detection-only) |

## Programmatic API

```typescript
import {
  detectAllGates,
  detectPatchableGates,
  scanAllFlags,
  enableGate,
  disableGate,
  enableAllGates,
  resetGates,
  getAllGates,
  findGate,
  isPatchable,
} from 'claude-code-patcher';

// Detect all registered gates
const gates = detectAllGates();

// Scan for all tengu_* flags
const allFlags = scanAllFlags();

// Check a specific gate
const gate = findGate('swarm-mode');
console.log(gate?.description);

// Enable/disable
enableGate('swarm-mode');
disableGate('swarm-mode');

// Enable all patchable gates
enableAllGates();

// Reset from backup
resetGates();
```

## How It Works

1. **Locate** — Finds the Claude Code CLI (npm global, home dir, or `which claude`)
2. **Read** — JS bundles as UTF-8; native binaries as latin1 (preserves byte offsets)
3. **Detect** — Each gate's `detectRegex` is matched against the bundle
4. **Backup** — Timestamped copy before any modification
5. **Patch** — Replace gate function body to force `return!0` (always enabled)
6. **Mark** — Inject marker comment for identification (`CLAUDE-CODE-PATCHER FEATURE GATES:codename`)

Binary patches use byte-length-preserving replacements padded with JS block comments.

## Architecture

```
src/
  cli.ts              # CLI interface
  cli-finder.ts       # Locates Claude Code installations
  types.ts            # Type definitions
  index.ts            # Public API exports
  gates/
    registry.ts       # Gate registry (9 patchable, 20 detection-only)
    detector.ts       # Gate detection in JS/binary bundles
    patcher.ts        # Gate enable/disable for JS bundles
    binary-patcher.ts # Gate patching for native binaries
    index.ts          # Gate API exports
docs/
  FEATURE-GATES.md    # Patchable gates reference
  TENGU-FLAGS.md      # Complete 572-flag catalog
```

Zero runtime dependencies. Node.js >= 18.0.0.

## Development

```bash
npm run build        # Compile TypeScript
npm test             # Run tests
npm run dev          # Watch mode
npm run lint         # ESLint
```

## Version Compatibility

| Claude Code Version | Status |
|---------------------|--------|
| 2.1.x | Tested |
| 2.0.x | Tested |
| 1.x | May work |

Gate regexes may need updating when Claude Code updates change the minified output.

## License

MIT

## Disclaimer

This is an unofficial project and is not affiliated with or endorsed by Anthropic. It modifies the Claude Code CLI through binary patching and may break with updates. Use at your own risk. Feature gate names and behaviors may change between Claude Code versions. Always create backups before patching.
