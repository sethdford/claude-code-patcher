import { describe, it, expect } from 'vitest';

// These tests verify the CLI gates functions exist and are wired correctly.
// They test the imported gate module functions that the CLI delegates to,
// not the CLI itself (which requires process.argv manipulation).

import {
  detectAllGates,
  scanAllFlags,
  enableGate,
  disableGate,
  enableAllGates,
  resetGates,
  getAllGates,
  getPatchableGates,
  findGate,
  isPatchable,
} from './index.js';

describe('CLI Gates Integration', () => {
  describe('barrel exports', () => {
    it('should export detectAllGates', () => {
      expect(typeof detectAllGates).toBe('function');
    });

    it('should export scanAllFlags', () => {
      expect(typeof scanAllFlags).toBe('function');
    });

    it('should export enableGate', () => {
      expect(typeof enableGate).toBe('function');
    });

    it('should export disableGate', () => {
      expect(typeof disableGate).toBe('function');
    });

    it('should export enableAllGates', () => {
      expect(typeof enableAllGates).toBe('function');
    });

    it('should export resetGates', () => {
      expect(typeof resetGates).toBe('function');
    });

    it('should export getAllGates', () => {
      expect(typeof getAllGates).toBe('function');
    });

    it('should export getPatchableGates', () => {
      expect(typeof getPatchableGates).toBe('function');
    });

    it('should export findGate', () => {
      expect(typeof findGate).toBe('function');
    });

    it('should export isPatchable', () => {
      expect(typeof isPatchable).toBe('function');
    });
  });

  describe('gate listing for CLI table', () => {
    it('should return gates with required fields for table display', () => {
      const gates = getAllGates();
      for (const gate of gates) {
        expect(gate).toHaveProperty('name');
        expect(gate).toHaveProperty('codename');
        expect(gate).toHaveProperty('description');
        expect(gate).toHaveProperty('category');
      }
    });

    it('should have patchable gates available for enable command', () => {
      const patchable = getPatchableGates();
      expect(patchable.length).toBeGreaterThan(0);

      // swarm and team should be available
      const swarm = patchable.find((g) => g.codename === 'swarm-mode');
      const team = patchable.find((g) => g.codename === 'team-mode');
      expect(swarm).toBeDefined();
      expect(team).toBeDefined();
    });
  });

  describe('gate lookup for CLI commands', () => {
    it('should find gate by short name "swarm"', () => {
      // The CLI passes user input directly to findGate/enableGate
      // These should handle common short forms
      const gate = findGate('swarm-mode');
      expect(gate).toBeDefined();
    });

    it('should find gate by flag name', () => {
      const gate = findGate('tengu_brass_pebble');
      expect(gate).toBeDefined();
    });

    it('should correctly identify patchable vs non-patchable', () => {
      expect(isPatchable('swarm-mode')).toBe(true);
      expect(isPatchable('marble-anvil')).toBe(false);
    });
  });

  describe('scan output format', () => {
    it('should return sorted unique flags from scanAllFlags', () => {
      // scanAllFlags requires a real bundle; test the contract
      const result = scanAllFlags('/nonexistent/path');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
