import { describe, it, expect } from 'vitest';
import {
  getAllGates,
  getPatchableGates,
  findGate,
  findPatchableGate,
  getGatesByCategory,
  isPatchable,
  GATE_PATCH_MARKER,
} from './registry.js';

describe('Gate Registry', () => {
  describe('getAllGates', () => {
    it('should return all registered gates', () => {
      const gates = getAllGates();
      expect(gates.length).toBeGreaterThan(0);
    });

    it('should include both patchable and detection-only gates', () => {
      const all = getAllGates();
      const patchable = getPatchableGates();
      expect(all.length).toBeGreaterThan(patchable.length);
    });

    it('should have valid regex patterns for all gates', () => {
      for (const gate of getAllGates()) {
        expect(gate.detectRegex).toBeInstanceOf(RegExp);
      }
    });

    it('should have non-empty name and codename for all gates', () => {
      for (const gate of getAllGates()) {
        expect(gate.name).toBeTruthy();
        expect(gate.codename).toBeTruthy();
      }
    });

    it('should have valid categories for all gates', () => {
      const validCategories = new Set(['feature', 'experiment', 'telemetry']);
      for (const gate of getAllGates()) {
        expect(validCategories.has(gate.category)).toBe(true);
      }
    });
  });

  describe('getPatchableGates', () => {
    it('should return gates with real patch implementations', () => {
      const patchable = getPatchableGates();
      expect(patchable.length).toBeGreaterThan(0);
    });

    it('should have 9 patchable gates (2 original + 7 promoted)', () => {
      const patchable = getPatchableGates();
      expect(patchable.length).toBe(9);
    });

    it('should include swarm-mode gate', () => {
      const patchable = getPatchableGates();
      const swarm = patchable.find((g) => g.codename === 'swarm-mode');
      expect(swarm).toBeDefined();
      expect(swarm?.envOverride).toBe('CLAUDE_CODE_AGENT_SWARMS');
    });

    it('should include team-mode gate', () => {
      const patchable = getPatchableGates();
      const team = patchable.find((g) => g.codename === 'team-mode');
      expect(team).toBeDefined();
    });

    it('should include all tier 1 gates', () => {
      const patchable = getPatchableGates();
      expect(patchable.find((g) => g.codename === 'workout-v2')).toBeDefined();
      expect(patchable.find((g) => g.codename === 'keybinding-customization')).toBeDefined();
      expect(patchable.find((g) => g.codename === 'session-memory')).toBeDefined();
    });

    it('should include all tier 2 gates', () => {
      const patchable = getPatchableGates();
      expect(patchable.find((g) => g.codename === 'oboe')).toBeDefined();
      expect(patchable.find((g) => g.codename === 'amber-flint')).toBeDefined();
    });

    it('should include all tier 3 gates', () => {
      const patchable = getPatchableGates();
      expect(patchable.find((g) => g.codename === 'silver-lantern')).toBeDefined();
      expect(patchable.find((g) => g.codename === 'copper-lantern')).toBeDefined();
    });

    it('should have semanticReplacement for all patchable gates', () => {
      for (const gate of getPatchableGates()) {
        expect(gate.semanticReplacement).toBeDefined();
      }
    });
  });

  describe('findGate', () => {
    it('should find gate by Statsig flag name', () => {
      const gate = findGate('tengu_brass_pebble');
      expect(gate).toBeDefined();
      expect(gate?.name).toBe('tengu_brass_pebble');
    });

    it('should find gate by codename', () => {
      const gate = findGate('swarm-mode');
      expect(gate).toBeDefined();
      expect(gate?.codename).toBe('swarm-mode');
    });

    it('should find gate by short name with underscore conversion', () => {
      const gate = findGate('marble-anvil');
      expect(gate).toBeDefined();
      expect(gate?.name).toBe('tengu_marble_anvil');
    });

    it('should find new gates by codename', () => {
      expect(findGate('keybinding-customization')).toBeDefined();
      expect(findGate('session-memory')).toBeDefined();
    });

    it('should return undefined for unknown gate', () => {
      const gate = findGate('nonexistent_gate');
      expect(gate).toBeUndefined();
    });
  });

  describe('findPatchableGate', () => {
    it('should find patchable gate by codename', () => {
      const gate = findPatchableGate('swarm-mode');
      expect(gate).toBeDefined();
    });

    it('should find newly promoted gates', () => {
      expect(findPatchableGate('workout-v2')).toBeDefined();
      expect(findPatchableGate('oboe')).toBeDefined();
      expect(findPatchableGate('amber-flint')).toBeDefined();
      expect(findPatchableGate('silver-lantern')).toBeDefined();
      expect(findPatchableGate('copper-lantern')).toBeDefined();
      expect(findPatchableGate('keybinding-customization')).toBeDefined();
      expect(findPatchableGate('session-memory')).toBeDefined();
    });

    it('should return undefined for detection-only gate', () => {
      const gate = findPatchableGate('marble-anvil');
      expect(gate).toBeUndefined();
    });

    it('should return undefined for tier 4/5 gates', () => {
      expect(findPatchableGate('chomp-inflection')).toBeUndefined();
      expect(findPatchableGate('speculation')).toBeUndefined();
      expect(findPatchableGate('thinkback')).toBeUndefined();
    });
  });

  describe('getGatesByCategory', () => {
    it('should filter by feature category', () => {
      const features = getGatesByCategory('feature');
      expect(features.length).toBeGreaterThan(0);
      for (const gate of features) {
        expect(gate.category).toBe('feature');
      }
    });

    it('should filter by experiment category', () => {
      const experiments = getGatesByCategory('experiment');
      expect(experiments.length).toBeGreaterThan(0);
      for (const gate of experiments) {
        expect(gate.category).toBe('experiment');
      }
    });

    it('should return telemetry gates', () => {
      const telemetry = getGatesByCategory('telemetry');
      expect(telemetry.length).toBeGreaterThan(0);
      for (const gate of telemetry) {
        expect(gate.category).toBe('telemetry');
      }
    });
  });

  describe('isPatchable', () => {
    it('should return true for patchable gates', () => {
      expect(isPatchable('swarm-mode')).toBe(true);
      expect(isPatchable('team-mode')).toBe(true);
      expect(isPatchable('workout-v2')).toBe(true);
      expect(isPatchable('oboe')).toBe(true);
      expect(isPatchable('amber-flint')).toBe(true);
      expect(isPatchable('silver-lantern')).toBe(true);
      expect(isPatchable('copper-lantern')).toBe(true);
      expect(isPatchable('keybinding-customization')).toBe(true);
      expect(isPatchable('session-memory')).toBe(true);
    });

    it('should return false for detection-only gates', () => {
      expect(isPatchable('marble-anvil')).toBe(false);
      expect(isPatchable('chomp-inflection')).toBe(false);
      expect(isPatchable('speculation')).toBe(false);
    });

    it('should return false for unknown gates', () => {
      expect(isPatchable('nonexistent')).toBe(false);
    });
  });

  describe('GATE_PATCH_MARKER', () => {
    it('should be a non-empty string', () => {
      expect(GATE_PATCH_MARKER).toBeTruthy();
      expect(typeof GATE_PATCH_MARKER).toBe('string');
    });
  });

  // ── Tier 1: Simple wrapper regex + patchFn ───────────────────────────

  describe('Tier 1: Simple wrapper gates', () => {
    it('workout-v2: should match and patch simple wrapper', () => {
      const gate = findPatchableGate('workout-v2')!;
      const content = 'prefix;function Gt(){return g9("tengu_workout2",!1)}suffix';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe('Gt');

      const patched = gate.patchFn(content, match);
      expect(patched).toContain('function Gt(){return!0}');
      expect(patched).toContain(`${GATE_PATCH_MARKER}:workout-v2`);
      expect(patched).toContain('prefix;');
      expect(patched).toContain('suffix');
    });

    it('keybinding-customization: should match and patch', () => {
      const gate = findPatchableGate('keybinding-customization')!;
      const content = 'function SZ(){return g9("tengu_keybinding_customization_release",!1)}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe('SZ');

      const patched = gate.patchFn(content, match);
      expect(patched).toContain('function SZ(){return!0}');
      expect(patched).toContain(`${GATE_PATCH_MARKER}:keybinding-customization`);
    });

    it('session-memory: should match and patch', () => {
      const gate = findPatchableGate('session-memory')!;
      const content = 'function xP8(){return g9("tengu_session_memory",!1)}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe('xP8');

      const patched = gate.patchFn(content, match);
      expect(patched).toContain('function xP8(){return!0}');
    });

    it('simple wrappers: should produce correct semanticReplacement', () => {
      for (const codename of ['workout-v2', 'keybinding-customization', 'session-memory']) {
        const gate = findPatchableGate(codename)!;
        const mockMatch = ['function Fn(){return g9("test",!1)}', 'Fn'] as unknown as RegExpMatchArray;
        expect(gate.semanticReplacement!(mockMatch)).toBe('function Fn(){return!0}');
      }
    });

    it('simple wrappers: should survive different minified names', () => {
      const gate = findPatchableGate('workout-v2')!;
      // Different minifier could use $$ or _$ or a$b
      for (const fnName of ['a', 'Z9', '_foo', '$bar', 'a$b']) {
        const content = `function ${fnName}(){return Xq("tengu_workout2",!1)}`;
        const match = content.match(gate.detectRegex);
        expect(match, `should match function name "${fnName}"`).not.toBeNull();
        expect(match![1]).toBe(fnName);
      }
    });
  });

  // ── Tier 2: Env-guarded wrapper regex + patchFn ──────────────────────

  describe('Tier 2: Env-guarded wrapper gates', () => {
    it('oboe: should match env-guarded pattern', () => {
      const gate = findPatchableGate('oboe')!;
      const content = 'function hq(){if(AR(process.env.CLAUDE_CODE_DISABLE_AUTO_MEMORY))return!1;return g9("tengu_oboe",!1)}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe('hq');

      const patched = gate.patchFn(content, match);
      expect(patched).toContain('function hq(){return!0}');
      expect(patched).toContain(`${GATE_PATCH_MARKER}:oboe`);
    });

    it('amber-flint: should match double-guarded pattern', () => {
      const gate = findPatchableGate('amber-flint')!;
      const content = 'function d9(){if(!AR(process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS))return!1;if(!g9("tengu_amber_flint",!0))return!1;return!0}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe('d9');

      const patched = gate.patchFn(content, match);
      expect(patched).toContain('function d9(){return!0}');
      expect(patched).toContain(`${GATE_PATCH_MARKER}:amber-flint`);
    });

    it('oboe: semanticReplacement should be return!0', () => {
      const gate = findPatchableGate('oboe')!;
      const mockMatch = ['full match', 'hq'] as unknown as RegExpMatchArray;
      expect(gate.semanticReplacement!(mockMatch)).toBe('function hq(){return!0}');
    });
  });

  // ── Tier 3: Complex wrapper regex + patchFn ──────────────────────────

  describe('Tier 3: Complex wrapper gates', () => {
    it('silver-lantern: should match multi-branch return pattern', () => {
      const gate = findPatchableGate('silver-lantern')!;
      const content = 'function v58(){if(!g9("tengu_silver_lantern",!1))return null;if(xA())return"promo";if(bQ())return"launch-only";return null}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe('v58');

      const patched = gate.patchFn(content, match);
      expect(patched).toContain('function v58(){return"promo"}');
      expect(patched).toContain(`${GATE_PATCH_MARKER}:silver-lantern`);
      expect(patched).not.toContain('return null');
    });

    it('silver-lantern: semanticReplacement should return promo', () => {
      const gate = findPatchableGate('silver-lantern')!;
      const mockMatch = ['full match', 'v58'] as unknown as RegExpMatchArray;
      expect(gate.semanticReplacement!(mockMatch)).toBe('function v58(){return"promo"}');
    });

    it('copper-lantern: should match function with nested braces', () => {
      const gate = findPatchableGate('copper-lantern')!;
      const content = 'function MgT(){var a=g9("tengu_copper_lantern",!1);if(!a){return!1}if(b()){return!1}return!0}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe('MgT');

      const patched = gate.patchFn(content, match);
      expect(patched).toContain('function MgT(){return!0}');
      expect(patched).toContain(`${GATE_PATCH_MARKER}:copper-lantern`);
    });

    it('copper-lantern: should match with 2 levels of brace nesting', () => {
      const gate = findPatchableGate('copper-lantern')!;
      const content = 'function MgT(){var a=g9("tengu_copper_lantern",!1);if(a){if(b()){return"ok"}}return!1}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe('MgT');
    });

    it('copper-lantern: should not match past the function boundary', () => {
      const gate = findPatchableGate('copper-lantern')!;
      const content = 'function MgT(){var a=g9("tengu_copper_lantern",!1);return!0}function Next(){return!1}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      // The match should end at the first function's closing brace, not include Next
      expect(match[0]).not.toContain('function Next');
    });
  });

  // ── Env var overrides ────────────────────────────────────────────────

  describe('env var overrides', () => {
    it('should have envOverride for env-guarded gates', () => {
      expect(findPatchableGate('oboe')?.envOverride).toBe('CLAUDE_CODE_DISABLE_AUTO_MEMORY');
      expect(findPatchableGate('amber-flint')?.envOverride).toBe('CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS');
    });

    it('should have envOverride for tier 4 detection-only gates', () => {
      expect(findGate('chomp-inflection')?.envOverride).toBe('CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION');
      expect(findGate('vinteuil-phrase')?.envOverride).toBe('CLAUDE_CODE_SIMPLE');
    });
  });

  // ── unpatchFn behavior ───────────────────────────────────────────────

  describe('unpatchFn', () => {
    it('should return content unchanged when marker not present', () => {
      const gate = findPatchableGate('workout-v2')!;
      const content = 'function Gt(){return g9("tengu_workout2",!1)}';
      expect(gate.unpatchFn(content)).toBe(content);
    });

    it('should return content unchanged when marker is present (backup required)', () => {
      const gate = findPatchableGate('workout-v2')!;
      const content = `function Gt(){return!0}/*${GATE_PATCH_MARKER}:workout-v2*/`;
      // unpatchFn can't restore without backup - returns content as-is
      expect(gate.unpatchFn(content)).toBe(content);
    });
  });
});
