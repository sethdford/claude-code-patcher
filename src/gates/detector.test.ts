import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import * as detector from "./detector.js";
import { GATE_PATCH_MARKER } from "./registry.js";
import { findCli } from "../cli-finder.js";

// Mock the cli-finder module
vi.mock("../cli-finder.js", () => ({
  findCli: vi.fn(() => ({
    path: "/mock/claude/cli.js",
    version: "2.1.63",
    isPatched: false,
  })),
}));

// Mock fs
vi.mock("fs", async () => {
  const actual = await vi.importActual("fs");
  return {
    ...actual,
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
  };
});

const MOCK_KEYBINDING_GATE = `function SZ(){return g9("tengu_keybinding_customization_release",!1)}`;
const MOCK_BUNDLE_WITH_GATES = `
var someCode=true;
${MOCK_KEYBINDING_GATE}
tengu_marble_anvil;tengu_coral_fern;tengu_flicker;
tengu_unknown_custom_flag;
`;

const MOCK_BUNDLE_PATCHED = `
var someCode=true;
function SZ(){return!0}/*${GATE_PATCH_MARKER}:keybinding-customization*/
tengu_marble_anvil;tengu_coral_fern;tengu_flicker;
`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("findJsBundle", () => {
  it("should return the path for .js files that exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const result = detector.findJsBundle("/mock/claude/cli.js");
    expect(result).toBe("/mock/claude/cli.js");
  });

  it("should return null for .js files that do not exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = detector.findJsBundle("/mock/claude/missing.js");
    expect(result).toBeNull();
  });

  it("should look for adjacent JS files for non-JS paths", () => {
    vi.mocked(fs.existsSync).mockReturnValueOnce(true); // cli.js exists
    const result = detector.findJsBundle("/mock/claude/claude");
    expect(result).toBe("/mock/claude/cli.js");
  });

  it("should return null when no adjacent JS files found", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const result = detector.findJsBundle("/mock/claude/claude");
    expect(result).toBeNull();
  });
});

describe("detectAllGates", () => {
  it("should detect known gates in bundle content", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_BUNDLE_WITH_GATES);

    const gates = detector.detectAllGates("/mock/claude/cli.js");
    expect(gates.length).toBeGreaterThan(0);

    const keybinding = gates.find(
      (g) => g.codename === "keybinding-customization",
    );
    expect(keybinding).toBeDefined();
    expect(keybinding?.detected).toBe(true);
    expect(keybinding?.enabled).toBe(false);
  });

  it("should detect patched gates as enabled", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_BUNDLE_PATCHED);

    const gates = detector.detectAllGates("/mock/claude/cli.js");
    const keybinding = gates.find(
      (g) => g.codename === "keybinding-customization",
    );
    expect(keybinding?.enabled).toBe(true);
  });

  it("should detect detection-only gates as present", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_BUNDLE_WITH_GATES);

    const gates = detector.detectAllGates("/mock/claude/cli.js");
    const marble = gates.find((g) => g.codename === "marble-anvil");
    expect(marble?.detected).toBe(true);
    expect(marble?.enabled).toBe(false);
  });

  it("should return empty array when CLI not found", () => {
    vi.mocked(findCli).mockReturnValueOnce(null);

    const gates = detector.detectAllGates();
    expect(gates).toEqual([]);
  });

  it("should return empty array when file read fails", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("EACCES");
    });

    const gates = detector.detectAllGates("/mock/claude/cli.js");
    expect(gates).toEqual([]);
  });
});

describe("detectGate", () => {
  it("should detect a specific gate by codename", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_BUNDLE_WITH_GATES);

    const gate = detector.detectGate(
      "keybinding-customization",
      "/mock/claude/cli.js",
    );
    expect(gate).toBeDefined();
    expect(gate?.detected).toBe(true);
    expect(gate?.enabled).toBe(false);
  });

  it("should detect a specific gate by flag name", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_BUNDLE_WITH_GATES);

    const gate = detector.detectGate(
      "tengu_keybinding_customization_release",
      "/mock/claude/cli.js",
    );
    expect(gate).toBeDefined();
    expect(gate?.name).toBe("tengu_keybinding_customization_release");
  });

  it("should return null for unknown gate", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_BUNDLE_WITH_GATES);

    const gate = detector.detectGate("nonexistent", "/mock/claude/cli.js");
    expect(gate).toBeNull();
  });

  it("should return null when CLI not found", () => {
    vi.mocked(findCli).mockReturnValueOnce(null);

    const gate = detector.detectGate("keybinding-customization");
    expect(gate).toBeNull();
  });
});

describe("scanAllFlags", () => {
  it("should find all tengu_* flags in the bundle", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_BUNDLE_WITH_GATES);

    const flags = detector.scanAllFlags("/mock/claude/cli.js");
    expect(flags).toContain("tengu_keybinding_customization_release");
    expect(flags).toContain("tengu_marble_anvil");
    expect(flags).toContain("tengu_coral_fern");
    expect(flags).toContain("tengu_flicker");
    expect(flags).toContain("tengu_unknown_custom_flag");
  });

  it("should return deduplicated sorted flags", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      "tengu_b;tengu_a;tengu_b;tengu_c",
    );

    const flags = detector.scanAllFlags("/mock/claude/cli.js");
    expect(flags).toEqual(["tengu_a", "tengu_b", "tengu_c"]);
  });

  it("should return empty array when no flags found", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("no flags here");

    const flags = detector.scanAllFlags("/mock/claude/cli.js");
    expect(flags).toEqual([]);
  });
});
