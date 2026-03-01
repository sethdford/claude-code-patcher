import { describe, it, expect } from "vitest";
import {
  getAllGates,
  getPatchableGates,
  getLegacyGates,
  findGate,
  findPatchableGate,
  getGatesByCategory,
  isPatchable,
  GATE_PATCH_MARKER,
} from "./registry.js";

describe("Gate Registry", () => {
  describe("getAllGates", () => {
    it("should return all active gates (excludes legacy)", () => {
      const gates = getAllGates();
      expect(gates.length).toBeGreaterThan(0);
    });

    it("should include both patchable and detection-only gates", () => {
      const all = getAllGates();
      const patchable = getPatchableGates();
      expect(all.length).toBeGreaterThan(patchable.length);
    });

    it("should not include legacy gates", () => {
      const all = getAllGates();
      const legacy = getLegacyGates();
      for (const gate of legacy) {
        const found = all.find((g) => g.codename === gate.codename);
        expect(
          found,
          `legacy gate ${gate.codename} should not be in active gates`,
        ).toBeUndefined();
      }
    });

    it("should have valid regex patterns for all gates", () => {
      for (const gate of getAllGates()) {
        expect(gate.detectRegex).toBeInstanceOf(RegExp);
      }
    });

    it("should have non-empty name and codename for all gates", () => {
      for (const gate of getAllGates()) {
        expect(gate.name).toBeTruthy();
        expect(gate.codename).toBeTruthy();
      }
    });

    it("should have valid categories for all gates", () => {
      const validCategories = new Set(["feature", "experiment", "telemetry"]);
      for (const gate of getAllGates()) {
        expect(validCategories.has(gate.category)).toBe(true);
      }
    });
  });

  describe("getPatchableGates", () => {
    it("should return gates with real patch implementations", () => {
      const patchable = getPatchableGates();
      expect(patchable.length).toBeGreaterThan(0);
    });

    it("should have 9 patchable gates (v2.1.63)", () => {
      const patchable = getPatchableGates();
      expect(patchable.length).toBe(9);
    });

    it("should include keybinding-customization (unchanged from v2.1.37)", () => {
      const patchable = getPatchableGates();
      const gate = patchable.find(
        (g) => g.codename === "keybinding-customization",
      );
      expect(gate).toBeDefined();
    });

    it("should include amber-quartz (new in v2.1.63)", () => {
      const patchable = getPatchableGates();
      const gate = patchable.find((g) => g.codename === "amber-quartz");
      expect(gate).toBeDefined();
    });

    it("should include all tier 1 gates", () => {
      const patchable = getPatchableGates();
      expect(
        patchable.find((g) => g.codename === "keybinding-customization"),
      ).toBeDefined();
      expect(
        patchable.find((g) => g.codename === "amber-quartz"),
      ).toBeDefined();
      expect(patchable.find((g) => g.codename === "ccr-bridge")).toBeDefined();
      expect(
        patchable.find((g) => g.codename === "mcp-elicitation"),
      ).toBeDefined();
      expect(
        patchable.find((g) => g.codename === "immediate-model-command"),
      ).toBeDefined();
      expect(
        patchable.find((g) => g.codename === "pr-status-cli"),
      ).toBeDefined();
    });

    it("should include all tier 2 gates", () => {
      const patchable = getPatchableGates();
      expect(
        patchable.find((g) => g.codename === "session-memory"),
      ).toBeDefined();
      expect(patchable.find((g) => g.codename === "amber-flint")).toBeDefined();
      expect(
        patchable.find((g) => g.codename === "copper-bridge"),
      ).toBeDefined();
    });

    it("should not include legacy gates", () => {
      const patchable = getPatchableGates();
      expect(
        patchable.find((g) => g.codename === "swarm-mode"),
      ).toBeUndefined();
      expect(patchable.find((g) => g.codename === "team-mode")).toBeUndefined();
      expect(
        patchable.find((g) => g.codename === "workout-v2"),
      ).toBeUndefined();
      expect(patchable.find((g) => g.codename === "oboe")).toBeUndefined();
      expect(
        patchable.find((g) => g.codename === "silver-lantern"),
      ).toBeUndefined();
      expect(
        patchable.find((g) => g.codename === "copper-lantern"),
      ).toBeUndefined();
    });

    it("should have semanticReplacement for all patchable gates", () => {
      for (const gate of getPatchableGates()) {
        expect(gate.semanticReplacement).toBeDefined();
      }
    });
  });

  describe("getLegacyGates", () => {
    it("should return legacy gates", () => {
      const legacy = getLegacyGates();
      expect(legacy.length).toBe(6);
    });

    it("should include all fully rolled out gates", () => {
      const legacy = getLegacyGates();
      expect(legacy.find((g) => g.codename === "swarm-mode")).toBeDefined();
      expect(legacy.find((g) => g.codename === "team-mode")).toBeDefined();
      expect(legacy.find((g) => g.codename === "workout-v2")).toBeDefined();
      expect(legacy.find((g) => g.codename === "oboe")).toBeDefined();
      expect(legacy.find((g) => g.codename === "silver-lantern")).toBeDefined();
      expect(legacy.find((g) => g.codename === "copper-lantern")).toBeDefined();
    });
  });

  describe("findGate", () => {
    it("should find active gate by Statsig flag name", () => {
      const gate = findGate("tengu_keybinding_customization_release");
      expect(gate).toBeDefined();
      expect(gate?.name).toBe("tengu_keybinding_customization_release");
    });

    it("should find active gate by codename", () => {
      const gate = findGate("keybinding-customization");
      expect(gate).toBeDefined();
      expect(gate?.codename).toBe("keybinding-customization");
    });

    it("should find gate by short name with underscore conversion", () => {
      const gate = findGate("marble-anvil");
      expect(gate).toBeDefined();
      expect(gate?.name).toBe("tengu_marble_anvil");
    });

    it("should find new v2.1.63 gates by codename", () => {
      expect(findGate("amber-quartz")).toBeDefined();
      expect(findGate("copper-bridge")).toBeDefined();
      expect(findGate("bergotte-lantern")).toBeDefined();
      expect(findGate("crystal-beam")).toBeDefined();
      expect(findGate("swann-brevity")).toBeDefined();
      expect(findGate("ccr-bridge")).toBeDefined();
      expect(findGate("mcp-elicitation")).toBeDefined();
      expect(findGate("immediate-model-command")).toBeDefined();
      expect(findGate("pr-status-cli")).toBeDefined();
      expect(findGate("penguins-off")).toBeDefined();
      expect(findGate("tst-names-in-messages")).toBeDefined();
    });

    it("should find legacy gates as fallback", () => {
      const gate = findGate("swarm-mode");
      expect(gate).toBeDefined();
      expect(gate?.codename).toBe("swarm-mode");
    });

    it("should return undefined for unknown gate", () => {
      const gate = findGate("nonexistent_gate");
      expect(gate).toBeUndefined();
    });
  });

  describe("findPatchableGate", () => {
    it("should find patchable gate by codename", () => {
      const gate = findPatchableGate("keybinding-customization");
      expect(gate).toBeDefined();
    });

    it("should find new patchable gates", () => {
      expect(findPatchableGate("amber-quartz")).toBeDefined();
      expect(findPatchableGate("copper-bridge")).toBeDefined();
      expect(findPatchableGate("session-memory")).toBeDefined();
      expect(findPatchableGate("amber-flint")).toBeDefined();
      expect(findPatchableGate("keybinding-customization")).toBeDefined();
      expect(findPatchableGate("ccr-bridge")).toBeDefined();
      expect(findPatchableGate("mcp-elicitation")).toBeDefined();
      expect(findPatchableGate("immediate-model-command")).toBeDefined();
      expect(findPatchableGate("pr-status-cli")).toBeDefined();
    });

    it("should return undefined for legacy gates", () => {
      expect(findPatchableGate("swarm-mode")).toBeUndefined();
      expect(findPatchableGate("team-mode")).toBeUndefined();
      expect(findPatchableGate("oboe")).toBeUndefined();
    });

    it("should return undefined for detection-only gate", () => {
      const gate = findPatchableGate("marble-anvil");
      expect(gate).toBeUndefined();
    });

    it("should return undefined for tier 4/5 gates", () => {
      expect(findPatchableGate("chomp-inflection")).toBeUndefined();
      expect(findPatchableGate("speculation")).toBeUndefined();
      expect(findPatchableGate("thinkback")).toBeUndefined();
      expect(findPatchableGate("crystal-beam")).toBeUndefined();
    });
  });

  describe("getGatesByCategory", () => {
    it("should filter by feature category", () => {
      const features = getGatesByCategory("feature");
      expect(features.length).toBeGreaterThan(0);
      for (const gate of features) {
        expect(gate.category).toBe("feature");
      }
    });

    it("should filter by experiment category", () => {
      const experiments = getGatesByCategory("experiment");
      expect(experiments.length).toBeGreaterThan(0);
      for (const gate of experiments) {
        expect(gate.category).toBe("experiment");
      }
    });

    it("should return telemetry gates", () => {
      const telemetry = getGatesByCategory("telemetry");
      expect(telemetry.length).toBeGreaterThan(0);
      for (const gate of telemetry) {
        expect(gate.category).toBe("telemetry");
      }
    });
  });

  describe("isPatchable", () => {
    it("should return true for patchable gates", () => {
      expect(isPatchable("keybinding-customization")).toBe(true);
      expect(isPatchable("session-memory")).toBe(true);
      expect(isPatchable("amber-flint")).toBe(true);
      expect(isPatchable("amber-quartz")).toBe(true);
      expect(isPatchable("copper-bridge")).toBe(true);
      expect(isPatchable("ccr-bridge")).toBe(true);
      expect(isPatchable("mcp-elicitation")).toBe(true);
      expect(isPatchable("immediate-model-command")).toBe(true);
      expect(isPatchable("pr-status-cli")).toBe(true);
    });

    it("should return false for legacy gates", () => {
      expect(isPatchable("swarm-mode")).toBe(false);
      expect(isPatchable("team-mode")).toBe(false);
      expect(isPatchable("oboe")).toBe(false);
    });

    it("should return false for detection-only gates", () => {
      expect(isPatchable("marble-anvil")).toBe(false);
      expect(isPatchable("chomp-inflection")).toBe(false);
      expect(isPatchable("speculation")).toBe(false);
    });

    it("should return false for unknown gates", () => {
      expect(isPatchable("nonexistent")).toBe(false);
    });
  });

  describe("GATE_PATCH_MARKER", () => {
    it("should be a non-empty string", () => {
      expect(GATE_PATCH_MARKER).toBeTruthy();
      expect(typeof GATE_PATCH_MARKER).toBe("string");
    });
  });

  // ── Tier 1: Simple wrapper regex + patchFn ───────────────────────────

  describe("Tier 1: Simple wrapper gates", () => {
    it("keybinding-customization: should match and patch simple wrapper", () => {
      const gate = findPatchableGate("keybinding-customization")!;
      const content =
        'function SZ(){return g9("tengu_keybinding_customization_release",!1)}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("SZ");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain("function SZ(){return!0}");
      expect(patched).toContain(
        `${GATE_PATCH_MARKER}:keybinding-customization`,
      );
    });

    it("amber-quartz: should match and patch simple wrapper", () => {
      const gate = findPatchableGate("amber-quartz")!;
      const content =
        'prefix;function KbR(){return W9("tengu_amber_quartz",!1)}suffix';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("KbR");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain("function KbR(){return!0}");
      expect(patched).toContain(`${GATE_PATCH_MARKER}:amber-quartz`);
      expect(patched).toContain("prefix;");
      expect(patched).toContain("suffix");
    });

    it("ccr-bridge: should match and patch simple wrapper", () => {
      const gate = findPatchableGate("ccr-bridge")!;
      const content = 'function Ai(){return W9("tengu_ccr_bridge",!1)}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("Ai");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain("function Ai(){return!0}");
      expect(patched).toContain(`${GATE_PATCH_MARKER}:ccr-bridge`);
    });

    it("mcp-elicitation: should match and patch simple wrapper", () => {
      const gate = findPatchableGate("mcp-elicitation")!;
      const content = 'function Hp(){return W9("tengu_mcp_elicitation",!1)}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("Hp");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain("function Hp(){return!0}");
      expect(patched).toContain(`${GATE_PATCH_MARKER}:mcp-elicitation`);
    });

    it("immediate-model-command: should match and patch simple wrapper", () => {
      const gate = findPatchableGate("immediate-model-command")!;
      const content =
        'function PjR(){return W9("tengu_immediate_model_command",!1)}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("PjR");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain("function PjR(){return!0}");
      expect(patched).toContain(`${GATE_PATCH_MARKER}:immediate-model-command`);
    });

    it("pr-status-cli: should match and patch simple wrapper", () => {
      const gate = findPatchableGate("pr-status-cli")!;
      const content = 'function x50(){return W9("tengu_pr_status_cli",!1)}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("x50");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain("function x50(){return!0}");
      expect(patched).toContain(`${GATE_PATCH_MARKER}:pr-status-cli`);
    });

    it("simple wrappers: should produce correct semanticReplacement", () => {
      for (const codename of [
        "keybinding-customization",
        "amber-quartz",
        "ccr-bridge",
        "mcp-elicitation",
        "immediate-model-command",
        "pr-status-cli",
      ]) {
        const gate = findPatchableGate(codename)!;
        const mockMatch = [
          'function Fn(){return g9("test",!1)}',
          "Fn",
        ] as unknown as RegExpMatchArray;
        expect(gate.semanticReplacement!(mockMatch)).toBe(
          "function Fn(){return!0}",
        );
      }
    });

    it("simple wrappers: should survive different minified names", () => {
      const gate = findPatchableGate("amber-quartz")!;
      for (const fnName of ["a", "Z9", "_foo", "$bar", "a$b"]) {
        const content = `function ${fnName}(){return Xq("tengu_amber_quartz",!1)}`;
        const match = content.match(gate.detectRegex);
        expect(match, `should match function name "${fnName}"`).not.toBeNull();
        expect(match![1]).toBe(fnName);
      }
    });
  });

  // ── Tier 2: Env-guarded / multi-check wrapper regex + patchFn ───────

  describe("Tier 2: Env-guarded / multi-check wrapper gates", () => {
    it("session-memory: should match v2.1.63 combined pattern", () => {
      const gate = findPatchableGate("session-memory")!;
      const content =
        'function $IR(){if(TR(process.env.ENABLE_CLAUDE_CODE_SM_COMPACT))return!0;if(TR(process.env.DISABLE_CLAUDE_CODE_SM_COMPACT))return!1;let T=W9("tengu_session_memory",!1),R=W9("tengu_sm_compact",!1);return T&&R}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("$IR");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain("function $IR(){return!0}");
      expect(patched).toContain(`${GATE_PATCH_MARKER}:session-memory`);
    });

    it("session-memory: should have ENABLE_CLAUDE_CODE_SM_COMPACT envOverride", () => {
      const gate = findPatchableGate("session-memory")!;
      expect(gate.envOverride).toBe("ENABLE_CLAUDE_CODE_SM_COMPACT");
    });

    it("amber-flint: should match v2.1.63 pattern with argv check", () => {
      const gate = findPatchableGate("amber-flint")!;
      const content =
        'function q_(){if(!TR(process.env.CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS)&&!JR7())return!1;if(!W9("tengu_amber_flint",!0))return!1;return!0}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("q_");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain("function q_(){return!0}");
      expect(patched).toContain(`${GATE_PATCH_MARKER}:amber-flint`);
    });

    it("amber-flint: semanticReplacement should be return!0", () => {
      const gate = findPatchableGate("amber-flint")!;
      const mockMatch = ["full match", "q_"] as unknown as RegExpMatchArray;
      expect(gate.semanticReplacement!(mockMatch)).toBe(
        "function q_(){return!0}",
      );
    });

    it("copper-bridge: should match gate guard pattern", () => {
      const gate = findPatchableGate("copper-bridge")!;
      const content =
        'function kx8(){if(!W9("tengu_copper_bridge",!1))return;let url="wss://bridge.example.com";return url}';
      const match = content.match(gate.detectRegex)!;
      expect(match).not.toBeNull();
      expect(match[1]).toBe("kx8");

      const patched = gate.patchFn(content, match);
      expect(patched).toContain(`${GATE_PATCH_MARKER}:copper-bridge`);
      // Should NOT contain the gate guard anymore
      expect(patched).not.toContain("tengu_copper_bridge");
      // Should still contain the URL return
      expect(patched).toContain("wss://bridge.example.com");
    });

    it("copper-bridge: semanticReplacement should be function start only", () => {
      const gate = findPatchableGate("copper-bridge")!;
      const mockMatch = ["full match", "kx8"] as unknown as RegExpMatchArray;
      expect(gate.semanticReplacement!(mockMatch)).toBe("function kx8(){");
    });
  });

  // ── New detection-only gates ────────────────────────────────────────

  describe("new v2.1.63 detection-only gates", () => {
    it("should include all 13 detection-only gates added in v2.1.63", () => {
      const newGates = [
        "bergotte-lantern",
        "crystal-beam",
        "marble-sandcastle",
        "moth-copse",
        "mulberry-fog",
        "slate-nexus",
        "slate-ridge",
        "swann-brevity",
        "coral-whistle",
        "pebble-leaf-prune",
        "amber-prism",
        "penguins-off",
        "tst-names-in-messages",
      ];
      for (const codename of newGates) {
        expect(findGate(codename), `${codename} should be found`).toBeDefined();
      }
    });

    it("should not be patchable", () => {
      const newGates = [
        "bergotte-lantern",
        "crystal-beam",
        "marble-sandcastle",
        "moth-copse",
        "mulberry-fog",
        "slate-nexus",
        "slate-ridge",
        "swann-brevity",
        "coral-whistle",
        "pebble-leaf-prune",
        "amber-prism",
        "penguins-off",
        "tst-names-in-messages",
      ];
      for (const codename of newGates) {
        expect(
          isPatchable(codename),
          `${codename} should not be patchable`,
        ).toBe(false);
      }
    });
  });

  // ── Removed gates (no longer in binary) ─────────────────────────────

  describe("removed gates", () => {
    it("should not include vinteuil-phrase in active gates", () => {
      const all = getAllGates();
      expect(all.find((g) => g.codename === "vinteuil-phrase")).toBeUndefined();
    });

    it("should not include marble-kite in active gates", () => {
      const all = getAllGates();
      expect(all.find((g) => g.codename === "marble-kite")).toBeUndefined();
    });

    it("should not include plank-river-frost in active gates", () => {
      const all = getAllGates();
      expect(
        all.find((g) => g.codename === "plank-river-frost"),
      ).toBeUndefined();
    });

    it("should not include workout in active gates", () => {
      const all = getAllGates();
      expect(all.find((g) => g.codename === "workout")).toBeUndefined();
    });
  });

  // ── Env var overrides ────────────────────────────────────────────────

  describe("env var overrides", () => {
    it("should have envOverride for env-guarded gates", () => {
      expect(findPatchableGate("session-memory")?.envOverride).toBe(
        "ENABLE_CLAUDE_CODE_SM_COMPACT",
      );
      expect(findPatchableGate("amber-flint")?.envOverride).toBe(
        "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS",
      );
    });

    it("should have envOverride for tier 4 detection-only gates", () => {
      expect(findGate("chomp-inflection")?.envOverride).toBe(
        "CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION",
      );
    });
  });

  // ── unpatchFn behavior ───────────────────────────────────────────────

  describe("unpatchFn", () => {
    it("should return content unchanged when marker not present", () => {
      const gate = findPatchableGate("keybinding-customization")!;
      const content =
        'function SZ(){return g9("tengu_keybinding_customization_release",!1)}';
      expect(gate.unpatchFn(content)).toBe(content);
    });

    it("should return content unchanged when marker is present (backup required)", () => {
      const gate = findPatchableGate("keybinding-customization")!;
      const content = `function SZ(){return!0}/*${GATE_PATCH_MARKER}:keybinding-customization*/`;
      // unpatchFn can't restore without backup - returns content as-is
      expect(gate.unpatchFn(content)).toBe(content);
    });
  });
});
