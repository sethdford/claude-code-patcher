/**
 * Feature Gate Registry
 *
 * Central registry of known Claude Code feature gates with detection
 * regexes and patch/unpatch functions. Gates are Statsig feature flags
 * using the tengu_* naming convention.
 *
 * Gate tiers (based on v2.1.63 binary analysis):
 *   Tier 1 – Simple wrappers:  function X(){return g9("tengu_flag",!1)}
 *   Tier 2 – Env-guarded:      env-var check → statsig check
 *   Tier 3 – Complex:          multi-branch returns, subscription checks
 *   Tier 4 – Data gates:       returns object/string, not boolean (detection-only)
 *   Tier 5 – Inline checks:    no wrapper function (detection-only)
 */

import type { FeatureGate } from "../types.js";

/** Marker injected into patched gate code for identification */
export const GATE_PATCH_MARKER = "CLAUDE-CODE-PATCHER FEATURE GATES";

/** Short marker for binary patches (saves bytes vs the full marker) */
export const BINARY_PATCH_MARKER = "CCP";

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Create standard patchFn / unpatchFn / semanticReplacement for gates
 * whose patched form is `function NAME(){return!0}`.
 *
 * The detectRegex must capture the function name in group 1.
 */
function returnTruePatcher(codename: string) {
  return {
    patchFn(content: string, match: RegExpMatchArray): string {
      return content.replace(
        match[0],
        `function ${match[1]}(){return!0}/*${GATE_PATCH_MARKER}:${codename}*/`,
      );
    },
    unpatchFn(content: string): string {
      // Detection only — can't fully restore without backup
      if (!content.includes(`${GATE_PATCH_MARKER}:${codename}`)) return content;
      return content;
    },
    semanticReplacement(match: RegExpMatchArray): string {
      return `function ${match[1]}(){return!0}`;
    },
  };
}

// ── Legacy Gates (fully rolled out — kept for reference) ────────────────

/**
 * Gates that were patchable in v2.1.37 but have been fully rolled out
 * (removed from the binary) in v2.1.63. Kept for historical reference
 * and to help users understand why previously-patched gates no longer
 * appear. Not included in detection or patching.
 */
const LEGACY_GATES: FeatureGate[] = [
  {
    name: "tengu_brass_pebble",
    codename: "swarm-mode",
    description:
      "Swarm/TeammateTool/delegate gate — fully rolled out in v2.1.63, no longer gated",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\([\w$]+\(process\.env\.CLAUDE_CODE_AGENT_SWARMS\)\)return!1;return\s*[\w$]+\("tengu_brass_pebble",!1\)\}/,
    ...returnTruePatcher("swarm-mode"),
    envOverride: "CLAUDE_CODE_AGENT_SWARMS",
  },
  {
    name: "tengu_brass_pebble",
    codename: "team-mode",
    description:
      "Team mode — TaskCreate/TaskList/TaskUpdate tools. Fully rolled out in v2.1.63",
    category: "feature",
    detectRegex: /isEnabled\(\)\{return!([\w$]+)\(\)\}/,
    patchFn(content: string, match: RegExpMatchArray): string {
      return content.replace(
        match[0],
        `isEnabled(){return!0}/*${GATE_PATCH_MARKER}:team-mode*/`,
      );
    },
    unpatchFn(content: string): string {
      if (!content.includes(`${GATE_PATCH_MARKER}:team-mode`)) return content;
      return content;
    },
    envOverride: "CLAUDE_CODE_TEAM_MODE",
    semanticReplacement: () => "isEnabled(){return!0}",
  },
  {
    name: "tengu_workout2",
    codename: "workout-v2",
    description: "Workout v2 — fully rolled out in v2.1.63",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_workout2",!1\)\}/,
    ...returnTruePatcher("workout-v2"),
  },
  {
    name: "tengu_oboe",
    codename: "oboe",
    description: "Auto Memory — fully rolled out in v2.1.63, no longer gated",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\([\w$]+\(process\.env\.CLAUDE_CODE_DISABLE_AUTO_MEMORY\)\)return!1;return\s*[\w$]+\("tengu_oboe",!1\)\}/,
    ...returnTruePatcher("oboe"),
    envOverride: "CLAUDE_CODE_DISABLE_AUTO_MEMORY",
  },
  {
    name: "tengu_silver_lantern",
    codename: "silver-lantern",
    description: "Promo mode selector — fully rolled out in v2.1.63",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\(![\w$]+\("tengu_silver_lantern",!1\)\)return null;if\([\w$]+\(\)\)return[\w$() ?":+-]*"promo(?:-copper)?";if\([\w$]+\(\)\)return"launch-only";return null\}/,
    patchFn(content: string, match: RegExpMatchArray): string {
      return content.replace(
        match[0],
        `function ${match[1]}(){return"promo"}/*${GATE_PATCH_MARKER}:silver-lantern*/`,
      );
    },
    unpatchFn(content: string): string {
      if (!content.includes(`${GATE_PATCH_MARKER}:silver-lantern`))
        return content;
      return content;
    },
    semanticReplacement(match: RegExpMatchArray): string {
      return `function ${match[1]}(){return"promo"}`;
    },
  },
  {
    name: "tengu_copper_lantern",
    codename: "copper-lantern",
    description:
      "Pro/Max subscription promo banner — fully rolled out in v2.1.63",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*?tengu_copper_lantern(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/,
    ...returnTruePatcher("copper-lantern"),
  },
];

// ── Patchable Gates ──────────────────────────────────────────────────────

/**
 * All known patchable feature gates (v2.1.63).
 *
 * Detection regexes target patterns in the minified Claude Code JS bundle.
 * Function/variable names use [\w$]+ to survive different minification runs.
 */
const PATCHABLE_GATES: FeatureGate[] = [
  // ── Tier 1: Simple wrappers (function X(){return g9("flag",!1)}) ───
  {
    name: "tengu_keybinding_customization_release",
    codename: "keybinding-customization",
    description:
      "Keybinding customization — enables custom keyboard shortcut configuration",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_keybinding_customization_release",!1\)\}/,
    ...returnTruePatcher("keybinding-customization"),
  },
  {
    name: "tengu_amber_quartz",
    codename: "amber-quartz",
    description: "Voice dictation mode — hold Space to record voice input",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_amber_quartz",!1\)\}/,
    ...returnTruePatcher("amber-quartz"),
  },
  {
    name: "tengu_ccr_bridge",
    codename: "ccr-bridge",
    description:
      "Remote Control bridge — enables controlling Claude Code from another machine via WebSocket",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_ccr_bridge",!1\)\}/,
    ...returnTruePatcher("ccr-bridge"),
  },
  {
    name: "tengu_mcp_elicitation",
    codename: "mcp-elicitation",
    description:
      "MCP elicitation — allows MCP servers to ask the user clarifying questions during tool execution",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_mcp_elicitation",!1\)\}/,
    ...returnTruePatcher("mcp-elicitation"),
  },
  {
    name: "tengu_immediate_model_command",
    codename: "immediate-model-command",
    description:
      "Instant model switching — enables /model command without requiring reconnection",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_immediate_model_command",!1\)\}/,
    ...returnTruePatcher("immediate-model-command"),
  },
  {
    name: "tengu_pr_status_cli",
    codename: "pr-status-cli",
    description:
      "PR status in CLI — displays pull request status information in the terminal interface",
    category: "feature",
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_pr_status_cli",!1\)\}/,
    ...returnTruePatcher("pr-status-cli"),
  },

  // ── Tier 2: Env-guarded / multi-check wrappers ──────────────────────
  {
    name: "tengu_session_memory",
    codename: "session-memory",
    description:
      "Session memory with compaction — persistent memory across sessions, combined with sm_compact check",
    category: "feature",
    // v2.1.63 pattern: checks ENABLE/DISABLE env vars, then both tengu_session_memory AND tengu_sm_compact gates
    // function $IR(){if(TR(process.env.ENABLE_CLAUDE_CODE_SM_COMPACT))return!0;
    //   if(TR(process.env.DISABLE_CLAUDE_CODE_SM_COMPACT))return!1;
    //   let T=W9("tengu_session_memory",!1),R=W9("tengu_sm_compact",!1);return T&&R}
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\([\w$]+\(process\.env\.ENABLE_CLAUDE_CODE_SM_COMPACT\)\)return!0;if\([\w$]+\(process\.env\.DISABLE_CLAUDE_CODE_SM_COMPACT\)\)return!1;let\s+[\w$]+=[\w$]+\("tengu_session_memory",!1\),[\w$]+=[\w$]+\("tengu_sm_compact",!1\);return\s*[\w$]+&&[\w$]+\}/,
    ...returnTruePatcher("session-memory"),
    envOverride: "ENABLE_CLAUDE_CODE_SM_COMPACT",
  },
  {
    name: "tengu_amber_flint",
    codename: "amber-flint",
    description:
      "Agent Teams feature gate — checks env var OR --agent-teams argv, then Statsig gate",
    category: "feature",
    // v2.1.63 pattern: env var OR argv check, then statsig gate
    // function q_(){if(!TR(process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS)&&!JR7())return!1;
    //   if(!W9("tengu_amber_flint",!0))return!1;return!0}
    // where JR7()=process.argv.includes("--agent-teams")
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\(![\w$]+\(process\.env\.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS\)&&![\w$]+\(\)\)return!1;if\(![\w$]+\("tengu_amber_flint",!0\)\)return!1;return!0\}/,
    ...returnTruePatcher("amber-flint"),
    envOverride: "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS",
  },
  {
    name: "tengu_copper_bridge",
    codename: "copper-bridge",
    description:
      "WebSocket bridge URL for remote sessions — removes gate guard to always provide bridge URL",
    category: "feature",
    // v2.1.63 pattern: gate check guards the bridge URL return
    // function kx8(){if(!W9("tengu_copper_bridge",!1))return;...return"wss://bridge..."}
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\(![\w$]+\("tengu_copper_bridge",!1\)\)return;/,
    patchFn(content: string, match: RegExpMatchArray): string {
      // Remove the gate check, let the function proceed to return the bridge URL
      return content.replace(
        match[0],
        `function ${match[1]}(){/*${GATE_PATCH_MARKER}:copper-bridge*/`,
      );
    },
    unpatchFn(content: string): string {
      if (!content.includes(`${GATE_PATCH_MARKER}:copper-bridge`))
        return content;
      return content;
    },
    semanticReplacement(match: RegExpMatchArray): string {
      return `function ${match[1]}(){`;
    },
  },
];

// ── Detection-Only Gates ─────────────────────────────────────────────────

/**
 * All known codename-style feature gates that are detection-only (v2.1.63).
 *
 * Tier 4: Data gates — returns object/string, not boolean.
 * Tier 5: Inline checks with no wrapper function — not patchable as gates.
 */
const DETECTION_ONLY_GATES: FeatureGate[] = [
  // ── Tier 4: Data gates / complex — env var override preferred ───────
  {
    name: "tengu_chomp_inflection",
    codename: "chomp-inflection",
    description:
      "Prompt suggestions — suggests next prompts after responses. Env: CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION",
    category: "feature",
    detectRegex: /tengu_chomp_inflection/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
    envOverride: "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION",
  },
  {
    name: "tengu_crystal_beam",
    codename: "crystal-beam",
    description:
      "Opus 4.6 thinking budget tokens — data gate that returns a token budget object, not a boolean",
    category: "feature",
    detectRegex: /tengu_crystal_beam/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_swann_brevity",
    codename: "swann-brevity",
    description:
      'Output brevity mode — data gate that returns "strict" or null to control output verbosity',
    category: "feature",
    detectRegex: /tengu_swann_brevity/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },

  // ── Tier 5: Inline checks (no wrapper function) ───────────────────
  {
    name: "tengu_speculation",
    codename: "speculation",
    description:
      "Speculative execution — pre-runs likely next tool calls while user is typing, with sandbox safety",
    category: "feature",
    detectRegex: /tengu_speculation/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_structured_output_enabled",
    codename: "structured-output",
    description:
      "Structured output mode — enables structured/typed responses from the model",
    category: "feature",
    detectRegex: /tengu_structured_output_enabled/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_streaming_tool_execution2",
    codename: "streaming-tool-exec-v2",
    description:
      "Streaming tool execution v2 — execute tools while model is still streaming response",
    category: "feature",
    detectRegex: /tengu_streaming_tool_execution2/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_thinkback",
    codename: "thinkback",
    description:
      "Year-in-review animation skill — /think-back command with edit/fix/regenerate modes",
    category: "feature",
    detectRegex: /tengu_thinkback/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_system_prompt_global_cache",
    codename: "system-prompt-global-cache",
    description:
      "Global system prompt caching — share prompt cache across sessions for faster startup",
    category: "feature",
    detectRegex: /tengu_system_prompt_global_cache/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
    envOverride: "CLAUDE_CODE_FORCE_GLOBAL_CACHE",
  },
  {
    name: "tengu_marble_anvil",
    codename: "marble-anvil",
    description:
      "Clear thinking beta (clear_thinking_20251015) — adds thinking edits when enabled with thinking mode",
    category: "feature",
    detectRegex: /tengu_marble_anvil/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_coral_fern",
    codename: "coral-fern",
    description:
      "Past session access — adds system prompt instructions for accessing past session data",
    category: "feature",
    detectRegex: /tengu_coral_fern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_quiet_fern",
    codename: "quiet-fern",
    description:
      "VS Code extension experiment gate — sent alongside penguins_enabled to IDE extensions",
    category: "feature",
    detectRegex: /tengu_quiet_fern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_quartz_lantern",
    codename: "quartz-lantern",
    description:
      "Lantern family gate — related to copper_lantern and silver_lantern",
    category: "feature",
    detectRegex: /tengu_quartz_lantern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_scarf_coffee",
    codename: "scarf-coffee",
    description:
      "Conditional tool injection — adds a tool to the tool list when enabled alongside another condition",
    category: "feature",
    detectRegex: /tengu_scarf_coffee/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_cache_plum_violet",
    codename: "cache-plum-violet",
    description: "Cache feature gate — related to prompt caching",
    category: "feature",
    detectRegex: /tengu_cache_plum_violet/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_flicker",
    codename: "flicker",
    description:
      "Terminal UI flicker telemetry — tracks resize flickers in TUI (not a feature gate, telemetry only)",
    category: "telemetry",
    detectRegex: /tengu_flicker/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_tool_pear",
    codename: "tool-pear",
    description:
      "Tool schema filtering — controls how tool inputJSONSchema is presented to the model (experiment)",
    category: "experiment",
    detectRegex: /tengu_tool_pear/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_cork_m4q",
    codename: "cork-m4q",
    description:
      "Policy spec injection — controls <policy_spec> XML injection into system prompt (guardrails/safety)",
    category: "feature",
    detectRegex: /tengu_cork_m4q/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_tst_kx7",
    codename: "tst-kx7",
    description:
      "Tool search experiment — enables tool search when below threshold with deferred tools present",
    category: "experiment",
    detectRegex: /tengu_tst_kx7/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_plum_vx3",
    codename: "plum-vx3",
    description:
      "WebSearch behavior — disables thinking, forces web_search tool choice, uses alternate model when enabled",
    category: "feature",
    detectRegex: /tengu_plum_vx3/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_kv7_prompt_sort",
    codename: "kv7-prompt-sort",
    description:
      "Prompt sorting — reorders system prompt sections for cache efficiency",
    category: "feature",
    detectRegex: /tengu_kv7_prompt_sort/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },

  // ── New gates discovered in v2.1.63 ─────────────────────────────────
  {
    name: "tengu_bergotte_lantern",
    codename: "bergotte-lantern",
    description:
      "Concise/polished output style — injects style instructions into system prompt",
    category: "feature",
    detectRegex: /tengu_bergotte_lantern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_marble_sandcastle",
    codename: "marble-sandcastle",
    description:
      "Fast mode native binary check — requires native binary for fast mode activation",
    category: "feature",
    detectRegex: /tengu_marble_sandcastle/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_moth_copse",
    codename: "moth-copse",
    description:
      "Relevant memory injection — injects relevant memories from auto-memory into context",
    category: "feature",
    detectRegex: /tengu_moth_copse/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_mulberry_fog",
    codename: "mulberry-fog",
    description:
      "Auto memory prompt template variant — alternate template for auto-memory system prompt injection",
    category: "feature",
    detectRegex: /tengu_mulberry_fog/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_slate_nexus",
    codename: "slate-nexus",
    description:
      "Claude-code-guide skill/plugin enablement — controls availability of the guide skill",
    category: "feature",
    detectRegex: /tengu_slate_nexus/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_slate_ridge",
    codename: "slate-ridge",
    description:
      "VS Code experiment gate — sent to IDE extensions for A/B testing",
    category: "experiment",
    detectRegex: /tengu_slate_ridge/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_coral_whistle",
    codename: "coral-whistle",
    description:
      "Tool usage frequency tracking — monitors and reports tool usage patterns",
    category: "telemetry",
    detectRegex: /tengu_coral_whistle/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_pebble_leaf_prune",
    codename: "pebble-leaf-prune",
    description:
      "Session history leaf node pruning — optimizes session history by pruning unnecessary leaf nodes",
    category: "feature",
    detectRegex: /tengu_pebble_leaf_prune/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_amber_prism",
    codename: "amber-prism",
    description:
      "System prompt content injection for agents — controls additional system prompt content for agent mode",
    category: "feature",
    detectRegex: /tengu_amber_prism/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_penguins_off",
    codename: "penguins-off",
    description:
      "Fast mode kill switch — server-side gate that returns a disable message when fast mode should be turned off",
    category: "feature",
    detectRegex: /tengu_penguins_off/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: "tengu_tst_names_in_messages",
    codename: "tst-names-in-messages",
    description:
      "Tool search names injection — injects tool names into messages for improved tool selection accuracy",
    category: "experiment",
    detectRegex: /tengu_tst_names_in_messages/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
];

// ── Public API ───────────────────────────────────────────────────────────

/** Combined list of all active (non-legacy) gates */
const ALL_GATES: FeatureGate[] = [...PATCHABLE_GATES, ...DETECTION_ONLY_GATES];

/**
 * Get all active (non-legacy) feature gates
 */
export function getAllGates(): FeatureGate[] {
  return ALL_GATES;
}

/**
 * Get only gates that have real patch implementations
 */
export function getPatchableGates(): FeatureGate[] {
  return PATCHABLE_GATES;
}

/**
 * Get legacy gates (fully rolled out, no longer in binary)
 */
export function getLegacyGates(): FeatureGate[] {
  return LEGACY_GATES;
}

/**
 * Look up a gate by its Statsig flag name or codename (searches active and legacy)
 */
export function findGate(nameOrCodename: string): FeatureGate | undefined {
  const lower = nameOrCodename.toLowerCase();
  // Search active gates first, then legacy
  return (
    ALL_GATES.find(
      (g) =>
        g.name === lower ||
        g.codename === lower ||
        g.name === `tengu_${lower.replace(/-/g, "_")}`,
    ) ??
    LEGACY_GATES.find(
      (g) =>
        g.name === lower ||
        g.codename === lower ||
        g.name === `tengu_${lower.replace(/-/g, "_")}`,
    )
  );
}

/**
 * Look up a patchable gate by name or codename
 */
export function findPatchableGate(
  nameOrCodename: string,
): FeatureGate | undefined {
  const lower = nameOrCodename.toLowerCase();
  return PATCHABLE_GATES.find(
    (g) =>
      g.name === lower ||
      g.codename === lower ||
      g.name === `tengu_${lower.replace(/-/g, "_")}`,
  );
}

/**
 * Filter gates by category
 */
export function getGatesByCategory(
  category: FeatureGate["category"],
): FeatureGate[] {
  return ALL_GATES.filter((g) => g.category === category);
}

/**
 * Check if a gate name matches a known patchable gate
 */
export function isPatchable(nameOrCodename: string): boolean {
  return findPatchableGate(nameOrCodename) !== undefined;
}
