# Claude Code Patcher

**Extend Claude Code with custom native tools and feature gate analysis — no MCP required.**

Inject custom tools directly into the Claude Code CLI as first-class native tools alongside built-in ones like `Read`, `Write`, `Bash`, and `TodoWrite`. Detect and analyze Statsig feature gates (`tengu_*` flags) embedded in the binary.

## Quick Start

```bash
# Install
npm install -g claude-code-patcher

# Patch Claude Code with task tools (default)
claude-patcher patch

# Check status
claude-patcher status

# List detected feature gates
claude-patcher gates

# Scan binary for all tengu_* flags
claude-patcher gates scan

# Remove patch
claude-patcher unpatch
```

## Features

### Tool Injection

Inject custom tools into the Claude Code CLI that run as native tools — no MCP server required.

| Feature | MCP Tools | Native Tools (this project) |
|---------|-----------|---------------------------|
| Startup | Requires server | Instant |
| Integration | External process | Built into CLI |
| Permissions | Separate handling | Uses Claude's system |
| UI | Basic | Full Claude Code UI |
| Reliability | Server must be running | Always available |

### Feature Gate Analysis

Detect, scan, and analyze the Statsig feature gates embedded in Claude Code's JS bundle or native binary. The gate system supports both npm-installed JS bundles and compiled native binaries (Node.js SEA).

## CLI Reference

### Patching Commands

```bash
claude-patcher patch                    # Patch with task tools (default)
claude-patcher patch --gastown          # Patch with Gastown multi-agent tools
claude-patcher patch --all              # Patch with all built-in tools
claude-patcher patch --config tools.js  # Patch with custom tools
claude-patcher unpatch                  # Remove patch (restores from backup)
claude-patcher status                   # Check current patch status
claude-patcher list                     # List available built-in tools
claude-patcher find                     # Find all Claude Code installations
```

### Feature Gate Commands

```bash
claude-patcher gates                    # List all detected feature gates
claude-patcher gates scan               # Scan binary for all tengu_* flags
claude-patcher gates enable <name>      # Enable a patchable gate
claude-patcher gates enable --all       # Enable all patchable gates
claude-patcher gates disable <name>     # Disable a gate (restore from backup)
claude-patcher gates reset              # Restore all gates from backup
```

### Execution Commands

```bash
claude-patcher exec "your prompt"                # Run via Claude headless mode
claude-patcher exec --json --model opus "prompt"  # JSON output with model selection
claude-patcher exec --output result.txt "prompt"  # Write output to file
```

### Global Options

```bash
--cli <path>       # Specify Claude Code CLI path (auto-detected by default)
--no-backup        # Skip creating backup before patching
--help, -h         # Show help
--version, -v      # Show version
```

## Built-in Tools

### Task Tools (`--tasks`, default)

Simple task management stored in `~/.claude/tasks.json`:

| Tool | Description |
|------|-------------|
| **TaskCreate** | Create tasks with subject, description, and dependencies |
| **TaskGet** | Retrieve full task details by ID |
| **TaskUpdate** | Update status (open/in_progress/blocked/resolved), add comments |
| **TaskList** | List all tasks with optional status filter |

### Gastown Tools (`--gastown`)

Multi-agent orchestration via shared state in `~/.gastown/store.json`:

**Beads (Issue Tracking):**

| Tool | Description |
|------|-------------|
| **BeadCreate** | Create work items with title, description, tags, blockers |
| **BeadGet** | Retrieve bead details including comments and history |
| **BeadUpdate** | Update status, add comments, change assignee |
| **BeadList** | Filter beads by status, assignee, rig, or convoy |

**Convoys (Work Bundles):**

| Tool | Description |
|------|-------------|
| **ConvoyCreate** | Bundle beads into coordinated work units |
| **ConvoyAdd** | Add beads to existing convoys |
| **ConvoyShow** | View convoy progress and bead statuses |
| **ConvoyList** | List all convoys with status |

**Agent Coordination:**

| Tool | Description |
|------|-------------|
| **AgentSling** | Assign beads to agents |
| **AgentList** | See all agents and their assignments |

**Hooks (Persistent State):**

| Tool | Description |
|------|-------------|
| **HookWrite** | Save state that survives restarts |
| **HookRead** | Recover saved state |

**Mail (Inter-Agent Messaging):**

| Tool | Description |
|------|-------------|
| **MailSend** | Send messages to other agents |
| **MailCheck** | Check mailbox for messages |
| **MailReply** | Reply to received messages |

**Identity:**

| Tool | Description |
|------|-------------|
| **WhoAmI** | Get your agent ID, assignments, and context |

### Multi-Agent Workflow

```bash
# Terminal 1 (Agent A)
export GT_AGENT_ID=mayor
claude
> Create a bead to implement the API endpoints
> Create a convoy called "API Sprint" with that bead
> Sling the bead to worker-1

# Terminal 2 (Agent B)
export GT_AGENT_ID=worker-1
claude
> Who am I?
> Check my mail
> Update bead gt-00001 status to in_progress
> Send mail to mayor: "Starting work on API endpoints"
```

```
+-----------------+     +-----------------+     +-----------------+
|  Claude Code 1  |     |  Claude Code 2  |     |  Claude Code 3  |
|    (Mayor)      |     |   (Worker A)    |     |   (Worker B)    |
+--------+--------+     +--------+--------+     +--------+--------+
         |                       |                       |
         +----------+------------+-----------+-----------+
                    |                        |
                    v                        v
    +-----------------------------------------------------+
    |              ~/.gastown/store.json                    |
    |  +---------+  +---------+  +---------+  +---------+  |
    |  |  Beads  |  | Convoys |  |  Hooks  |  |  Mail   |  |
    |  +---------+  +---------+  +---------+  +---------+  |
    +-----------------------------------------------------+
```

## Feature Gate System

Claude Code uses [Statsig](https://statsig.com/) feature gates identified by `tengu_*` flags. The patcher can detect and analyze these gates in both JS bundles and native binaries.

### Flag Taxonomy

Of the **572 total `tengu_*` flags** found in the binary, they break down into two categories:

**Telemetry Event Flags (~555):** Event names passed to Statsig's `logEvent()` for analytics. These are self-descriptive and don't control features. They reveal Claude Code's internal subsystem architecture:

| Category | Count | Examples |
|----------|-------|---------|
| OAuth & Authentication | ~37 | `tengu_oauth_flow_start`, `tengu_oauth_token_refresh_*` |
| MCP (Model Context Protocol) | ~27 | `tengu_mcp_server_connection_*`, `tengu_mcp_tool_call_*` |
| Native Binary & Updates | ~20 | `tengu_native_auto_updater_*`, `tengu_binary_download_*` |
| File Operations & History | ~19 | `tengu_file_history_*`, `tengu_file_write_optimization` |
| Context Compaction | ~18 | `tengu_compact_*`, `tengu_sm_compact_*` |
| Plugins & Marketplace | ~18 | `tengu_plugin_*`, `tengu_marketplace_*` |
| Tool Usage & Permissions | ~16 | `tengu_tool_use_*`, `tengu_tool_search_*` |
| Session Teleportation | ~16 | `tengu_teleport_*` |
| Hooks Lifecycle | ~13 | `tengu_hook_*`, `tengu_pre_tool_hook_*` |
| API & Networking | ~13 | `tengu_api_*`, `tengu_streaming_*` |
| IDE/Extension Events | ~10 | `tengu_ext_*`, `tengu_vscode_*`, `tengu_claude_in_chrome_*` |

**Feature Gate Flags (~16):** Opaque, randomly-named Statsig gates passed to `checkGate()` that control actual feature availability:

| Flag | Codename | Status | Description |
|------|----------|--------|-------------|
| `tengu_brass_pebble` | swarm-mode | Patchable | Swarm/TeammateTool/delegate — multi-agent coordination |
| `tengu_brass_pebble` | team-mode | Patchable | Team mode — TodoWrite-adjacent task/team features |
| `tengu_marble_anvil` | marble-anvil | Detection only | Unknown feature gate |
| `tengu_marble_kite` | marble-kite | Detection only | Unknown feature gate |
| `tengu_coral_fern` | coral-fern | Detection only | Unknown feature gate |
| `tengu_quiet_fern` | quiet-fern | Detection only | Unknown feature gate |
| `tengu_plank_river_frost` | plank-river-frost | Detection only | Unknown feature gate |
| `tengu_quartz_lantern` | quartz-lantern | Detection only | Unknown feature gate |
| `tengu_scarf_coffee` | scarf-coffee | Detection only | Unknown feature gate |
| `tengu_cache_plum_violet` | cache-plum-violet | Detection only | Cache-related feature gate |
| `tengu_flicker` | flicker | Detection only | Unknown feature gate |
| `tengu_tool_pear` | tool-pear | Detection only | Tool-related feature gate |
| `tengu_cork_m4q` | cork-m4q | Detection only | Unknown feature gate |
| `tengu_tst_kx7` | tst-kx7 | Detection only | Test/experiment gate |
| `tengu_plum_vx3` | plum-vx3 | Detection only | Unknown feature gate |
| `tengu_kv7_prompt_sort` | kv7-prompt-sort | Detection only | Prompt sorting feature |
| `tengu_workout` | workout | Detection only | Unknown feature gate |

### Environment Variable Overrides

Some gates check environment variables before the Statsig gate:

| Variable | Gate | Effect |
|----------|------|--------|
| `CLAUDE_CODE_AGENT_SWARMS` | swarm-mode | Checked first; controls multi-agent features |
| `CLAUDE_CODE_TEAM_MODE` | team-mode | Experimental; behavior varies by version |

### How Gate Detection Works

1. The patcher locates the Claude Code bundle (JS file or native binary)
2. JS bundles are read as UTF-8; native binaries as latin1 (preserves byte offsets)
3. Each registered gate has a `detectRegex` matched against the bundle content
4. Patcher markers (`CLAUDE-CODE-PATCHER FEATURE GATES:codename`) identify already-patched gates
5. Binary patching uses byte-length-preserving replacements with comment padding

See [docs/FEATURE-GATES.md](docs/FEATURE-GATES.md) for the patchable gates reference and [docs/TENGU-FLAGS.md](docs/TENGU-FLAGS.md) for the complete 572-flag catalog.

## Creating Custom Tools

### 1. Create a tools config file

```javascript
// my-tools.js
export default [
  {
    name: 'Weather',
    description: 'Get the current weather for a location',
    icon: '🌤',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name or coordinates'
        }
      },
      required: ['location']
    },
    outputSchema: {
      type: 'object',
      properties: {
        temperature: { type: 'number' },
        conditions: { type: 'string' }
      }
    },
    async execute(input) {
      const response = await fetch(`https://api.weather.com/${input.location}`);
      return await response.json();
    }
  }
];
```

### 2. Apply your tools

```bash
claude-patcher patch --config ./my-tools.js
```

### 3. Use in Claude

```
> What's the weather in San Francisco?
```

## Programmatic API

```typescript
import { patch, unpatch, getPatchStatus, taskTools } from 'claude-code-patcher';
import type { CustomToolDefinition } from 'claude-code-patcher';

// Check status
const status = getPatchStatus();
console.log('Patched:', status.isPatched);
console.log('Tools:', status.tools);

// Patch with built-in tools
patch({ tools: taskTools });

// Remove patch
unpatch();
```

### Tool Definition Interface

```typescript
interface CustomToolDefinition {
  name: string;              // Unique tool name
  description: string;       // Shown to the AI
  inputSchema: JsonSchema;   // Input validation (JSON Schema)
  execute: (input, context?) => Promise<any>;  // Implementation

  // Optional
  prompt?: string;           // Additional AI guidance
  outputSchema?: JsonSchema; // Output validation
  displayName?: string;      // User-facing name
  icon?: string;             // Emoji for UI
  readOnly?: boolean;        // No side effects (default: false)
  concurrencySafe?: boolean; // Can run in parallel (default: false)
}
```

### Gate API

```typescript
import {
  detectAllGates,
  detectPatchableGates,
  scanAllFlags,
  enableGate,
  disableGate,
  enableAllGates,
  resetGates,
} from 'claude-code-patcher/gates';

// Detect all registered gates
const gates = detectAllGates();

// Scan for all tengu_* flags in the binary
const allFlags = scanAllFlags();

// Enable/disable a gate
enableGate('swarm-mode');
disableGate('swarm-mode');

// Reset all gates from backup
resetGates();
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GT_AGENT_ID` | Auto-generated | Custom Gastown agent ID |
| `CLAUDE_AGENT_ID` | Auto-generated | Alternative agent ID override |
| `GT_HOME` | `~/.gastown` | Custom Gastown home directory |
| `CLAUDE_TASKS_FILE` | `~/.claude/tasks.json` | Custom tasks storage path |

## Architecture

```
src/
  cli.ts              # CLI interface (9 commands)
  cli-finder.ts       # Locates Claude Code installations
  patcher.ts          # Tool injection core
  tool-builder.ts     # JSON Schema -> Zod code generation
  types.ts            # All type definitions
  index.ts            # Public API exports
  gates/
    registry.ts       # Gate registry (17 gates: 2 patchable, 15 detection-only)
    detector.ts       # Gate detection in JS/binary bundles
    patcher.ts        # Gate enable/disable for JS bundles
    binary-patcher.ts # Gate patching for native binaries (byte-length preserving)
    index.ts          # Gate API exports
  tools/
    task-tools.ts     # Task management tools (4 tools)
    gastown-tools.ts  # Gastown multi-agent tools (16 tools)
    index.ts          # Tool exports
docs/
  FEATURE-GATES.md    # Patchable gates reference
  TENGU-FLAGS.md      # Complete 572-flag catalog
```

**Key design decisions:**
- Zero runtime dependencies
- JS bundles read as UTF-8; native binaries as latin1 for byte-offset consistency
- Binary patches padded with JS block comments to preserve exact byte length
- Backup-first strategy: timestamped copies before any modification
- Marker-based identification for patched code

## Version Compatibility

| Claude Code Version | Status |
|---------------------|--------|
| 2.1.x | Tested |
| 2.0.x | Tested |
| 1.x | May work |

The patcher auto-detects structural changes and warns if incompatible.

## Troubleshooting

### "Could not find tools array pattern"

The Claude Code version has a different internal structure. Check your version and open an issue.

### "Gate pattern not found in this version"

The gate's regex doesn't match the current Claude Code build. Gates may change between versions.

### Tools not appearing in Claude

1. Restart Claude Code after patching
2. Check status: `claude-patcher status`
3. Verify the CLI path: `claude-patcher find`

### Restoring original CLI

```bash
# Use unpatch (restores from backup)
claude-patcher unpatch

# Or reinstall Claude Code
npm install -g @anthropic-ai/claude-code
```

## Development

```bash
# Build
npm run build

# Run tests
npm test

# Watch mode
npm run dev

# Lint
npm run lint
```

## Contributing

Contributions welcome. Areas of interest:

- Additional built-in tool templates
- Support for more Claude Code versions
- Documentation of unknown feature gates
- Test coverage improvements

## License

MIT

## Disclaimer

This is an unofficial project and is not affiliated with or endorsed by Anthropic. It modifies the Claude Code CLI through binary patching and may break with updates. Use at your own risk. Feature gate names and behaviors may change between Claude Code versions. Always create backups before patching.
