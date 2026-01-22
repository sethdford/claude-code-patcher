# Claude Code Patcher

**Extend Claude Code with custom native tools — no MCP required.**

This project allows you to inject custom tools directly into the Claude Code CLI, making them available as first-class native tools alongside the built-in ones like `Read`, `Write`, `Bash`, and `TodoWrite`.

## Why Native Tools?

| Feature | MCP Tools | Native Tools (this project) |
|---------|-----------|---------------------------|
| Startup | Requires server | Instant |
| Integration | External process | Built into CLI |
| Permissions | Separate handling | Uses Claude's system |
| UI | Basic | Full Claude Code UI |
| Reliability | Server must be running | Always available |

## Quick Start

```bash
# Install
npm install -g claude-code-patcher

# Patch Claude Code with task tools (default)
claude-patcher patch

# Or patch with Gastown multi-agent tools
claude-patcher patch --gastown

# Or use all tools
claude-patcher patch --all

# Try it!
claude
> Who am I?
> Create a bead to implement user authentication
> List all beads
> Check my mail
```

### Multi-Agent Workflow

With Gastown tools, multiple Claude Code instances can coordinate:

```bash
# Terminal 1 (Agent A)
claude
> Create a bead to implement the API endpoints
> Create a convoy called "API Sprint" with that bead
> Sling the bead to agent-b

# Terminal 2 (Agent B) 
claude
> Who am I?
> Check my mail
> Update bead gt-00001 status to in_progress
> Send mail to agent-a: "Starting work on API endpoints"
```

## Built-in Tools

### Task Tools (Default)

Simple task management, similar to TodoWrite:

| Tool | Description |
|------|-------------|
| **TaskCreate** | Create tasks with subject, description, and dependencies |
| **TaskGet** | Retrieve full task details by ID |
| **TaskUpdate** | Update status (open/in_progress/blocked/resolved), add comments |
| **TaskList** | List all tasks with optional status filter |

Tasks are stored in `~/.claude/tasks.json`.

### Gastown Tools (Multi-Agent)

Full [Gastown](https://github.com/steveyegge/gastown) integration for multi-agent orchestration:

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
| **AgentSling** | Assign beads to agents (like `gt sling`) |
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

Gastown state is stored in `~/.gastown/store.json` (shared across all Claude instances).

## CLI Commands

```bash
# Patch with built-in tools
claude-patcher patch

# Patch with custom tools
claude-patcher patch --config ./my-tools.js

# Check status
claude-patcher status

# List available built-in tools
claude-patcher list

# Find all Claude Code installations
claude-patcher find

# Remove patch
claude-patcher unpatch
```

## Creating Custom Tools

### 1. Create a tools config file

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
      // Your implementation
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

// Create custom tools
const myTool: CustomToolDefinition = {
  name: 'Calculator',
  description: 'Perform mathematical calculations',
  inputSchema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Math expression to evaluate'
      }
    },
    required: ['expression']
  },
  async execute(input) {
    // Note: Use a safe evaluator in production!
    const result = eval(input.expression);
    return { result };
  }
};

patch({ tools: [myTool] });

// Remove patch
unpatch();
```

## Tool Definition Reference

```typescript
interface CustomToolDefinition {
  // Required
  name: string;              // Unique tool name
  description: string;       // Shown to the AI
  inputSchema: JsonSchema;   // Input validation
  execute: (input, context) => Promise<any>;  // Implementation

  // Optional
  prompt?: string;           // Additional guidance for AI
  outputSchema?: JsonSchema; // Output validation
  displayName?: string;      // User-facing name
  icon?: string;             // Emoji for UI
  readOnly?: boolean;        // No side effects (default: false)
  concurrencySafe?: boolean; // Can run in parallel (default: false)
}
```

## JSON Schema Format

```typescript
interface JsonSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    description?: string;
    enum?: string[];         // For string enums
    items?: JsonSchemaProperty;  // For arrays
    optional?: boolean;      // Defaults to required
  }>;
  required?: string[];       // Required property names
}
```

## Cross-Instance Collaboration

The Gastown tools enable multiple Claude Code instances to work together:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Claude Code 1  │     │  Claude Code 2  │     │  Claude Code 3  │
│    (Mayor)      │     │   (Worker A)    │     │   (Worker B)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │    ┌──────────────────┴───────────────────────┤
         │    │                                          │
         ▼    ▼                                          ▼
    ┌─────────────────────────────────────────────────────────┐
    │              ~/.gastown/store.json                       │
    │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
    │  │  Beads  │  │ Convoys │  │  Hooks  │  │  Mail   │    │
    │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │
    └─────────────────────────────────────────────────────────┘
```

**Key Features:**

1. **Shared State**: All Claude instances read/write to the same store
2. **Mailbox System**: Agents can send messages to each other
3. **Work Assignment**: Sling beads to specific agents
4. **Persistent Hooks**: State survives agent restarts
5. **Identity Awareness**: Each agent knows who they are (`WhoAmI`)

**Environment Variables:**

```bash
# Set custom agent ID (otherwise auto-generated)
export GT_AGENT_ID=mayor

# Set custom Gastown home (otherwise ~/.gastown)
export GT_HOME=/path/to/gastown

# Set custom tasks file for task tools
export CLAUDE_TASKS_FILE=/path/to/tasks.json
```

## How It Works

The patcher performs targeted modifications to the Claude Code CLI:

1. **Locates** the Claude Code CLI installation
2. **Analyzes** the minified JavaScript to find the tools array
3. **Injects** custom tool definitions using the same structure as built-in tools
4. **Modifies** the tools collection to include custom tools

The patch is based on reverse engineering of Claude Code's internal tool system, specifically:
- The `aU` function that builds the tools array
- The tool interface used by `TodoWrite` and other built-in tools
- The Zod schema validation system

## Version Compatibility

| Claude Code Version | Status |
|---------------------|--------|
| 2.1.x | ✅ Tested |
| 2.0.x | ✅ Tested |
| 1.x | ⚠️ May work |

The patcher automatically detects structural changes and will warn if incompatible.

## Troubleshooting

### "Could not find tools array pattern"

This means the Claude Code version has a different internal structure. Please open an issue with your Claude Code version.

### Tools not appearing in Claude

1. Restart Claude Code after patching
2. Check status: `claude-patcher status`
3. Verify the CLI path: `claude-patcher find`

### Restoring original CLI

```bash
# Use unpatch
claude-patcher unpatch

# Or reinstall Claude Code
npm install -g @anthropic-ai/claude-code
```

## Contributing

Contributions welcome! Areas of interest:

- Additional built-in tool templates
- Support for more Claude Code versions
- Better error handling and recovery
- Documentation improvements

## License

MIT

## Disclaimer

This is an unofficial project and is not affiliated with Anthropic. Use at your own risk. The patch modifies the Claude Code CLI and may break with updates.
