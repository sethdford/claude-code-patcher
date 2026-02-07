# Feature Gates Reference

> Patchable feature gates in Claude Code v2.1.37 and how to control them with `claude-patcher gates`.

## Overview

Claude Code uses [Statsig](https://statsig.com/) feature gates to control the rollout of
new functionality. Gates are identified by `tengu_*` flags embedded in the minified JS
bundle or native binary. Of 605+ flags, most are telemetry event names — only ~30
codename-style gates control feature availability.

## Patchable Gates (9)

### Tier 1 — Simple Wrappers

| Codename | Flag | What It Controls |
|----------|------|-----------------|
| `workout-v2` | `tengu_workout2` | Workout v2 — iteration on the workout feature (purpose TBD) |
| `keybinding-customization` | `tengu_keybinding_customization_release` | Custom keyboard shortcut configuration via `~/.claude/keybindings.json` |
| `session-memory` | `tengu_session_memory` | Persistent session memory — remembers context across sessions within the same project |

### Tier 2 — Env-Guarded

| Codename | Flag | Env Override | What It Controls |
|----------|------|-------------|-----------------|
| `swarm-mode` | `tengu_brass_pebble` | `CLAUDE_CODE_AGENT_SWARMS` | Multi-agent swarm coordination — TeamCreate, SendMessage, delegate tools |
| `oboe` | `tengu_oboe` | `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Auto Memory — persistent `~/.claude/memory/MEMORY.md` loaded into system prompt every turn |
| `amber-flint` | `tengu_amber_flint` | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | Agent Teams — team-based multi-agent coordination with task lists |

### Tier 3 — Complex

| Codename | Flag | Env Override | What It Controls |
|----------|------|-------------|-----------------|
| `team-mode` | `tengu_brass_pebble` | `CLAUDE_CODE_TEAM_MODE` | Team mode — task management (TaskCreate/TaskList/TaskUpdate) and team collaboration |
| `silver-lantern` | `tengu_silver_lantern` | | Promo mode selector — returns "promo" or "launch-only" based on subscription state |
| `copper-lantern` | `tengu_copper_lantern` | | Pro/Max subscription promo banner — checks subscription tier, config dates, and extra usage |

## Detection-Only Gates (22)

### With Env Override (3)

| Codename | Flag | Env Override | What It Controls |
|----------|------|-------------|-----------------|
| `chomp-inflection` | `tengu_chomp_inflection` | `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | Prompt suggestions — suggests next prompts after model responses |
| `vinteuil-phrase` | `tengu_vinteuil_phrase` | `CLAUDE_CODE_SIMPLE` | Simplified system prompt — lighter prompt for reduced latency/cost |
| `system-prompt-global-cache` | `tengu_system_prompt_global_cache` | `CLAUDE_CODE_FORCE_GLOBAL_CACHE` | Global prompt cache — share prompt cache across sessions |

### Inline Checks — Tier 5 (4)

| Codename | Flag | What It Controls |
|----------|------|-----------------|
| `speculation` | `tengu_speculation` | Speculative execution — pre-run likely tool calls while user types |
| `structured-output` | `tengu_structured_output_enabled` | Structured output — typed/structured model responses |
| `streaming-tool-exec-v2` | `tengu_streaming_tool_execution2` | Streaming tool execution v2 — execute tools while model still streaming |
| `thinkback` | `tengu_thinkback` | Year-in-review animation — /think-back skill |

### Reverse-Engineered Gates (15)

| Codename | Flag | What It Controls |
|----------|------|--------------------|
| `marble-anvil` | `tengu_marble_anvil` | Clear thinking beta (`clear_thinking_20251015`) — adds thinking edits when thinking mode is enabled |
| `marble-kite` | `tengu_marble_kite` | Write/Edit guardrail bypass — removes "must read file before editing/writing" restriction (18 occurrences, A/B test) |
| `coral-fern` | `tengu_coral_fern` | Past session access — injects system prompt instructions for accessing historical session data |
| `quiet-fern` | `tengu_quiet_fern` | VS Code extension experiment — sent alongside `penguins_enabled` to IDE extensions |
| `plank-river-frost` | `tengu_plank_river_frost` | Prompt suggestion mode — controls the `[SUGGESTION MODE: ...]` system prompt for next-prompt suggestions |
| `quartz-lantern` | `tengu_quartz_lantern` | Lantern family gate — related to copper/silver lantern subscription features |
| `scarf-coffee` | `tengu_scarf_coffee` | Conditional tool injection — adds a tool to the tool list when gate is enabled alongside another condition |
| `cache-plum-violet` | `tengu_cache_plum_violet` | Prompt cache variant — controls an alternate caching strategy |
| `flicker` | `tengu_flicker` | Terminal UI flicker telemetry — tracks resize flickers, NOT a feature gate (telemetry event only) |
| `tool-pear` | `tengu_tool_pear` | Tool schema filtering experiment — controls how tool `inputJSONSchema` is presented to the model via `l1()` |
| `cork-m4q` | `tengu_cork_m4q` | Policy spec injection — controls `<policy_spec>` XML injection into system prompt (guardrails/safety system) |
| `tst-kx7` | `tengu_tst_kx7` | Tool search experiment — enables tool search when below threshold with deferred tools present (9 occurrences) |
| `plum-vx3` | `tengu_plum_vx3` | WebSearch behavior — disables thinking (`maxThinkingTokens: 0`), forces `web_search` tool choice, uses alternate model |
| `kv7-prompt-sort` | `tengu_kv7_prompt_sort` | Prompt section reordering — reorders system prompt sections for cache efficiency |
| `workout` | `tengu_workout` | Workout v1 — original evaluation/training workflow (superseded by workout2) |

## Deep Analysis — What Each Feature Actually Does

### swarm-mode (Tier 2)
Enables the **TeamCreate**, **SendMessage**, **TeamDelete** tools and the delegate/Task
spawning system. When active, Claude Code can spawn teammate agents that work in parallel
on shared task lists. Each teammate gets its own context window and can communicate via
direct messages. The team lead coordinates work via `~/.claude/teams/{team-name}/` config
and `~/.claude/tasks/{team-name}/` task lists.

### team-mode (Tier 3)
Enables the **TaskCreate**, **TaskUpdate**, **TaskGet**, **TaskList** tools for structured
task management. Tasks have subjects, descriptions, statuses (pending/in_progress/completed),
owners, and dependency tracking (blocks/blockedBy). Used both standalone and as part of
agent swarms.

### oboe — Auto Memory (Tier 2)
Creates and maintains `~/.claude/projects/{project-hash}/memory/MEMORY.md`. This file is
loaded into the system prompt on every turn, giving Claude persistent memory across
conversations within the same project. Claude writes learnings, patterns, and insights
to MEMORY.md as it works. Lines after 200 are truncated. Additional topic files
(e.g., `debugging.md`, `patterns.md`) can be created alongside it.

### session-memory (Tier 1)
Separate from auto memory — this tracks session-specific context that persists when a
session is resumed. Includes session quality classification, memory extraction during
compaction, and file-level session memory reads. The `tengu_sm_compact_*` flags handle
compacting session memory when it grows too large.

### amber-flint — Agent Teams (Tier 2)
The second gate check (after the `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` env var) for the
full agent teams system. This is the Statsig-gated rollout control — the env var alone
isn't sufficient, both must pass. The teams system enables structured multi-agent workflows
with leader/worker patterns, task delegation, and coordinated file editing.

### keybinding-customization (Tier 1)
Enables custom keyboard shortcuts via `~/.claude/keybindings.json`. Users can rebind keys,
add chord bindings (multi-key sequences), and customize the submit key. The keybindings-help
skill provides an interactive configuration interface.

### workout-v2 (Tier 1)
Iteration on the original `tengu_workout` gate. The exact feature is not fully documented
externally, but the name suggests an evaluation/training workflow — possibly automated
testing of Claude Code's performance on standardized tasks.

### silver-lantern (Tier 3)
Returns a mode string based on subscription state: `"promo"` for users eligible for
promotional features, `"launch-only"` for base subscribers, or `null` if the gate is off.
This controls which promotional UI elements and feature teasers are shown. Part of the
"lantern" family (silver, copper, quartz, marble).

### copper-lantern (Tier 3)
Controls the Pro/Max subscription promo banner. Checks the user's subscription tier,
configuration dates, and extra usage visit history. Has an associated
`tengu_copper_lantern_config` data flag. More complex than silver-lantern — involves
multi-level subscription state checks.

### chomp-inflection (Tier 4, detection-only)
Prompt suggestions system — after Claude responds, it can suggest follow-up prompts the
user might want to try. Controlled by the `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` env var.
The `tengu_prompt_suggestion` and `tengu_prompt_suggestion_init` telemetry flags track usage.

### vinteuil-phrase (Tier 4, detection-only)
A simplified, lighter system prompt variant. When enabled via `CLAUDE_CODE_SIMPLE=1`,
Claude Code uses a stripped-down system prompt with fewer instructions — reducing input
tokens and potentially improving latency. Named after a Proust reference.

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

### marble-kite — Write/Edit Guardrail Bypass
Removes the restriction that requires reading a file before editing or writing it.
Normally Claude Code enforces "you must use your Read tool at least once before editing"
— this gate disables that guardrail. With 18 binary occurrences, this is likely an A/B
test measuring whether the guardrail helps or hurts code quality.

### coral-fern — Past Session Access
Adds system prompt instructions about accessing historical session data. When enabled,
Claude Code can reference context from previous sessions in the same project, beyond
just the current conversation.

### quiet-fern — VS Code Extension Experiment
Sent to VS Code and other IDE extensions as an experiment flag alongside `penguins_enabled`
(Fast Mode). Controls IDE-specific A/B testing.

### plank-river-frost — Prompt Suggestion System
Controls the `[SUGGESTION MODE: Suggest what the user might naturally type next into Claude
Code...]` system prompt variable. When enabled, Claude generates follow-up prompt suggestions
after responding. Related to `chomp-inflection` but controls the system prompt injection rather
than the UI display.

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

## Version Compatibility (v2.1.37)

Tested against Claude Code v2.1.37 (native ARM64 binary, 181MB).

| Gate | Status | Notes |
|------|--------|-------|
| `swarm-mode` | **Removed** | `tengu_brass_pebble` + `CLAUDE_CODE_AGENT_SWARMS` both removed — swarm mode fully rolled out |
| `team-mode` | Detected | `isEnabled(){return!eq()}` |
| `workout-v2` | Detected | Simple wrapper, stable across versions |
| `keybinding-customization` | Detected | Simple wrapper, stable |
| `session-memory` | Detected | Simple wrapper, stable |
| `oboe` | Detected | Env-guarded wrapper, stable |
| `amber-flint` | Detected | Env-guarded wrapper, stable |
| `silver-lantern` | Detected | Pattern changed: now includes `pB()?"promo-copper":"promo"` ternary |
| `copper-lantern` | Detected | Complex function (349 bytes), nested regex handles it |

All detection-only gates (22/22) detected via simple string matching.

## Environment Variable Overrides

Some gates check environment variables before the Statsig gate. Setting these can
enable the feature without binary patching:

| Variable | Gate | Effect |
|----------|------|--------|
| `CLAUDE_CODE_AGENT_SWARMS` | swarm-mode | Removed in v2.1.37 — swarm features ungated |
| `CLAUDE_CODE_TEAM_MODE` | team-mode | Experimental team mode |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | oboe | Disable auto memory (set truthy to disable) |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | amber-flint | Agent teams (required but not sufficient — gate must also pass) |
| `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION` | chomp-inflection | Prompt suggestions |
| `CLAUDE_CODE_SIMPLE` | vinteuil-phrase | Simplified system prompt |
| `CLAUDE_CODE_FORCE_GLOBAL_CACHE` | system-prompt-global-cache | Global system prompt cache |

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

- [TENGU-FLAGS.md](TENGU-FLAGS.md) — Complete 605-flag reference
- [ENV-VARS.md](ENV-VARS.md) — Complete environment variable reference
