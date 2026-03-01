/* ==========================================================================
   Claude Insider — Data Layer
   Single source of truth for gates, env vars, changelog, and blog posts
   ========================================================================== */

const GATES = [
  // ── Tier 1 — Simple Wrappers (Patchable) ─────────────────────────────
  {
    codename: "keybinding-customization",
    flag: "tengu_keybinding_customization_release",
    tier: 1,
    patchable: true,
    category: "feature",
    description:
      "Custom keyboard shortcut configuration. Allows users to remap and customize keybindings within Claude Code.",
    envOverride: null,
    cliCommand: "claude-patcher gates enable keybinding-customization",
  },
  {
    codename: "amber-quartz",
    flag: "tengu_amber_quartz",
    tier: 1,
    patchable: true,
    category: "feature",
    description:
      "Voice dictation mode — hold Space to record audio input. Enables speech-to-text interaction with Claude Code.",
    envOverride: null,
    cliCommand: "claude-patcher gates enable amber-quartz",
  },
  {
    codename: "ccr-bridge",
    flag: "tengu_ccr_bridge",
    tier: 1,
    patchable: true,
    category: "feature",
    description:
      "Remote Control bridge — control Claude Code from another machine via WebSocket connection.",
    envOverride: null,
    cliCommand: "claude-patcher gates enable ccr-bridge",
  },
  {
    codename: "mcp-elicitation",
    flag: "tengu_mcp_elicitation",
    tier: 1,
    patchable: true,
    category: "feature",
    description:
      "MCP elicitation — allows MCP servers to ask users clarifying questions during tool execution.",
    envOverride: null,
    cliCommand: "claude-patcher gates enable mcp-elicitation",
  },
  {
    codename: "immediate-model-command",
    flag: "tengu_immediate_model_command",
    tier: 1,
    patchable: true,
    category: "feature",
    description:
      "Instant /model switching without requiring reconnection. Changes the active model on the fly.",
    envOverride: null,
    cliCommand: "claude-patcher gates enable immediate-model-command",
  },
  {
    codename: "pr-status-cli",
    flag: "tengu_pr_status_cli",
    tier: 1,
    patchable: true,
    category: "feature",
    description:
      "PR status display in CLI terminal interface. Shows pull request status directly in the Claude Code terminal.",
    envOverride: null,
    cliCommand: "claude-patcher gates enable pr-status-cli",
  },

  // ── Tier 2 — Env-Guarded (Patchable) ─────────────────────────────────
  {
    codename: "session-memory",
    flag: "tengu_session_memory",
    tier: 2,
    patchable: true,
    category: "feature",
    description:
      "Session memory with compaction — persistent memory across sessions with automatic summarization. Enables Claude to remember context between conversations.",
    envOverride: "ENABLE_CLAUDE_CODE_SM_COMPACT",
    envDisable: "DISABLE_CLAUDE_CODE_SM_COMPACT",
    cliCommand: "claude-patcher gates enable session-memory",
  },
  {
    codename: "amber-flint",
    flag: "tengu_amber_flint",
    tier: 2,
    patchable: true,
    category: "feature",
    description:
      "Agent Teams feature gate — enables multi-agent coordination. Checks env var OR --agent-teams argv, then Statsig gate.",
    envOverride: "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS",
    cliCommand: "claude-patcher gates enable amber-flint",
  },
  {
    codename: "copper-bridge",
    flag: "tengu_copper_bridge",
    tier: 2,
    patchable: true,
    category: "feature",
    description:
      "WebSocket bridge URL configuration for remote sessions. Enables connecting Claude Code instances across machines.",
    envOverride: null,
    cliCommand: "claude-patcher gates enable copper-bridge",
  },

  // ── Tier 4 — Data Gates (Detection Only) ──────────────────────────────
  {
    codename: "chomp-inflection",
    flag: "tengu_chomp_inflection",
    tier: 4,
    patchable: false,
    category: "feature",
    description:
      "Prompt suggestions — suggests next prompts after responses. Returns suggestion data for the UI to display.",
    envOverride: "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION",
    cliCommand: null,
  },
  {
    codename: "crystal-beam",
    flag: "tengu_crystal_beam",
    tier: 4,
    patchable: false,
    category: "feature",
    description:
      "Opus 4.6 thinking budget tokens — data gate returning token budget object. Controls how many tokens are allocated for extended thinking.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "swann-brevity",
    flag: "tengu_swann_brevity",
    tier: 4,
    patchable: false,
    category: "feature",
    description:
      'Output brevity mode — returns "strict" or null for output style control. When active, Claude produces more concise responses.',
    envOverride: null,
    cliCommand: null,
  },

  // ── Tier 5 — Inline Checks (Detection Only) ──────────────────────────
  {
    codename: "speculation",
    flag: "tengu_speculation",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Speculative execution — pre-runs likely tool calls while user is typing. Reduces perceived latency by predicting next actions.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "structured-output",
    flag: "tengu_structured_output_enabled",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Structured output mode — enables structured/typed responses. Forces Claude to output in a specific schema format.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "streaming-tool-exec-v2",
    flag: "tengu_streaming_tool_execution2",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Streaming tool execution v2 — execute tools while model is still streaming output. Significantly reduces tool execution latency.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "thinkback",
    flag: "tengu_thinkback",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Year-in-review animation skill — the /think-back command. Generates a visual retrospective of your Claude Code usage.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "system-prompt-global-cache",
    flag: "tengu_system_prompt_global_cache",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Global system prompt caching — share prompt cache across sessions. Reduces API costs and speeds up initial responses.",
    envOverride: "CLAUDE_CODE_FORCE_GLOBAL_CACHE",
    cliCommand: null,
  },
  {
    codename: "marble-anvil",
    flag: "tengu_marble_anvil",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Clear thinking beta (clear_thinking_20251015) — adds thinking edits for transparent reasoning steps.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "coral-fern",
    flag: "tengu_coral_fern",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Past session access — adds system prompt for accessing historical session data and conversation context.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "quiet-fern",
    flag: "tengu_quiet_fern",
    tier: 5,
    patchable: false,
    category: "experiment",
    description:
      "VS Code extension experiment gate — sent to IDE extensions for A/B testing of extension features.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "quartz-lantern",
    flag: "tengu_quartz_lantern",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Lantern family gate — related to copper/silver lantern configuration hierarchy.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "scarf-coffee",
    flag: "tengu_scarf_coffee",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Conditional tool injection — dynamically adds tools when gate is enabled alongside specific conditions.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "cache-plum-violet",
    flag: "tengu_cache_plum_violet",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Cache feature gate — controls prompt caching behavior and cache invalidation strategies.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "flicker",
    flag: "tengu_flicker",
    tier: 5,
    patchable: false,
    category: "telemetry",
    description:
      "Terminal UI flicker telemetry — tracks resize flickers in the terminal. Telemetry-only, not a feature gate.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "tool-pear",
    flag: "tengu_tool_pear",
    tier: 5,
    patchable: false,
    category: "experiment",
    description:
      "Tool schema filtering — controls how tool inputJSONSchema is presented to the model. Affects tool call accuracy.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "cork-m4q",
    flag: "tengu_cork_m4q",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Policy spec injection — controls <policy_spec> XML injection into the system prompt for behavior control.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "tst-kx7",
    flag: "tengu_tst_kx7",
    tier: 5,
    patchable: false,
    category: "experiment",
    description:
      "Tool search experiment — enables tool search with deferred tools. Only loads tools when the model needs them.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "plum-vx3",
    flag: "tengu_plum_vx3",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "WebSearch behavior — disables thinking and forces web_search tool choice for search-oriented queries.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "kv7-prompt-sort",
    flag: "tengu_kv7_prompt_sort",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Prompt section reordering — sorts system prompt sections for maximum cache efficiency and hit rate.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "bergotte-lantern",
    flag: "tengu_bergotte_lantern",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Concise/polished output style — injects style instructions into the system prompt for refined responses.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "marble-sandcastle",
    flag: "tengu_marble_sandcastle",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Fast mode native binary check — requires the native binary for fast mode activation. Validates installation.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "moth-copse",
    flag: "tengu_moth_copse",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Relevant memory injection — injects relevant auto-memories into context at the right time.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "mulberry-fog",
    flag: "tengu_mulberry_fog",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Auto memory prompt template variant — alternate template for memory creation and retrieval prompts.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "slate-nexus",
    flag: "tengu_slate_nexus",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Claude-code-guide skill enablement — gates access to the built-in guide skill for help content.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "slate-ridge",
    flag: "tengu_slate_ridge",
    tier: 5,
    patchable: false,
    category: "experiment",
    description:
      "VS Code experiment gate — sent to IDE extensions for A/B testing of VS Code-specific features.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "coral-whistle",
    flag: "tengu_coral_whistle",
    tier: 5,
    patchable: false,
    category: "telemetry",
    description:
      "Tool usage frequency tracking — monitors tool invocation patterns for analytics and optimization.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "pebble-leaf-prune",
    flag: "tengu_pebble_leaf_prune",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Session history leaf node pruning — cleanup of history trees for reduced memory usage.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "amber-prism",
    flag: "tengu_amber_prism",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "System prompt content injection for agents — agent-specific system prompt customization and persona injection.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "penguins-off",
    flag: "tengu_penguins_off",
    tier: 5,
    patchable: false,
    category: "feature",
    description:
      "Fast mode kill switch — server-side gate returning a disable message. Allows Anthropic to remotely disable fast mode.",
    envOverride: null,
    cliCommand: null,
  },
  {
    codename: "tst-names-in-messages",
    flag: "tengu_tst_names_in_messages",
    tier: 5,
    patchable: false,
    category: "experiment",
    description:
      "Tool search names injection — injects tool names into messages for better tool selection in deferred mode.",
    envOverride: null,
    cliCommand: null,
  },
];

const ENV_VARS = [
  // ── Feature Toggles ───────────────────────────────────────────────────
  {
    name: "CLAUDE_CODE_DISABLE_AUTO_MEMORY",
    description: "Disable automatic memory capture (oboe gate)",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_ATTACHMENTS",
    description: "Disable file attachments in conversations",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_BACKGROUND_TASKS",
    description: "Disable background task execution",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_CLAUDE_MDS",
    description: "Disable loading of CLAUDE.md instruction files",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_COMMAND_INJECTION_CHECK",
    description: "Disable bash command injection safety checks",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS",
    description: "Disable experimental beta features",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_FEEDBACK_SURVEY",
    description: "Disable feedback survey prompts",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING",
    description: "Disable file checkpointing for undo support",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC",
    description: "Disable non-essential network requests",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_OFFICIAL_MARKETPLACE_AUTOINSTALL",
    description: "Disable automatic installation from marketplace",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DISABLE_TERMINAL_TITLE",
    description: "Disable terminal title updates",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_ENABLE_CFC",
    description: "Enable CFC (experimental feature flag)",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION",
    description:
      "Enable prompt suggestions after responses (chomp-inflection gate)",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING",
    description: "Enable SDK file checkpointing",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_ENABLE_TASKS",
    description: "Enable task management tools (TodoWrite, etc.)",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_ENABLE_TELEMETRY",
    description: "Enable telemetry data collection",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_ENABLE_TOKEN_USAGE_ATTACHMENT",
    description: "Enable token usage attachment in responses",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_ENHANCED_TELEMETRY_BETA",
    description: "Enable enhanced telemetry beta",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS",
    description:
      "Enable agent teams / multi-agent coordination (amber-flint gate)",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_FORCE_GLOBAL_CACHE",
    description: "Force global system prompt cache sharing",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_SIMPLE",
    description: "Use simplified system prompt (vinteuil-phrase gate)",
    category: "feature",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_AUTO_BACKGROUND_TASKS",
    description: "Automatically start background tasks",
    category: "feature",
    default: undefined,
    type: "boolean",
  },

  // ── API & Authentication ──────────────────────────────────────────────
  {
    name: "ANTHROPIC_API_KEY",
    description: "Anthropic API key for direct API access",
    category: "api",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_API_BASE_URL",
    description: "Custom API base URL override",
    category: "api",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_API_KEY_FILE_DESCRIPTOR",
    description: "API key via file descriptor (secure)",
    category: "api",
    default: undefined,
    type: "number",
  },
  {
    name: "CLAUDE_CODE_API_KEY_HELPER_TTL_MS",
    description: "API key helper cache TTL in milliseconds",
    category: "api",
    default: undefined,
    type: "number",
  },
  {
    name: "CLAUDE_CODE_ATTRIBUTION_HEADER",
    description: "Custom attribution header for API requests",
    category: "api",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_CUSTOM_OAUTH_URL",
    description: "Custom OAuth URL for authentication",
    category: "api",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_OAUTH_CLIENT_ID",
    description: "OAuth client ID",
    category: "api",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_OAUTH_TOKEN",
    description: "Direct OAuth token (bypasses login flow)",
    category: "api",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_USE_BEDROCK",
    description: "Use AWS Bedrock as the model backend",
    category: "api",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_USE_VERTEX",
    description: "Use Google Vertex AI as the model backend",
    category: "api",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_USE_FOUNDRY",
    description: "Use Foundry as the model backend",
    category: "api",
    default: undefined,
    type: "boolean",
  },
  {
    name: "ANTHROPIC_BASE_URL",
    description: "Anthropic API base URL",
    category: "api",
    default: undefined,
    type: "string",
  },
  {
    name: "ANTHROPIC_BETAS",
    description: "Enable specific API beta features",
    category: "api",
    default: undefined,
    type: "string",
  },
  {
    name: "ANTHROPIC_CUSTOM_HEADERS",
    description: "Custom headers for API requests",
    category: "api",
    default: undefined,
    type: "string",
  },

  // ── Model & Output ────────────────────────────────────────────────────
  {
    name: "ANTHROPIC_MODEL",
    description: "Override the default model (e.g., claude-opus-4-6)",
    category: "model",
    default: undefined,
    type: "string",
  },
  {
    name: "ANTHROPIC_SMALL_FAST_MODEL",
    description: "Override the small/fast model for subagents",
    category: "model",
    default: undefined,
    type: "string",
  },
  {
    name: "ANTHROPIC_DEFAULT_HAIKU_MODEL",
    description: "Override the default Haiku model ID",
    category: "model",
    default: undefined,
    type: "string",
  },
  {
    name: "ANTHROPIC_DEFAULT_OPUS_MODEL",
    description: "Override the default Opus model ID",
    category: "model",
    default: undefined,
    type: "string",
  },
  {
    name: "ANTHROPIC_DEFAULT_SONNET_MODEL",
    description: "Override the default Sonnet model ID",
    category: "model",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_EFFORT_LEVEL",
    description: "Set reasoning effort level (low, medium, high)",
    category: "model",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_MAX_OUTPUT_TOKENS",
    description: "Maximum output tokens per response",
    category: "model",
    default: undefined,
    type: "number",
  },
  {
    name: "CLAUDE_CODE_MAX_RETRIES",
    description: "Maximum number of API retries on failure",
    category: "model",
    default: undefined,
    type: "number",
  },
  {
    name: "CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY",
    description: "Maximum concurrent tool executions",
    category: "model",
    default: undefined,
    type: "number",
  },
  {
    name: "CLAUDE_CODE_SUBAGENT_MODEL",
    description: "Model for subagents (e.g., haiku)",
    category: "model",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS",
    description: "Max tokens for file read operations",
    category: "model",
    default: undefined,
    type: "number",
  },
  {
    name: "CLAUDE_CODE_EXTRA_BODY",
    description: "Extra body parameters for API requests (JSON)",
    category: "model",
    default: undefined,
    type: "string",
  },

  // ── Agent & Team ──────────────────────────────────────────────────────
  {
    name: "CLAUDE_CODE_AGENT_NAME",
    description: "Agent name identifier for team coordination",
    category: "agent",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_IS_COWORK",
    description: "Running in cowork (multi-agent) mode",
    category: "agent",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_PLAN_MODE_REQUIRED",
    description: "Require plan mode before implementation",
    category: "agent",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_TASK_LIST_ID",
    description: "Task list ID for team coordination",
    category: "agent",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_TEAM_NAME",
    description: "Team name for multi-agent sessions",
    category: "agent",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_TEAMMATE_COMMAND",
    description: "Command used to spawn teammates",
    category: "agent",
    default: undefined,
    type: "string",
  },

  // ── Debug & Telemetry ─────────────────────────────────────────────────
  {
    name: "CLAUDE_DEBUG",
    description: "Enable debug mode with verbose output",
    category: "debug",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_DEBUG_LOGS_DIR",
    description: "Directory for debug log output",
    category: "debug",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_DIAGNOSTICS_FILE",
    description: "File path for diagnostics output",
    category: "debug",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_EMIT_TOOL_USE_SUMMARIES",
    description: "Emit summaries of tool executions",
    category: "debug",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_PROFILE_STARTUP",
    description: "Profile application startup performance",
    category: "debug",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_PROFILE_QUERY",
    description: "Profile query execution performance",
    category: "debug",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_PERFETTO_TRACE",
    description: "Output Perfetto trace for profiling",
    category: "debug",
    default: undefined,
    type: "string",
  },

  // ── Shell & IDE ───────────────────────────────────────────────────────
  {
    name: "CLAUDE_CODE_SHELL",
    description: "Override the default shell (e.g., /bin/zsh)",
    category: "shell",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_SHELL_PREFIX",
    description: "Prefix prepended to shell commands",
    category: "shell",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_AUTO_CONNECT_IDE",
    description: "Automatically connect to IDE on startup",
    category: "shell",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_IDE_HOST_OVERRIDE",
    description: "Override IDE host address",
    category: "shell",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_BASH_SANDBOX_SHOW_INDICATOR",
    description: "Show sandbox indicator in bash",
    category: "shell",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR",
    description: "Preserve CWD across bash tool calls",
    category: "shell",
    default: undefined,
    type: "boolean",
  },

  // ── Proxy & Network ───────────────────────────────────────────────────
  {
    name: "CLAUDE_CODE_CLIENT_CERT",
    description: "Client certificate path for mTLS",
    category: "network",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_CLIENT_KEY",
    description: "Client key path for mTLS",
    category: "network",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_HOST_HTTP_PROXY_PORT",
    description: "HTTP proxy port",
    category: "network",
    default: undefined,
    type: "number",
  },
  {
    name: "CLAUDE_CODE_HOST_SOCKS_PROXY_PORT",
    description: "SOCKS proxy port",
    category: "network",
    default: undefined,
    type: "number",
  },
  {
    name: "CLAUDE_CODE_PROXY_RESOLVES_HOSTS",
    description: "Let proxy resolve hostnames",
    category: "network",
    default: undefined,
    type: "boolean",
  },

  // ── Session & Remote ──────────────────────────────────────────────────
  {
    name: "CLAUDE_CODE_REMOTE",
    description: "Running in remote/headless mode",
    category: "session",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_SESSION_ID",
    description: "Session identifier",
    category: "session",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_SSE_PORT",
    description: "SSE server port for remote sessions",
    category: "session",
    default: undefined,
    type: "number",
  },

  // ── Behavior Toggles (DISABLE_*) ──────────────────────────────────────
  {
    name: "DISABLE_AUTO_COMPACT",
    description: "Disable automatic context compaction",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_AUTOUPDATER",
    description: "Disable automatic updates",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_COMPACT",
    description: "Disable all compaction",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_COST_WARNINGS",
    description: "Disable cost warning messages",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_ERROR_REPORTING",
    description: "Disable error reporting to Anthropic",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_INTERLEAVED_THINKING",
    description: "Disable interleaved thinking mode",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_MICROCOMPACT",
    description: "Disable micro-compaction of context",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_PROMPT_CACHING",
    description: "Disable all prompt caching",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_PROMPT_CACHING_HAIKU",
    description: "Disable prompt caching for Haiku model",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_PROMPT_CACHING_OPUS",
    description: "Disable prompt caching for Opus model",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_PROMPT_CACHING_SONNET",
    description: "Disable prompt caching for Sonnet model",
    category: "disable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "DISABLE_TELEMETRY",
    description: "Disable all telemetry",
    category: "disable",
    default: undefined,
    type: "boolean",
  },

  // ── Behavior Toggles (ENABLE_*) ───────────────────────────────────────
  {
    name: "ENABLE_CLAUDE_CODE_SM_COMPACT",
    description: "Enable session memory compaction",
    category: "enable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "ENABLE_LSP_TOOL",
    description: "Enable LSP (Language Server Protocol) tool",
    category: "enable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "ENABLE_MCP_CLI",
    description: "Enable MCP CLI tool",
    category: "enable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "ENABLE_MCP_LARGE_OUTPUT_FILES",
    description: "Enable large output files for MCP",
    category: "enable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "ENABLE_SESSION_BACKGROUNDING",
    description: "Enable session backgrounding",
    category: "enable",
    default: undefined,
    type: "boolean",
  },
  {
    name: "ENABLE_TOOL_SEARCH",
    description: "Enable dynamic tool search",
    category: "enable",
    default: undefined,
    type: "boolean",
  },

  // ── Miscellaneous ─────────────────────────────────────────────────────
  {
    name: "CLAUDE_CODE_ACCESSIBILITY",
    description: "Enable accessibility mode",
    category: "misc",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_GLOB_HIDDEN",
    description: "Include hidden files in glob searches",
    category: "misc",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_TMPDIR",
    description: "Override temp directory location",
    category: "misc",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CONFIG_DIR",
    description: "Override Claude configuration directory",
    category: "misc",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE",
    description: "Override auto-compaction trigger percentage (default 95)",
    category: "misc",
    default: "95",
    type: "number",
  },
  {
    name: "CLAUDE_CODE_SYNTAX_HIGHLIGHT",
    description: "Enable syntax highlighting in output",
    category: "misc",
    default: undefined,
    type: "boolean",
  },
  {
    name: "CLAUDE_CODE_TMUX_PREFIX",
    description: "Override tmux prefix key",
    category: "misc",
    default: undefined,
    type: "string",
  },
  {
    name: "CLAUDE_CODE_ENTRYPOINT",
    description: "Override entrypoint for Claude Code",
    category: "misc",
    default: undefined,
    type: "string",
  },
];

const ENV_CATEGORIES = {
  feature: "Feature Toggles",
  api: "API & Auth",
  model: "Model & Output",
  agent: "Agent & Team",
  debug: "Debug & Telemetry",
  shell: "Shell & IDE",
  network: "Network & Proxy",
  session: "Session & Remote",
  disable: "Disable Flags",
  enable: "Enable Flags",
  misc: "Miscellaneous",
};

const CHANGELOG = [
  {
    version: "v2.1.63",
    date: "2026-02-28",
    major: true,
    title: "6 new patchable gates, 55 new flags",
    items: [
      "4 new Tier 1 patchable gates: amber-quartz (voice dictation), ccr-bridge (remote control), mcp-elicitation, immediate-model-command",
      "2 new Tier 1 patchable gates: pr-status-cli, keybinding-customization",
      "2 new detection-only gates: coral-whistle (telemetry), pebble-leaf-prune (session pruning)",
      "55 new tengu flags discovered (605 → 660 total)",
      "New flag categories: Memory Directory, Subscription & Penguin Mode",
      "Updated docs: FEATURE-GATES.md, ENV-VARS.md, TENGU-FLAGS.md",
    ],
  },
  {
    version: "v2.1.37",
    date: "2026-02-15",
    major: false,
    title: "Initial gate discovery & patcher release",
    items: [
      "First release of claude-code-patcher",
      "Discovered 30 feature gates across 5 tiers",
      "3 patchable Tier 2 gates: session-memory, amber-flint, copper-bridge",
      "605 tengu flags extracted from binary",
      "398 environment variables documented",
    ],
  },
];

const BLOG_POSTS = [
  {
    slug: "reverse-engineering-v2-1-63",
    title: "Reverse Engineering Claude Code v2.1.63",
    date: "2026-02-28",
    excerpt:
      "A deep dive into the latest Claude Code binary — 6 new patchable gates, 55 new flags, and what they reveal about upcoming features.",
    tags: ["reverse-engineering", "gates", "v2.1.63"],
  },
];

// SVG Icon library — inline SVGs for zero external dependencies
const ICONS = {
  // Brand / Logo
  logo: `<svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2L3 8v12l11 6 11-6V8L14 2z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    <path d="M14 8l-6 3.5v7L14 22l6-3.5v-7L14 8z" fill="currentColor" opacity="0.15"/>
    <circle cx="14" cy="14" r="3" fill="currentColor"/>
  </svg>`,

  // Navigation
  gates: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1L2 4v4.5c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V4L8 1z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6 8l1.5 1.5L10 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  envVars: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.3"/>
    <path d="M5 7h6M5 9.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`,

  changelog: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/>
    <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  blog: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3h12v10H2z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 6h6M5 8.5h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`,

  github: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
  </svg>`,

  // Actions
  search: `<svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
    <path d="M11.5 11.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  copy: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="8" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/>
    <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v7A1.5 1.5 0 003.5 12H5" stroke="currentColor" stroke-width="1.3"/>
  </svg>`,

  check: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  chevronDown: `<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5.5L7 9.5L11 5.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  arrowRight: `<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  externalLink: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8.667V12a1.333 1.333 0 01-1.333 1.333H4A1.333 1.333 0 012.667 12V5.333A1.333 1.333 0 014 4h3.333M10 2.667h3.333V6M6.667 9.333L13.333 2.667" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  menu: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  close: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // Stats
  shield: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4L6 10v10c0 8.5 6 15 14 18 8-3 14-9.5 14-18V10L20 4z" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.08"/>
    <path d="M15 20l3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  flag: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 6v28M8 6h20l-5 7 5 7H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="currentColor" fill-opacity="0.08"/>
  </svg>`,

  terminal: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.08"/>
    <path d="M12 17l4 4-4 4M20 25h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  variable: `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="8" width="32" height="24" rx="3" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.08"/>
    <path d="M12 16h16M12 21h12M12 26h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  npm: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="4" width="14" height="8" rx="1" stroke="currentColor" stroke-width="1.3"/>
    <path d="M5 7v3M8 7v3M8 7h2v2H8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  book: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2.5h4.5c1.1 0 2 .9 2 2v9a1.5 1.5 0 00-1.5-1.5H2V2.5zM14 2.5H9.5c-1.1 0-2 .9-2 2v9a1.5 1.5 0 011.5-1.5H14V2.5z" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // Empty state
  searchEmpty: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="14" stroke="currentColor" stroke-width="2"/>
    <path d="M30 30l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 17h12M14 23h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
  </svg>`,
};
