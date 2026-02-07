/**
 * Feature Gate Registry
 *
 * Central registry of known Claude Code feature gates with detection
 * regexes and patch/unpatch functions. Gates are Statsig feature flags
 * using the tengu_* naming convention.
 */

import type { FeatureGate } from '../types.js';

/** Marker injected into patched gate code for identification */
export const GATE_PATCH_MARKER = 'CLAUDE-CODE-PATCHER FEATURE GATES';

/** Short marker for binary patches (saves bytes vs the full marker) */
export const BINARY_PATCH_MARKER = 'CCP';

/**
 * All known patchable feature gates.
 *
 * Detection regexes target patterns in the minified Claude Code JS bundle.
 * Only gates whose function bodies have been reverse-engineered get
 * patchFn/unpatchFn implementations. Others are detection-only.
 */
const PATCHABLE_GATES: FeatureGate[] = [
  {
    name: 'tengu_brass_pebble',
    codename: 'swarm-mode',
    description: 'Swarm/TeammateTool/delegate gate — enables multi-agent coordination',
    category: 'feature',
    detectRegex:
      /function\s+([a-zA-Z_$][\w$]*)\(\)\{if\([\w$]+\(process\.env\.CLAUDE_CODE_AGENT_SWARMS\)\)return!1;return\s*[\w$]+\("tengu_brass_pebble",!1\)\}/,
    patchFn(content: string, match: RegExpMatchArray): string {
      const fnName = match[1];
      return content.replace(
        match[0],
        `function ${fnName}(){return!0}/*${GATE_PATCH_MARKER}:swarm-mode*/`
      );
    },
    unpatchFn(content: string): string {
      const patchedPattern =
        /function\s+([a-zA-Z_$][\w$]*)\(\)\{return!0\}\/\*CLAUDE-CODE-PATCHER FEATURE GATES:swarm-mode\*\//;
      const m = content.match(patchedPattern);
      if (!m) return content;
      // Cannot fully restore — return content unchanged; use backup instead
      return content;
    },
    envOverride: 'CLAUDE_CODE_AGENT_SWARMS',
    semanticReplacement: (match: RegExpMatchArray) => `function ${match[1]}(){return!0}`,
  },
  {
    name: 'tengu_brass_pebble',
    codename: 'team-mode',
    description: 'Team mode — TodoWrite-adjacent task/team features',
    category: 'feature',
    detectRegex:
      /isEnabled\(\)\{return!([\w$]+)\(\)\}/,
    patchFn(content: string, match: RegExpMatchArray): string {
      // The gate function returns !someGateCheck() — we flip the boolean
      // so isEnabled() returns true
      return content.replace(
        match[0],
        `isEnabled(){return!0}/*${GATE_PATCH_MARKER}:team-mode*/`
      );
    },
    unpatchFn(content: string): string {
      const patchedPattern =
        /isEnabled\(\)\{return!0\}\/\*CLAUDE-CODE-PATCHER FEATURE GATES:team-mode\*\//;
      const m = content.match(patchedPattern);
      if (!m) return content;
      return content;
    },
    envOverride: 'CLAUDE_CODE_TEAM_MODE',
    semanticReplacement: () => 'isEnabled(){return!0}',
  },
];

/**
 * All known codename-style feature gates (detection-only for most).
 * These are opaque Statsig gates whose function bodies haven't been
 * reverse-engineered yet.
 */
const DETECTION_ONLY_GATES: FeatureGate[] = [
  // ── Known purpose (reverse-engineered from v2.1.34 binary) ──────────
  {
    name: 'tengu_amber_flint',
    codename: 'amber-flint',
    description: 'Agent Teams feature gate — second check after CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS env var',
    category: 'feature',
    detectRegex: /tengu_amber_flint/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
    envOverride: 'CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS',
  },
  {
    name: 'tengu_oboe',
    codename: 'oboe',
    description: 'Auto Memory — enables persistent ~/.claude/memory/MEMORY.md loaded into system prompt each turn',
    category: 'feature',
    detectRegex: /tengu_oboe/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
    envOverride: 'CLAUDE_CODE_DISABLE_AUTO_MEMORY',
  },
  {
    name: 'tengu_vinteuil_phrase',
    codename: 'vinteuil-phrase',
    description: 'Simplified system prompt path — lighter/faster prompt variant with proactive features',
    category: 'feature',
    detectRegex: /tengu_vinteuil_phrase/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
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
    name: 'tengu_chomp_inflection',
    codename: 'chomp-inflection',
    description: 'Response inflection/tone shaping — possibly controls response style or cadence',
    category: 'feature',
    detectRegex: /tengu_chomp_inflection/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_copper_lantern',
    codename: 'copper-lantern',
    description: 'Configurable feature gate with tengu_copper_lantern_config companion — purpose under investigation',
    category: 'feature',
    detectRegex: /tengu_copper_lantern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_silver_lantern',
    codename: 'silver-lantern',
    description: 'Lantern family gate — related to copper_lantern and quartz_lantern',
    category: 'feature',
    detectRegex: /tengu_silver_lantern/,
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
  {
    name: 'tengu_workout2',
    codename: 'workout-v2',
    description: 'Workout v2 — iteration on tengu_workout feature',
    category: 'feature',
    detectRegex: /tengu_workout2/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },

  // ── Existing gates (carried forward) ────────────────────────────────
  {
    name: 'tengu_marble_anvil',
    codename: 'marble-anvil',
    description: 'Unknown feature gate',
    category: 'feature',
    detectRegex: /tengu_marble_anvil/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_marble_kite',
    codename: 'marble-kite',
    description: 'Unknown feature gate',
    category: 'feature',
    detectRegex: /tengu_marble_kite/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_coral_fern',
    codename: 'coral-fern',
    description: 'Unknown feature gate',
    category: 'feature',
    detectRegex: /tengu_coral_fern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_quiet_fern',
    codename: 'quiet-fern',
    description: 'Unknown feature gate',
    category: 'feature',
    detectRegex: /tengu_quiet_fern/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_plank_river_frost',
    codename: 'plank-river-frost',
    description: 'Unknown feature gate',
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
    description: 'Unknown feature gate',
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
    description: 'Unknown feature gate',
    category: 'feature',
    detectRegex: /tengu_flicker/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_tool_pear',
    codename: 'tool-pear',
    description: 'Unknown tool-related feature gate',
    category: 'feature',
    detectRegex: /tengu_tool_pear/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_cork_m4q',
    codename: 'cork-m4q',
    description: 'Unknown feature gate',
    category: 'feature',
    detectRegex: /tengu_cork_m4q/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_tst_kx7',
    codename: 'tst-kx7',
    description: 'Unknown/test gate',
    category: 'experiment',
    detectRegex: /tengu_tst_kx7/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_plum_vx3',
    codename: 'plum-vx3',
    description: 'Unknown feature gate',
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
    description: 'Unknown feature gate (superseded by workout2)',
    category: 'feature',
    detectRegex: /tengu_workout/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
];

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
