# Feature Gates Reference

> Patchable feature gates in Claude Code v2.1.63 and how to control them with `claude-patcher gates`.

## Overview

Claude Code uses [Statsig](https://statsig.com/) feature gates to control the rollout of
new functionality. Gates are identified by `tengu_*` flags embedded in the minified JS
bundle or native binary. Of 660+ flags, most are telemetry event names — only ~40
codename-style gates control feature availability.

## Patchable Gates (9)

### Tier 1 — Simple Wrappers

| Codename                   | Flag                                     | What It Controls                                                               |
| -------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------ |
| `keybinding-customization` | `tengu_keybinding_customization_release` | Custom keyboard shortcut configuration via `~/.claude/keybindings.json`        |
| `amber-quartz`             | `tengu_amber_quartz`                     | Voice dictation — hold Space to record audio input                             |
| `ccr-bridge`               | `tengu_ccr_bridge`                       | Remote Control bridge — control Claude Code from another machine via WebSocket |
| `mcp-elicitation`          | `tengu_mcp_elicitation`                  | MCP elicitation — allows MCP servers to ask the user clarifying questions      |
| `immediate-model-command`  | `tengu_immediate_model_command`          | Instant /model switching without requiring reconnection                        |
| `pr-status-cli`            | `tengu_pr_status_cli`                    | PR status display in CLI terminal interface                                    |

### Tier 2 — Env-Guarded

| Codename         | Flag                   | Env Override                                                      | What It Controls                                                                                         |
| ---------------- | ---------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `session-memory` | `tengu_session_memory` | `ENABLE_CLAUDE_CODE_SM_COMPACT`, `DISABLE_CLAUDE_CODE_SM_COMPACT` | Session-specific context that persists when resumed; checks both `session_memory` and `sm_compact` gates |
| `amber-flint`    | `tengu_amber_flint`    | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`                            | Agent Teams — checks env var OR `--agent-teams` argv, then validates gate                                |
| `copper-bridge`  | `tengu_copper_bridge`  |                                                                   | WebSocket bridge URL for remote sessions                                                                 |

## Detection-Only Gates (31)

### With Env Override (3)

| Codename                     | Flag                               | Env Override                           | What It Controls                                                   |
| ---------------------------- | ---------------------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| `chomp-inflection`           | `tengu_chomp_inflection`           | `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | Prompt suggestions — suggests next prompts after model responses   |
| `vinteuil-phrase`            | `tengu_vinteuil_phrase`            | `CLAUDE_CODE_SIMPLE`                   | Simplified system prompt — lighter prompt for reduced latency/cost |
| `system-prompt-global-cache` | `tengu_system_prompt_global_cache` | `CLAUDE_CODE_FORCE_GLOBAL_CACHE`       | Global prompt cache — share prompt cache across sessions           |

### Inline Checks — Tier 5 (4)

| Codename                 | Flag                              | What It Controls                                                        |
| ------------------------ | --------------------------------- | ----------------------------------------------------------------------- |
| `speculation`            | `tengu_speculation`               | Speculative execution — pre-run likely tool calls while user types      |
| `structured-output`      | `tengu_structured_output_enabled` | Structured output — typed/structured model responses                    |
| `streaming-tool-exec-v2` | `tengu_streaming_tool_execution2` | Streaming tool execution v2 — execute tools while model still streaming |
| `thinkback`              | `tengu_thinkback`                 | Year-in-review animation — /think-back skill                            |

### Reverse-Engineered Gates (20)

| Codename                | Flag                          | What It Controls                                                                                                       |
| ----------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `marble-anvil`          | `tengu_marble_anvil`          | Clear thinking beta (`clear_thinking_20251015`) — adds thinking edits when thinking mode is enabled                    |
| `coral-fern`            | `tengu_coral_fern`            | Past session access — injects system prompt instructions for accessing historical session data                         |
| `quiet-fern`            | `tengu_quiet_fern`            | VS Code extension experiment — sent alongside `penguins_enabled` to IDE extensions                                     |
| `quartz-lantern`        | `tengu_quartz_lantern`        | Lantern family gate — related to copper/silver lantern subscription features                                           |
| `scarf-coffee`          | `tengu_scarf_coffee`          | Conditional tool injection — adds a tool to the tool list when gate is enabled alongside another condition             |
| `cache-plum-violet`     | `tengu_cache_plum_violet`     | Prompt cache variant — controls an alternate caching strategy                                                          |
| `flicker`               | `tengu_flicker`               | Terminal UI flicker telemetry — tracks resize flickers, NOT a feature gate (telemetry event only)                      |
| `tool-pear`             | `tengu_tool_pear`             | Tool schema filtering experiment — controls how tool `inputJSONSchema` is presented to the model via `l1()`            |
| `cork-m4q`              | `tengu_cork_m4q`              | Policy spec injection — controls `<policy_spec>` XML injection into system prompt (guardrails/safety system)           |
| `tst-kx7`               | `tengu_tst_kx7`               | Tool search experiment — enables tool search when below threshold with deferred tools present (9 occurrences)          |
| `plum-vx3`              | `tengu_plum_vx3`              | WebSearch behavior — disables thinking (`maxThinkingTokens: 0`), forces `web_search` tool choice, uses alternate model |
| `kv7-prompt-sort`       | `tengu_kv7_prompt_sort`       | Prompt section reordering — reorders system prompt sections for cache efficiency                                       |
| `crystal-beam`          | `tengu_crystal_beam`          | Opus 4.6 thinking budget tokens — data gate returning object with token budget info                                    |
| `swann-brevity`         | `tengu_swann_brevity`         | Output brevity mode — data gate returning "strict" or null for output style control                                    |
| `bergotte-lantern`      | `tengu_bergotte_lantern`      | Concise/polished output style in system prompt — Tier 5 inline check                                                   |
| `marble-sandcastle`     | `tengu_marble_sandcastle`     | Fast mode requires native binary check — Tier 5 inline validation                                                      |
| `moth-copse`            | `tengu_moth_copse`            | Relevant memory injection into context — memory system gate                                                            |
| `mulberry-fog`          | `tengu_mulberry_fog`          | Auto memory prompt template variant — controls alternative memory formatting                                           |
| `slate-nexus`           | `tengu_slate_nexus`           | Claude-code-guide skill/plugin enablement — gates access to guide skill                                                |
| `slate-ridge`           | `tengu_slate_ridge`           | VS Code experiment gate — sent to IDE extensions for A/B testing                                                       |
| `coral-whistle`         | `tengu_coral_whistle`         | Tool usage frequency tracking — telemetry for tool invocation patterns                                                 |
| `pebble-leaf-prune`     | `tengu_pebble_leaf_prune`     | Session history leaf node pruning — controls aggressive history cleanup                                                |
| `amber-prism`           | `tengu_amber_prism`           | System prompt content injection for agents — agent-specific prompt customization                                       |
| `penguins-off`          | `tengu_penguins_off`          | Fast mode kill switch — server-side gate returning disable message when fast mode should be turned off                 |
| `tst-names-in-messages` | `tengu_tst_names_in_messages` | Tool search names injection — injects tool names into messages for improved tool selection                             |

## Deep Analysis — What Each Feature Actually Does

### keybinding-customization (Tier 1)

Enables custom keyboard shortcuts via `~/.claude/keybindings.json`. Users can rebind keys,
add chord bindings (multi-key sequences), and customize the submit key. The keybindings-help
skill provides an interactive configuration interface.

### amber-quartz (Tier 1)

Voice dictation feature — hold Space to record audio input, which is transcribed and inserted
into the prompt. Enables hands-free interaction when typing is inconvenient or unavailable.

### ccr-bridge (Tier 1)

Remote Control bridge for Claude Code. Enables controlling a Claude Code instance from another
machine via WebSocket connection. This is the main enable/disable gate for the Remote Control
feature. Note: both `ccr-bridge` and `copper-bridge` must be enabled for remote sessions —
`ccr-bridge` enables the feature, `copper-bridge` provides the WebSocket URL.

### mcp-elicitation (Tier 1)

MCP elicitation support. Allows MCP servers to ask the user clarifying questions during tool
execution, enabling richer interactive workflows between MCP tools and users.

### immediate-model-command (Tier 1)

Instant model switching via the `/model` command. When enabled, switching models does not
require a full reconnection — the change takes effect immediately within the current session.

### pr-status-cli (Tier 1)

Pull request status display in the CLI terminal interface. Shows PR information (status,
checks, review state) directly in the Claude Code terminal without needing to visit GitHub.

### session-memory (Tier 2)

Tracks session-specific context that persists when a session is resumed. Checks both the
`ENABLE_CLAUDE_CODE_SM_COMPACT` and `DISABLE_CLAUDE_CODE_SM_COMPACT` environment variables
to determine compaction behavior. When enabled, includes session quality classification,
memory extraction during compaction, and file-level session memory reads. The `tengu_sm_compact_*`
flags handle compacting session memory when it grows too large.

### amber-flint — Agent Teams (Tier 2)

Multi-agent coordination gate. Checks the `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` environment
variable first, then validates the `--agent-teams` command-line argument, and finally checks
the Statsig gate. All three conditions must align for agent teams to be fully enabled. The
teams system enables structured multi-agent workflows with leader/worker patterns, task
delegation, and coordinated file editing.

### copper-bridge (Tier 2)

WebSocket bridge URL configuration for remote sessions. Enables Claude Code to connect to
a remote session via a WebSocket bridge, allowing interaction across network boundaries.

### chomp-inflection (Tier 4, detection-only)

Prompt suggestions system — after Claude responds, it can suggest follow-up prompts the
user might want to try. Controlled by the `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` env var.
The `tengu_prompt_suggestion` and `tengu_prompt_suggestion_init` telemetry flags track usage.

### speculation (Tier 5, inline)

Speculative execution — while the user is still typing, Claude pre-runs tool calls it
predicts will be needed. This reduces perceived latency by having results ready when the
model commits to a tool call. Runs in a sandboxed context for safety.

### structured-output (Tier 5, inline)

Enables the structured output mode where the model returns typed/structured responses
instead of free-form text. Used internally for tool calls and potentially for external
consumers via the SDK. The `tengu_structured_output_failure` flag tracks when it fails.

### streaming-tool-exec-v2 (Tier 5, inline)

Second iteration of streaming tool execution. Allows tools to begin executing while the
model is still streaming its response — as soon as a complete tool call is parsed from
the stream, execution starts without waiting for the full response. The v1 version
(`tengu_streaming_tool_execution_used`) is tracked separately.

### system-prompt-global-cache (detection-only)

Shares the system prompt cache across sessions. Normally each session has its own prompt
cache. This feature enables a global cache that persists, reducing startup time and token
costs when starting new sessions in the same project.

### thinkback (Tier 5, inline)

A year-in-review animation skill activated by the `/think-back` command. Appears to offer
edit, fix, and regenerate modes for reviewing past work.

### marble-anvil — Clear Thinking Beta

Controls the `clear_thinking_20251015` beta feature. When enabled alongside thinking mode,
it enables "thinking edits" — a variant where the model's thinking process includes
in-place edits rather than traditional thinking blocks. This is associated with the
`USE_API_CONTEXT_MANAGEMENT` env var check.

### coral-fern — Past Session Access

Adds system prompt instructions about accessing historical session data. When enabled,
Claude Code can reference context from previous sessions in the same project, beyond
just the current conversation.

### quiet-fern — VS Code Extension Experiment

Sent to VS Code and other IDE extensions as an experiment flag alongside `penguins_enabled`
(Fast Mode). Controls IDE-specific A/B testing.

### scarf-coffee — Conditional Tool Injection

Adds a tool (`ulT`) to the tool list when the gate is enabled AND another condition is met
(appears to require the user to be on a specific API backend). This may gate access to an
experimental tool.

### cork-m4q — Policy Spec Injection

Controls whether `<policy_spec>` XML is injected into the system prompt. This is the
guardrails/safety policy system — the BashTool pre-flight check is part of this. When enabled,
additional safety policies are loaded and injected as structured XML.

### tst-kx7 — Tool Search Experiment

Controls whether tool search is enabled when the score is below threshold but deferred tools
are present. This is an A/B experiment using GrowthBook — when GrowthBook isn't ready, it
falls back to disabled. Tool search helps the model find the right tool when many are available.

### plum-vx3 — WebSearch Behavior

Controls WebSearch tool behavior. When enabled: sets `maxThinkingTokens: 0` (disables
extended thinking), forces `toolChoice` to `web_search`, and uses an alternate model (`AC()`
function). This makes web searches faster by skipping thinking and routing to a search-optimized
model.

### kv7-prompt-sort — Prompt Reordering

Reorders system prompt sections for better cache efficiency. By sorting prompt sections in a
deterministic order, more sessions can share cached prompt prefixes, reducing costs and latency.

### crystal-beam (Tier 5, inline)

Opus 4.6 thinking budget tokens gate. Returns an object containing token budget information
for the extended thinking feature, allowing fine-grained control over thinking token allocation.

### swann-brevity (Tier 5, inline)

Output brevity mode control. A data gate that returns either `"strict"` for concise output
or `null` for normal output, allowing A/B testing of output length preferences.

### bergotte-lantern (Tier 5, inline)

Concise/polished output style in system prompt. Controls whether Claude Code uses more
concise or more polished system prompt guidance for response formatting.

### marble-sandcastle (Tier 5, inline)

Fast mode validation gate. Checks that the native binary is available before enabling Fast
Mode (penguin mode), ensuring proper runtime dependencies.

### moth-copse (Tier 5, inline)

Relevant memory injection into context. Controls whether the memory system selectively injects
relevant past context into the current session based on similarity matching.

### mulberry-fog (Tier 5, inline)

Auto memory prompt template variant. Selects between different memory formatting styles for
how learned context is injected into the system prompt.

### slate-nexus (Tier 5, inline)

Claude-code-guide skill/plugin enablement. Gates access to the comprehensive guide skill
that helps users learn Claude Code features and workflows.

### slate-ridge (Tier 5, inline)

VS Code experiment gate. Sent to IDE extensions for A/B testing of VS Code-specific features
and behaviors.

### coral-whistle (Tier 5, inline)

Tool usage frequency tracking. Telemetry gate that enables tracking of how often each tool
is invoked, feeding into tool search and relevance systems.

### pebble-leaf-prune (Tier 5, inline)

Session history leaf node pruning. Controls aggressive cleanup of terminal (leaf) nodes in
session history trees to prevent unbounded memory growth.

### amber-prism (Tier 5, inline)

System prompt content injection for agents. Controls agent-specific customizations to the
system prompt, enabling tailored behavior for team agents.

## Version Compatibility (v2.1.63)

Tested against Claude Code v2.1.63 (native ARM64 binary).

### Patchable Gates Status

| Gate                       | Status        | Notes                                                                       |
| -------------------------- | ------------- | --------------------------------------------------------------------------- |
| `keybinding-customization` | **Patchable** | Simple wrapper, stable across versions                                      |
| `amber-quartz`             | **Patchable** | Voice dictation — new in v2.1.63                                            |
| `ccr-bridge`               | **Patchable** | Remote Control bridge — discovered in RE session                            |
| `mcp-elicitation`          | **Patchable** | MCP elicitation — discovered in RE session                                  |
| `immediate-model-command`  | **Patchable** | Instant /model switching — discovered in RE session                         |
| `pr-status-cli`            | **Patchable** | PR status in CLI — discovered in RE session                                 |
| `session-memory`           | **Patchable** | Updated pattern — now checks both SM_COMPACT env vars and `sm_compact` gate |
| `amber-flint`              | **Patchable** | Updated pattern — now validates env var, argv, and gate together            |
| `copper-bridge`            | **Patchable** | WebSocket bridge config — new in v2.1.63                                    |

### Fully Rolled Out Gates (9)

These gates were removed from patchable status because the features are now fully rolled out:

| Codename            | Flag                      | Notes                                                   |
| ------------------- | ------------------------- | ------------------------------------------------------- |
| `swarm-mode`        | `tengu_brass_pebble`      | Team coordination — fully ungated in v2.1.63            |
| `team-mode`         | `tengu_brass_pebble`      | Task management — fully ungated in v2.1.63              |
| `workout-v2`        | `tengu_workout2`          | Evaluation workflow — feature complete, no longer gated |
| `oboe`              | `tengu_oboe`              | Auto Memory — fully available, no gate check            |
| `silver-lantern`    | `tengu_silver_lantern`    | Subscription promo — fully available                    |
| `copper-lantern`    | `tengu_copper_lantern`    | Pro/Max promo — fully available                         |
| `vinteuil-phrase`   | `tengu_vinteuil_phrase`   | Simplified prompt — fully available                     |
| `marble-kite`       | `tengu_marble_kite`       | Write/edit guardrail bypass — A/B test concluded        |
| `plank-river-frost` | `tengu_plank_river_frost` | Prompt suggestion mode — fully available                |

All detection-only gates (31/31) detected via string matching.

## Environment Variable Overrides

Some gates check environment variables before the Statsig gate. Setting these can
enable the feature without binary patching:

| Variable                               | Gate                       | Effect                                            |
| -------------------------------------- | -------------------------- | ------------------------------------------------- |
| `ENABLE_CLAUDE_CODE_SM_COMPACT`        | session-memory             | Enable session memory compaction                  |
| `DISABLE_CLAUDE_CODE_SM_COMPACT`       | session-memory             | Disable session memory compaction                 |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | amber-flint                | Agent teams (env var + argv + gate must all pass) |
| `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | chomp-inflection           | Prompt suggestions                                |
| `CLAUDE_CODE_SIMPLE`                   | vinteuil-phrase            | Simplified system prompt                          |
| `CLAUDE_CODE_FORCE_GLOBAL_CACHE`       | system-prompt-global-cache | Global system prompt cache                        |

## CLI Commands

```bash
# List all detected gates with status
claude-patcher gates

# Enable a specific gate
claude-patcher gates enable swarm
claude-patcher gates enable oboe

# Enable all patchable gates at once
claude-patcher gates enable --all

# Disable a gate (restores from backup)
claude-patcher gates disable swarm

# Reset all gates to original state
claude-patcher gates reset

# Scan binary for all tengu_* flags (including unknown)
claude-patcher gates scan
```

## How Patching Works

1. **Backup** — A timestamped copy of the bundle is created
2. **Detect** — The gate's regex is matched against the bundle
3. **Patch** — The `patchFn` replaces the matched code with a force-enabled version
4. **Mark** — A marker comment is injected for identification

For JS bundles: `CLAUDE-CODE-PATCHER FEATURE GATES:codename`
For native binaries: `CCP:codename` (shorter to save bytes)

Binary patches use byte-length-preserving replacements padded with JS block comments.
On macOS ARM64, binaries are re-signed with `codesign --sign - --force` after patching.

## See Also

- [TENGU-FLAGS.md](TENGU-FLAGS.md) — Complete 660-flag reference
- [ENV-VARS.md](ENV-VARS.md) — Complete environment variable reference
