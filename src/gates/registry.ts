/**
 * Feature Gate Registry
 *
 * Central registry of known Claude Code feature gates with detection
 * regexes and patch/unpatch functions. Gates are Statsig feature flags
 * using the tengu_* naming convention.
 *
 * Gate tiers (based on v2.1.34 binary analysis):
 *   Tier 1 – Simple wrappers:  function X(){return g9("tengu_flag",!1)}
 *   Tier 2 – Env-guarded:      env-var check → statsig check
 *   Tier 3 – Complex:          multi-branch returns, subscription checks
 *   Tier 4 – Too complex:      env-var override preferred (detection-only)
 *   Tier 5 – Inline checks:    no wrapper function (detection-only)
 */

import type { FeatureGate } from '../types.js';

/** Marker injected into patched gate code for identification */
export const GATE_PATCH_MARKER = 'CLAUDE-CODE-PATCHER FEATURE GATES';

/** Short marker for binary patches (saves bytes vs the full marker) */
export const BINARY_PATCH_MARKER = 'CCP';

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
        `function ${match[1]}(){return!0}/*${GATE_PATCH_MARKER}:${codename}*/`
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

// ── Patchable Gates ──────────────────────────────────────────────────────

/**
 * All known patchable feature gates.
 *
 * Detection regexes target patterns in the minified Claude Code JS bundle.
 * Function/variable names use [\w$]+ to survive different minification runs.
 */
const PATCHABLE_GATES: FeatureGate[] = [
  // ── Existing: brass_pebble (removed in v2.1.37 — swarm mode fully rolled out) ──
  {
    name: 'tengu_brass_pebble',
    codename: 'swarm-mode',
    description: 'Swarm/TeammateTool/delegate gate — enables multi-agent coordination (removed/ungated in v2.1.37)',
    category: 'feature',
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\([\w$]+\(process\.env\.CLAUDE_CODE_AGENT_SWARMS\)\)return!1;return\s*[\w$]+\("tengu_brass_pebble",!1\)\}/,
    ...returnTruePatcher('swarm-mode'),
    envOverride: 'CLAUDE_CODE_AGENT_SWARMS',
  },
  {
    name: 'tengu_brass_pebble',
    codename: 'team-mode',
    description: 'Team mode — TodoWrite-adjacent task/team features',
    category: 'feature',
    detectRegex:
      /isEnabled\(\)\{return!([\w$]+)\(\)\}/,
    patchFn(content: string, match: RegExpMatchArray): string {
      return content.replace(
        match[0],
        `isEnabled(){return!0}/*${GATE_PATCH_MARKER}:team-mode*/`
      );
    },
    unpatchFn(content: string): string {
      if (!content.includes(`${GATE_PATCH_MARKER}:team-mode`)) return content;
      return content;
    },
    envOverride: 'CLAUDE_CODE_TEAM_MODE',
    semanticReplacement: () => 'isEnabled(){return!0}',
  },

  // ── Tier 1: Simple wrappers (function X(){return g9("flag",!1)}) ───
  {
    name: 'tengu_workout2',
    codename: 'workout-v2',
    description: 'Workout v2 — iteration on tengu_workout feature',
    category: 'feature',
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_workout2",!1\)\}/,
    ...returnTruePatcher('workout-v2'),
  },
  {
    name: 'tengu_keybinding_customization_release',
    codename: 'keybinding-customization',
    description: 'Keybinding customization — enables custom keyboard shortcut configuration',
    category: 'feature',
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_keybinding_customization_release",!1\)\}/,
    ...returnTruePatcher('keybinding-customization'),
  },
  {
    name: 'tengu_session_memory',
    codename: 'session-memory',
    description: 'Session memory — persistent memory across sessions',
    category: 'feature',
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{return\s*[\w$]+\("tengu_session_memory",!1\)\}/,
    ...returnTruePatcher('session-memory'),
  },

  // ── Tier 2: Env-guarded wrappers ───────────────────────────────────
  {
    name: 'tengu_oboe',
    codename: 'oboe',
    description: 'Auto Memory — enables persistent ~/.claude/memory/MEMORY.md loaded into system prompt each turn',
    category: 'feature',
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\([\w$]+\(process\.env\.CLAUDE_CODE_DISABLE_AUTO_MEMORY\)\)return!1;return\s*[\w$]+\("tengu_oboe",!1\)\}/,
    ...returnTruePatcher('oboe'),
    envOverride: 'CLAUDE_CODE_DISABLE_AUTO_MEMORY',
  },
  {
    name: 'tengu_amber_flint',
    codename: 'amber-flint',
    description: 'Agent Teams feature gate — second check after CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS env var',
    category: 'feature',
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\(![\w$]+\(process\.env\.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS\)\)return!1;if\(![\w$]+\("tengu_amber_flint",!0\)\)return!1;return!0\}/,
    ...returnTruePatcher('amber-flint'),
    envOverride: 'CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS',
  },

  // ── Tier 3: Complex wrappers ───────────────────────────────────────
  {
    name: 'tengu_silver_lantern',
    codename: 'silver-lantern',
    description: 'Promo mode selector — returns "promo"/"promo-copper" or "launch-only" based on subscription state',
    category: 'feature',
    // v2.1.37: if(sgT())return pB()?"promo-copper":"promo"  (ternary added)
    // v2.1.34: if(sgT())return"promo"
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\(![\w$]+\("tengu_silver_lantern",!1\)\)return null;if\([\w$]+\(\)\)return[\w$() ?":+-]*"promo(?:-copper)?";if\([\w$]+\(\)\)return"launch-only";return null\}/,
    patchFn(content: string, match: RegExpMatchArray): string {
      return content.replace(
        match[0],
        `function ${match[1]}(){return"promo"}/*${GATE_PATCH_MARKER}:silver-lantern*/`
      );
    },
    unpatchFn(content: string): string {
      if (!content.includes(`${GATE_PATCH_MARKER}:silver-lantern`)) return content;
      return content;
    },
    semanticReplacement(match: RegExpMatchArray): string {
      return `function ${match[1]}(){return"promo"}`;
    },
  },
  {
    name: 'tengu_copper_lantern',
    codename: 'copper-lantern',
    description: 'Pro/Max subscription promo banner — checks subscription tier, config dates, and extra usage visits',
    category: 'feature',
    // Matches function with up to 2 levels of brace nesting, anchored on tengu_copper_lantern
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*?tengu_copper_lantern(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/,
    ...returnTruePatcher('copper-lantern'),
  },
];

// ── Detection-Only Gates ─────────────────────────────────────────────────

/**
 * All known codename-style feature gates that are detection-only.
 *
 * Tier 4: Too complex or has side effects — use env var override instead.
 * Tier 5: Inline checks with no wrapper function — not patchable as gates.
 * Unknown: Purpose not yet reverse-engineered.
 */
const DETECTION_ONLY_GATES: FeatureGate[] = [
  // ── Tier 4: Complex / env var override preferred ───────────────────
  {
    name: 'tengu_chomp_inflection',
    codename: 'chomp-inflection',
    description: 'Prompt suggestions — suggests next prompts after responses. Env: CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION',
    category: 'feature',
    detectRegex: /tengu_chomp_inflection/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
    envOverride: 'CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION',
  },
  {
    name: 'tengu_vinteuil_phrase',
    codename: 'vinteuil-phrase',
    description: 'Simplified system prompt — lighter prompt variant. Env: CLAUDE_CODE_SIMPLE',
    category: 'feature',
    detectRegex: /tengu_vinteuil_phrase/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
    envOverride: 'CLAUDE_CODE_SIMPLE',
  },

  // ── Tier 5: Inline checks (no wrapper function) ───────────────────
  {
    name: 'tengu_speculation',
    codename: 'speculation',
    description: 'Speculative execution — pre-runs likely next tool calls while user is typing, with sandbox safety',
    category: 'feature',
    detectRegex: /tengu_speculation/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_structured_output_enabled',
    codename: 'structured-output',
    description: 'Structured output mode — enables structured/typed responses from the model',
    category: 'feature',
    detectRegex: /tengu_structured_output_enabled/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_streaming_tool_execution2',
    codename: 'streaming-tool-exec-v2',
    description: 'Streaming tool execution v2 — execute tools while model is still streaming response',
    category: 'feature',
    detectRegex: /tengu_streaming_tool_execution2/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_thinkback',
    codename: 'thinkback',
    description: 'Year-in-review animation skill — /think-back command with edit/fix/regenerate modes',
    category: 'feature',
    detectRegex: /tengu_thinkback/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },

  // ── Existing gates (detection-only) ────────────────────────────────
  {
    name: 'tengu_system_prompt_global_cache',
    codename: 'system-prompt-global-cache',
    description: 'Global system prompt caching — share prompt cache across sessions for faster startup',
    category: 'feature',
    detectRegex: /tengu_system_prompt_global_cache/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
    envOverride: 'CLAUDE_CODE_FORCE_GLOBAL_CACHE',
  },
  {
    name: 'tengu_marble_anvil',
    codename: 'marble-anvil',
    description: 'Clear thinking beta (clear_thinking_20251015) — adds thinking edits when enabled with thinking mode',
    category: 'feature',
    detectRegex: /tengu_marble_anvil/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_marble_kite',
    codename: 'marble-kite',
    description: 'Write/Edit guardrail bypass — removes "must read file before editing/writing" restriction',
    category: 'feature',
    detectRegex: /tengu_marble_kite/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_coral_fern',
    codename: 'coral-fern',
    description: 'Past session access — adds system prompt instructions for accessing past session data',
    category: 'feature',
    detectRegex: /tengu_coral_fern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_quiet_fern',
    codename: 'quiet-fern',
    description: 'VS Code extension experiment gate — sent alongside penguins_enabled to IDE extensions',
    category: 'feature',
    detectRegex: /tengu_quiet_fern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_plank_river_frost',
    codename: 'plank-river-frost',
    description: 'Prompt suggestion mode — controls the SUGGESTION MODE system prompt for next-prompt suggestions',
    category: 'feature',
    detectRegex: /tengu_plank_river_frost/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_quartz_lantern',
    codename: 'quartz-lantern',
    description: 'Lantern family gate — related to copper_lantern and silver_lantern',
    category: 'feature',
    detectRegex: /tengu_quartz_lantern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_scarf_coffee',
    codename: 'scarf-coffee',
    description: 'Conditional tool injection — adds a tool to the tool list when enabled alongside another condition',
    category: 'feature',
    detectRegex: /tengu_scarf_coffee/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_cache_plum_violet',
    codename: 'cache-plum-violet',
    description: 'Cache feature gate — related to prompt caching',
    category: 'feature',
    detectRegex: /tengu_cache_plum_violet/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_flicker',
    codename: 'flicker',
    description: 'Terminal UI flicker telemetry — tracks resize flickers in TUI (not a feature gate, telemetry only)',
    category: 'telemetry',
    detectRegex: /tengu_flicker/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_tool_pear',
    codename: 'tool-pear',
    description: 'Tool schema filtering — controls how tool inputJSONSchema is presented to the model (experiment)',
    category: 'experiment',
    detectRegex: /tengu_tool_pear/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_cork_m4q',
    codename: 'cork-m4q',
    description: 'Policy spec injection — controls <policy_spec> XML injection into system prompt (guardrails/safety)',
    category: 'feature',
    detectRegex: /tengu_cork_m4q/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_tst_kx7',
    codename: 'tst-kx7',
    description: 'Tool search experiment — enables tool search when below threshold with deferred tools present',
    category: 'experiment',
    detectRegex: /tengu_tst_kx7/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_plum_vx3',
    codename: 'plum-vx3',
    description: 'WebSearch behavior — disables thinking, forces web_search tool choice, uses alternate model when enabled',
    category: 'feature',
    detectRegex: /tengu_plum_vx3/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_kv7_prompt_sort',
    codename: 'kv7-prompt-sort',
    description: 'Prompt sorting — reorders system prompt sections for cache efficiency',
    category: 'feature',
    detectRegex: /tengu_kv7_prompt_sort/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_workout',
    codename: 'workout',
    description: 'Workout v1 — original evaluation/training workflow feature (superseded by workout2)',
    category: 'feature',
    detectRegex: /tengu_workout/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
];

// ── Public API ───────────────────────────────────────────────────────────

/** Combined list of all registered gates */
const ALL_GATES: FeatureGate[] = [...PATCHABLE_GATES, ...DETECTION_ONLY_GATES];

/**
 * Get all registered feature gates
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
 * Look up a gate by its Statsig flag name or codename
 */
export function findGate(nameOrCodename: string): FeatureGate | undefined {
  const lower = nameOrCodename.toLowerCase();
  return ALL_GATES.find(
    (g) => g.name === lower || g.codename === lower || g.name === `tengu_${lower.replace(/-/g, '_')}`
  );
}

/**
 * Look up a patchable gate by name or codename
 */
export function findPatchableGate(nameOrCodename: string): FeatureGate | undefined {
  const lower = nameOrCodename.toLowerCase();
  return PATCHABLE_GATES.find(
    (g) => g.name === lower || g.codename === lower || g.name === `tengu_${lower.replace(/-/g, '_')}`
  );
}

/**
 * Filter gates by category
 */
export function getGatesByCategory(category: FeatureGate['category']): FeatureGate[] {
  return ALL_GATES.filter((g) => g.category === category);
}

/**
 * Check if a gate name matches a known patchable gate
 */
export function isPatchable(nameOrCodename: string): boolean {
  return findPatchableGate(nameOrCodename) !== undefined;
}
