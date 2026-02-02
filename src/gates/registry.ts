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
    description: 'Unknown feature gate',
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
    description: 'Cache feature gate',
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
    description: 'Unknown feature gate',
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
    description: 'Prompt sorting feature',
    category: 'feature',
    detectRegex: /tengu_kv7_prompt_sort/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
  },
  {
    name: 'tengu_workout',
    codename: 'workout',
    description: 'Unknown feature gate',
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
