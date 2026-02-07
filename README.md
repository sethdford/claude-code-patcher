# Claude Code Patcher

**Extend Claude Code with custom native tools and unlock hidden feature gates.**

Two capabilities:

1. **Tool Patching** — inject custom tools directly into the CLI, no MCP required
2. **Feature Gates** — detect and enable Statsig feature flags (`tengu_*`) gating unreleased features

Works with both **npm installs** and the **native binary** (Node.js SEA).

## Quick Start — Feature Gates

```bash
# Clone and build
git clone https://github.com/sethdford/claude-code-patcher.git
cd claude-code-patcher
npm install && npm run build

# Scan your binary for all feature flags
node dist/cli.js gates scan

# List all known gates with status
node dist/cli.js gates

# Enable all patchable gates
node dist/cli.js gates enable --all

# Enable a single gate
node dist/cli.js gates enable session-memory

# Restart Claude Code to activate
```

No additional setup needed — gates are pure feature toggles over code already in the binary. Patching a gate makes the existing code path execute.

## Quick Start — Custom Tools

```bash
# Patch Claude Code with task tools (default)
node dist/cli.js patch

# Or patch with Gastown multi-agent tools
node dist/cli.js patch --gastown

# Or use all tools
node dist/cli.js patch --all
```

## Feature Gates

Claude Code uses [Statsig](https://statsig.com) feature flags with a `tengu_*` naming convention to gate unreleased features. The patcher can detect these flags in the binary and patch their wrapper functions to force-enable them.

### Gate Tiers

Gates are classified by complexity based on binary analysis:

| Tier | Description | Patchable? | Strategy |
|------|-------------|------------|----------|
| **Tier 1** | Simple wrappers — `function X(){return g9("flag",!1)}` | Yes | Patch to `return!0` |
| **Tier 2** | Env-guarded — env var check then Statsig check | Yes | Patch to `return!0` |
| **Tier 3** | Complex — multi-branch returns, subscription checks | Yes | Custom replacement |
| **Tier 4** | Too complex or has side effects | No | Use env var override |
| **Tier 5** | Inline checks with no wrapper function | No | Detection only |

### Patchable Gates (v2.1.34)

| Codename | Flag | Tier | Description |
|----------|------|------|-------------|
| `workout-v2` | `tengu_workout2` | 1 | Workout v2 feature iteration |
| `keybinding-customization` | `tengu_keybinding_customization_release` | 1 | Custom keyboard shortcut configuration |
| `session-memory` | `tengu_session_memory` | 1 | Persistent memory across sessions |
| `oboe` | `tengu_oboe` | 2 | Auto Memory — `~/.claude/memory/MEMORY.md` loaded into system prompt |
| `amber-flint` | `tengu_amber_flint` | 2 | Agent Teams — second gate check after `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` env var |
| `silver-lantern` | `tengu_silver_lantern` | 3 | Promo mode selector — patched to return `"promo"` |
| `copper-lantern` | `tengu_copper_lantern` | 3 | Subscription promo banner — bypasses tier/date checks |
| `team-mode` | `tengu_brass_pebble` | — | Team mode features (TodoWrite-adjacent) |

### Env Var Override Gates (Tier 4)

These are too complex or have side effects. Use environment variables instead of patching:

| Codename | Flag | Env Var | Description |
|----------|------|---------|-------------|
| `chomp-inflection` | `tengu_chomp_inflection` | `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=1` | Prompt suggestions after responses |
| `vinteuil-phrase` | `tengu_vinteuil_phrase` | `CLAUDE_CODE_SIMPLE=1` | Simplified system prompt variant |

Add these to `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION": "1",
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### Detection-Only Gates

An additional 20+ gates are detected but not patchable (inline checks or unknown purpose). Use `gates scan` to see all `tengu_*` flags in your binary.

### CLI Commands — Gates

```bash
# List all known gates with detection status
node dist/cli.js gates

# Enable a specific gate (by codename or flag name)
node dist/cli.js gates enable session-memory
node dist/cli.js gates enable tengu_oboe

# Enable all patchable gates at once
node dist/cli.js gates enable --all

# Disable a gate (restores from backup)
node dist/cli.js gates disable session-memory

# Reset all gates to original state from backup
node dist/cli.js gates reset

# Scan binary for all tengu_* flags (including unregistered ones)
node dist/cli.js gates scan
```

### How Gate Patching Works

**For native binaries** (e.g. `~/.local/bin/claude`):

1. Reads the binary as `latin1` to preserve byte offsets
2. Matches gate wrapper functions using reverse-engineered regex patterns
3. Replaces the function body with `return!0` (or custom value)
4. Pads the replacement to the **exact byte length** of the original using JS block comments
5. Creates a backup at `<binary>.backup.<timestamp>`

**For JS bundles** (npm installs):

1. Reads the JS file as `utf8`
2. Uses the same regex patterns to find gate functions
3. Replaces with an annotated version including a patch marker comment
4. Creates a backup before modifying

Byte-exact patching is critical for native binaries — the Node.js SEA format requires the embedded JS to maintain its exact byte offsets.

### Programmatic API — Gates

```typescript
import {
  detectAllGates,
  detectPatchableGates,
  scanAllFlags,
  enableGate,
  enableAllGates,
  resetGates,
} from 'claude-code-patcher/gates';

// Detect all registered gates
const gates = detectAllGates();
for (const gate of gates) {
  console.log(`${gate.codename}: detected=${gate.detected}, enabled=${gate.enabled}`);
}

// Enable a single gate
const result = enableGate('session-memory');
console.log(result.success, result.gatesChanged);

// Enable all patchable gates
const allResult = enableAllGates();
console.log(`Enabled ${allResult.gatesChanged.length} gates`);

// Scan for all tengu_* flags in binary
const flags = scanAllFlags();
console.log(`Found ${flags.length} flags`);

// Reset to backup
resetGates();
```

### Architecture

```
src/gates/
  registry.ts        # Gate definitions, regex patterns, patch functions
  registry.test.ts   # 46 tests covering all tiers
  detector.ts        # Binary/JS bundle reading and gate detection
  patcher.ts         # JS bundle patching (utf8)
  binary-patcher.ts  # Native binary patching (latin1, byte-exact)
  index.ts           # Barrel exports

src/cli-finder.ts    # Locates Claude Code (native binary + npm)
src/cli.ts           # CLI entry point
```

### Adding a New Gate

1. Find the gate function in the binary: `strings ~/.local/bin/claude | grep tengu_your_gate`
2. Extract the full function signature (walk backward to `function`, forward to closing `}`)
3. Write a `detectRegex` that matches the function — use `[\w$]+` for minified names
4. Add to `PATCHABLE_GATES` in `registry.ts` (use `returnTruePatcher()` helper for simple gates)
5. Add tests in `registry.test.ts`
6. Build and verify: `npm run build && node dist/cli.js gates`

---

## Custom Tools

### Why Native Tools?

| Feature | MCP Tools | Native Tools (this project) |
|---------|-----------|---------------------------|
| Startup | Requires server | Instant |
| Integration | External process | Built into CLI |
| Permissions | Separate handling | Uses Claude's system |
| UI | Basic | Full Claude Code UI |
| Reliability | Server must be running | Always available |

### Built-in Tool Sets

**Task Tools** (default) — simple task management:

| Tool | Description |
|------|-------------|
| **TaskCreate** | Create tasks with subject, description, and dependencies |
| **TaskGet** | Retrieve full task details by ID |
| **TaskUpdate** | Update status (open/in_progress/blocked/resolved), add comments |
| **TaskList** | List all tasks with optional status filter |

**Gastown Tools** — multi-agent orchestration ([Gastown](https://github.com/steveyegge/gastown)):

| Category | Tools | Description |
|----------|-------|-------------|
| **Beads** | BeadCreate, BeadGet, BeadUpdate, BeadList | Issue/work item tracking |
| **Convoys** | ConvoyCreate, ConvoyAdd, ConvoyShow, ConvoyList | Bundle beads into work units |
| **Agents** | AgentSling, AgentList | Assign work across agents |
| **Hooks** | HookWrite, HookRead | Persistent state across restarts |
| **Mail** | MailSend, MailCheck, MailReply | Inter-agent messaging |
| **Identity** | WhoAmI | Agent identity and context |

### Creating Custom Tools

```javascript
// my-tools.js
export default [
  {
    name: 'Weather',
    description: 'Get the current weather for a location',
    icon: '🌤️',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name or coordinates' }
      },
      required: ['location']
    },
    async execute(input) {
      const response = await fetch(`https://api.weather.com/${input.location}`);
      return await response.json();
    }
  }
];
```

```bash
node dist/cli.js patch --config ./my-tools.js
```

### Tool Definition Reference

```typescript
interface CustomToolDefinition {
  name: string;              // Unique tool name
  description: string;       // Shown to the AI
  inputSchema: JsonSchema;   // Input validation
  execute: (input, context) => Promise<any>;  // Implementation

  // Optional
  prompt?: string;           // Additional AI guidance
  outputSchema?: JsonSchema; // Output validation
  displayName?: string;      // User-facing name
  icon?: string;             // Emoji for UI
  readOnly?: boolean;        // No side effects (default: false)
  concurrencySafe?: boolean; // Can run in parallel (default: false)
}
```

### CLI Commands — Tools

```bash
node dist/cli.js patch                    # Patch with task tools
node dist/cli.js patch --gastown          # Patch with Gastown tools
node dist/cli.js patch --all              # Patch with all tools
node dist/cli.js patch --config ./tools.js # Patch with custom tools
node dist/cli.js unpatch                  # Remove tool patch
node dist/cli.js status                   # Check patch status
node dist/cli.js list                     # List available tools
node dist/cli.js find                     # Find Claude Code installations
```

### Cross-Instance Collaboration

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude Code 1  │     │  Claude Code 2  │     │  Claude Code 3  │
│    (Mayor)      │     │   (Worker A)    │     │   (Worker B)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    ┌─────────────────────────────────────────────────────────┐
    │              ~/.gastown/store.json                       │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
    │  │  Beads  │  │ Convoys │  │  Hooks  │  │  Mail   │    │
    │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
    └─────────────────────────────────────────────────────────┘
```

---

## CLI Installation Detection

The patcher automatically finds your Claude Code installation. Detection order:

1. **Native binary** — `which claude` resolved path (highest priority)
2. **~/.local/bin/claude** — standard installer location
3. **~/.local/share/claude/versions/** — versioned binaries (newest first)
4. **npm installs** — global, local, and npx cache

Use `--cli <path>` to override auto-detection:

```bash
node dist/cli.js gates --cli /path/to/claude
node dist/cli.js patch --cli /path/to/cli.js
```

## Environment Variables

```bash
# Gastown
export GT_AGENT_ID=mayor                    # Custom agent ID
export GT_HOME=/path/to/gastown             # Custom Gastown home
export CLAUDE_TASKS_FILE=/path/to/tasks.json # Custom tasks file

# Claude Code feature env vars (add to ~/.claude/settings.json)
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1      # Enable agent teams
CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=1      # Enable prompt suggestions
CLAUDE_CODE_DISABLE_AUTO_MEMORY=1           # Disable auto memory (oboe)
CLAUDE_CODE_SIMPLE=1                        # Simplified system prompt
```

## Development

```bash
# Build
npm run build

# Run tests (248 tests across 10 files)
npx vitest run

# Run a specific test file
npx vitest run src/gates/registry.test.ts

# Type check
npx tsc --noEmit
```

### Test Coverage

| Test File | Tests | Covers |
|-----------|-------|--------|
| `registry.test.ts` | 46 | Gate definitions, regex matching, patch/unpatch for all tiers |
| `binary-patcher.test.ts` | 27 | Byte-exact padding, binary gate patching |
| `patcher.test.ts` | 19 | JS bundle patching, enable/disable flows |
| `detector.test.ts` | 16 | Bundle resolution, gate detection |
| `cli-gates.test.ts` | 16 | CLI integration, scan output |
| *(x2 — src + dist)* | — | Tests run against both TypeScript source and compiled output |

## Version Compatibility

| Claude Code Version | Install Type | Gates | Tools |
|---------------------|-------------|-------|-------|
| 2.1.34 | Native binary | Validated (8 patchable, 22 detection-only) | Untested |
| 2.1.x | npm | Detection works | Tested |
| 2.0.x | npm | Detection works | Tested |

Gate regex patterns use `[\w$]+` for minified identifiers, making them resilient across minor version changes. Major version updates may change function structures.

## Troubleshooting

### Gates show "n/a" for everything

The patcher may be finding a stale npm install instead of the active native binary. Check with:

```bash
node dist/cli.js find
```

If it shows an npm path but you use the native binary, specify it explicitly:

```bash
node dist/cli.js gates --cli ~/.local/bin/claude
```

### "Could not find tools array pattern"

The Claude Code version has a different internal structure. Open an issue with your version.

### Gates enabled but feature not working

1. **Restart Claude Code** — the patched binary must be re-executed
2. Some features may need companion gates (e.g., `session-memory` may need `tengu_sm_compact`)
3. Check if the feature has an env var override that's set to disable it

### Restoring original binary

```bash
# From backup (preferred)
node dist/cli.js gates reset

# Or reinstall Claude Code
claude update
# or: npm install -g @anthropic-ai/claude-code
```

## Contributing

Areas of interest:

- New gate discoveries (run `gates scan` on new versions)
- Regex pattern updates when function signatures change
- Promoting detection-only gates to patchable
- Better error handling and recovery

## License

MIT

## Disclaimer

This is an unofficial project and is not affiliated with Anthropic. Use at your own risk. The patcher modifies the Claude Code CLI binary and may break with updates. Always keep backups.
