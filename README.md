# Claude Code Patcher

**Detect, analyze, and patch feature gates in Claude Code.**

[![npm version](https://img.shields.io/npm/v/claude-code-patcher)](https://www.npmjs.com/package/claude-code-patcher)
[![license](https://img.shields.io/npm/l/claude-code-patcher)](LICENSE)
[![node](https://img.shields.io/node/v/claude-code-patcher)](package.json)
[![zero deps](https://img.shields.io/badge/dependencies-0-brightgreen)]()
[![website](https://img.shields.io/badge/website-live-da7756)](https://sethford.github.io/claude-code-patcher/)

## What is this?

Claude Code Patcher scans Claude Code's JS bundles and native binaries to detect, catalog, and optionally patch Statsig feature gates (`tengu_*` flags). It gives you visibility into which features are gated, what each gate controls, and the ability to force-enable gates that are still in rollout. Zero runtime dependencies, works on both npm-installed JS bundles and compiled native binaries (Node.js SEA).

> **605** flags cataloged | **29** gates documented | **9** patchable | **0** runtime deps

## Quick Start

```bash
npm install -g claude-code-patcher

# Scan for all feature gates
claude-patcher gates

# Enable a specific gate
claude-patcher gates enable session-memory

# Scan for all tengu_* flags in the binary
claude-patcher gates scan
```

## What Can You Do?

### :mag: Discover

Scan Claude Code installations for registered feature gates and list all `tengu_*` flags embedded in the binary. The CLI auto-detects your installation path.

```bash
claude-patcher gates          # List all detected feature gates
claude-patcher gates scan     # Scan binary for all 605+ tengu_* flags
```

### :wrench: Enable

Force-enable gated features by patching the JS bundle or native binary. Patches are byte-length-preserving with automatic backup and macOS codesign re-signing.

```bash
claude-patcher gates enable session-memory   # Enable a specific gate
claude-patcher gates enable --all            # Enable all patchable gates
claude-patcher gates disable session-memory  # Restore from backup
claude-patcher gates reset                   # Restore all gates from backup
```

### :books: Research

Every gate has been reverse-engineered from the minified binary. The docs catalog all 605 `tengu_*` flags by category, document 114 `CLAUDE_CODE_*` environment variables, and explain what each gate controls.

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

Detected in the binary but either too complex to patch safely or controllable via environment variables:

| Codename | Description |
|----------|-------------|
| `chomp-inflection` | Prompt suggestions. Env: `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` |
| `vinteuil-phrase` | Simplified system prompt. Env: `CLAUDE_CODE_SIMPLE` |
| `speculation` | Speculative execution (inline, Tier 5) |
| `structured-output` | Structured output mode (inline, Tier 5) |
| `streaming-tool-exec-v2` | Streaming tool execution v2 (inline, Tier 5) |
| `thinkback` | Year-in-review animation skill (inline, Tier 5) |
| `system-prompt-global-cache` | Global prompt cache. Env: `CLAUDE_CODE_FORCE_GLOBAL_CACHE` |

Plus **15 reverse-engineered gates**: `marble-anvil` (clear thinking beta), `marble-kite` (write/edit guardrail bypass), `coral-fern` (past session access), `quiet-fern` (VS Code experiment), `plank-river-frost` (prompt suggestions), `scarf-coffee` (conditional tool injection), `cork-m4q` (policy spec injection), `tst-kx7` (tool search experiment), `plum-vx3` (WebSearch behavior), `tool-pear` (tool schema filtering), `flicker` (TUI telemetry), `quartz-lantern` (subscription), `cache-plum-violet` (cache variant), `kv7-prompt-sort` (prompt reordering), `workout` (v1, superseded). See [FEATURE-GATES.md](docs/FEATURE-GATES.md) for full details.

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
  cli.ts              — CLI entry point
  cli-finder.ts       — Locates Claude Code installations
  types.ts            — Type definitions
  index.ts            — Public API exports
  gates/
    registry.ts       — Gate registry (9 patchable, 20 detection-only)
    detector.ts       — Gate detection in JS/binary bundles
    patcher.ts        — JS bundle patching
    binary-patcher.ts — Binary patching with codesign
    index.ts          — Gate module exports
docs/
  FEATURE-GATES.md    — Patchable gates deep-dive
  TENGU-FLAGS.md      — Complete 605-flag catalog
  ENV-VARS.md         — Environment variable reference
```

## v2.1.37 Compatibility

Tested against Claude Code v2.1.37. Gate regexes may need updating when minification changes between versions. See [FEATURE-GATES.md](docs/FEATURE-GATES.md) for detailed compatibility notes.

## Documentation

- **[FEATURE-GATES.md](docs/FEATURE-GATES.md)** — Deep-dive on all patchable and detection-only gates, tier explanations, and version compatibility
- **[TENGU-FLAGS.md](docs/TENGU-FLAGS.md)** — Complete catalog of all 605 `tengu_*` flags organized by category
- **[ENV-VARS.md](docs/ENV-VARS.md)** — Reference for 114 `CLAUDE_CODE_*` environment variables, `DISABLE_*` toggles, and `ENABLE_*` toggles

## Development

```bash
npm run build     # Compile TypeScript
npm test          # Run tests (vitest)
npm run dev       # Watch mode
npm run lint      # ESLint
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, testing requirements, and how to add new gates.

## License

MIT — see [LICENSE](LICENSE)

## Disclaimer

This is an unofficial project not affiliated with or endorsed by Anthropic. It modifies the Claude Code CLI through binary patching and may break with updates. Use at your own risk. Feature gate names and behaviors may change between versions. Always create backups before patching.
