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

    it('should return undefined for detection-only gate', () => {
      const gate = findPatchableGate('marble-anvil');
      expect(gate).toBeUndefined();
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

    it('should return empty array for category with no gates', () => {
      const telemetry = getGatesByCategory('telemetry');
      expect(telemetry).toEqual([]);
    });
  });

  describe('isPatchable', () => {
    it('should return true for patchable gates', () => {
      expect(isPatchable('swarm-mode')).toBe(true);
      expect(isPatchable('team-mode')).toBe(true);
    });

    it('should return false for detection-only gates', () => {
      expect(isPatchable('marble-anvil')).toBe(false);
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
});
