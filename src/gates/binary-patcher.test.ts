import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import {
  createPaddedReplacement,
  patchBinaryGate,
  isBinaryPatched,
  enableBinaryGate,
  enableAllBinaryGates,
  BINARY_PATCH_MARKER,
} from './binary-patcher.js';
import { GATE_PATCH_MARKER } from './registry.js';
import type { FeatureGate } from '../types.js';

// Mock cli-finder
vi.mock('../cli-finder.js', () => ({
  findCli: vi.fn(() => ({ path: '/mock/claude/claude', version: '2.1.29', isPatched: false })),
}));

// Mock fs
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    copyFileSync: vi.fn(),
    readdirSync: vi.fn(() => []),
  };
});

/**
 * Mock existsSync to simulate a native binary install:
 * adjacent .js/.mjs files don't exist, only the binary itself does.
 * This forces resolveBundle to take the binary path.
 */
function mockNativeBinaryExists(): void {
  vi.mocked(fs.existsSync).mockImplementation((p) => {
    const pathStr = String(p);
    if (pathStr.endsWith('.js') || pathStr.endsWith('.mjs') || pathStr.endsWith('.cjs')) return false;
    return true;
  });
}

/**
 * Mock readFileSync to be encoding-aware:
 * - With encoding (string param): return content as string (used by resolveBundle)
 * - Without encoding: return content as Buffer (used by enableBinaryGate)
 */
function mockBinaryReadFileSync(content: string): void {
  vi.mocked(fs.readFileSync).mockImplementation((_path: unknown, options?: unknown) => {
    if (typeof options === 'string' || (options && typeof options === 'object' && 'encoding' in options)) {
      return content;
    }
    return Buffer.from(content, 'latin1');
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createPaddedReplacement', () => {
  it('should return replacement unchanged when lengths match exactly', () => {
    const original = 'function foo(){return!1}';
    const replacement = 'function foo(){return!0}';
    const result = createPaddedReplacement(original, replacement, 'test-gate');

    expect(result).toBe(replacement);
    expect(Buffer.byteLength(result, 'latin1')).toBe(Buffer.byteLength(original, 'latin1'));
  });

  it('should pad with full marker when there is enough room', () => {
    // Original is much longer than replacement
    const original = 'function qR(){if(kT(process.env.CLAUDE_CODE_AGENT_SWARMS))return!1;return mN("tengu_brass_pebble",!1)}';
    const replacement = 'function qR(){return!0}';
    const result = createPaddedReplacement(original, replacement, 'swarm-mode');

    expect(Buffer.byteLength(result, 'latin1')).toBe(Buffer.byteLength(original, 'latin1'));
    expect(result).toContain(`/*${BINARY_PATCH_MARKER}:swarm-mode`);
    expect(result).toContain('*/');
    expect(result.startsWith(replacement)).toBe(true);
  });

  it('should pad with short marker when full marker does not fit', () => {
    // Make the gap just large enough for short marker but not full
    const shortMarkerLen = Buffer.byteLength(`/*${BINARY_PATCH_MARKER}*/`, 'latin1');
    const replacement = 'x';
    // Full marker: /*CCP:very-long-gate-name*/ = much longer
    // Short marker: /*CCP*/ = 7 bytes
    const original = replacement + 'A'.repeat(shortMarkerLen);

    const result = createPaddedReplacement(original, replacement, 'very-long-gate-name-that-makes-full-marker-too-long');

    expect(Buffer.byteLength(result, 'latin1')).toBe(Buffer.byteLength(original, 'latin1'));
    expect(result).toContain(`/*${BINARY_PATCH_MARKER}`);
    expect(result).toContain('*/');
  });

  it('should fall back to space padding when neither marker fits', () => {
    const original = 'abc';
    const replacement = 'a';
    const result = createPaddedReplacement(original, replacement, 'test');

    expect(Buffer.byteLength(result, 'latin1')).toBe(Buffer.byteLength(original, 'latin1'));
    expect(result).toBe('a  ');
  });

  it('should throw when replacement is longer than original', () => {
    expect(() => {
      createPaddedReplacement('ab', 'abcdef', 'test');
    }).toThrow('bytes longer than original');
  });

  it('should handle zero-gap correctly', () => {
    const text = 'exactly_same';
    const result = createPaddedReplacement(text, text, 'gate');

    expect(result).toBe(text);
  });

  it('should produce valid JS when padding with full marker', () => {
    const original = 'function qR(){return!1;/* some old comment */}';
    const replacement = 'function qR(){return!0}';
    const result = createPaddedReplacement(original, replacement, 'test-gate');

    // The result should be parseable JS (replacement + block comment)
    expect(result).toMatch(/^function qR\(\)\{return!0\}\/\*CCP/);
    expect(result).toMatch(/\*\/$/);
  });
});

describe('patchBinaryGate', () => {
  const makeGate = (overrides?: Partial<FeatureGate>): FeatureGate => ({
    name: 'tengu_test',
    codename: 'test-gate',
    description: 'Test gate',
    category: 'feature',
    detectRegex: /function\s+(\w+)\(\)\{return!1\}/,
    patchFn: (c: string) => c,
    unpatchFn: (c: string) => c,
    semanticReplacement: (match: RegExpMatchArray) => `function ${match[1]}(){return!0}`,
    ...overrides,
  });

  it('should patch the gate in the buffer at the correct offset', () => {
    const content = 'prefix;function qR(){return!1}suffix;';
    const buf = Buffer.from(content, 'latin1');
    const gate = makeGate();

    const { buf: patched, changed } = patchBinaryGate(buf, content, gate);

    expect(changed).toBe(true);
    const patchedContent = patched.toString('latin1');
    expect(patchedContent).toContain('function qR(){return!0}');
    // Surrounding bytes must be preserved
    expect(patchedContent.startsWith('prefix;')).toBe(true);
    expect(patchedContent.endsWith('suffix;')).toBe(true);
    // Total length must be unchanged
    expect(patched.length).toBe(buf.length);
  });

  it('should return changed=false when gate has no semanticReplacement', () => {
    const content = 'function qR(){return!1}';
    const buf = Buffer.from(content, 'latin1');
    const gate = makeGate({ semanticReplacement: undefined });

    const { changed } = patchBinaryGate(buf, content, gate);

    expect(changed).toBe(false);
  });

  it('should return changed=false when regex does not match', () => {
    const content = 'no gates here';
    const buf = Buffer.from(content, 'latin1');
    const gate = makeGate();

    const { changed } = patchBinaryGate(buf, content, gate);

    expect(changed).toBe(false);
  });

  it('should mutate the buffer in place', () => {
    const content = 'function qR(){return!1}';
    const buf = Buffer.from(content, 'latin1');
    const gate = makeGate();

    const { buf: patched } = patchBinaryGate(buf, content, gate);

    // Should be the same buffer reference
    expect(patched).toBe(buf);
  });

  it('should pad replacement to match original byte length', () => {
    // Longer original with env check
    const content = 'function qR(){if(check())return!1;return foo("tengu_test",!1)}';
    const buf = Buffer.from(content, 'latin1');
    const gate = makeGate({
      detectRegex: /function\s+(\w+)\(\)\{if\(check\(\)\)return!1;return foo\("tengu_test",!1\)\}/,
    });

    const { buf: patched, changed } = patchBinaryGate(buf, content, gate);

    expect(changed).toBe(true);
    // Buffer length must not change
    expect(patched.length).toBe(Buffer.byteLength(content, 'latin1'));
  });
});

describe('isBinaryPatched', () => {
  it('should detect JS patch marker', () => {
    const content = `some code/*${GATE_PATCH_MARKER}:swarm-mode*/more code`;
    expect(isBinaryPatched(content, 'swarm-mode')).toBe(true);
  });

  it('should detect binary patch marker', () => {
    const content = `function qR(){return!0}/*${BINARY_PATCH_MARKER}:swarm-mode*/`;
    expect(isBinaryPatched(content, 'swarm-mode')).toBe(true);
  });

  it('should return false when no marker is present', () => {
    const content = 'function qR(){return!1}';
    expect(isBinaryPatched(content, 'swarm-mode')).toBe(false);
  });

  it('should not match wrong codename', () => {
    const content = `/*${BINARY_PATCH_MARKER}:team-mode*/`;
    expect(isBinaryPatched(content, 'swarm-mode')).toBe(false);
  });
});

describe('enableBinaryGate', () => {
  // Mock content that mimics a native binary with embedded JS (read as latin1)
  const MOCK_SWARM_GATE =
    'function qR(){if(kT(process.env.CLAUDE_CODE_AGENT_SWARMS))return!1;return mN("tengu_brass_pebble",!1)}';
  const MOCK_BINARY_CONTENT = `\x00\x00BINARY_HEADER${MOCK_SWARM_GATE}MORE_BINARY_DATA\x00`;

  it('should patch gate in native binary', () => {
    mockNativeBinaryExists();
    mockBinaryReadFileSync(MOCK_BINARY_CONTENT);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableBinaryGate('swarm-mode', { cliPath: '/mock/claude/claude' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged).toHaveLength(1);
    expect(result.gatesChanged[0].codename).toBe('swarm-mode');
    expect(result.gatesChanged[0].enabled).toBe(true);
  });

  it('should create backup before patching binary', () => {
    mockNativeBinaryExists();
    mockBinaryReadFileSync(MOCK_BINARY_CONTENT);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableBinaryGate('swarm-mode', { cliPath: '/mock/claude/claude' });

    expect(result.success).toBe(true);
    expect(result.backupPath).toBeTruthy();
    expect(fs.copyFileSync).toHaveBeenCalledOnce();
  });

  it('should skip backup when backup is false', () => {
    mockNativeBinaryExists();
    mockBinaryReadFileSync(MOCK_BINARY_CONTENT);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = enableBinaryGate('swarm-mode', { cliPath: '/mock/claude/claude', backup: false });

    expect(result.success).toBe(true);
    expect(result.backupPath).toBeUndefined();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('should report already-patched binary gates without re-patching', () => {
    const contentWithMarker = `\x00binary${BINARY_PATCH_MARKER}:swarm-mode more data\x00`;
    mockNativeBinaryExists();
    mockBinaryReadFileSync(contentWithMarker);

    const result = enableBinaryGate('swarm-mode', { cliPath: '/mock/claude/claude' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged[0].enabled).toBe(true);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('should fail for unknown gate', () => {
    const result = enableBinaryGate('nonexistent', { cliPath: '/mock/claude/claude' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown or unpatchable');
  });

  it('should fail when gate pattern not found in binary', () => {
    mockNativeBinaryExists();
    mockBinaryReadFileSync('no gates here');
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableBinaryGate('swarm-mode', { cliPath: '/mock/claude/claude' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('should write Buffer (not string) when patching binary', () => {
    mockNativeBinaryExists();
    mockBinaryReadFileSync(MOCK_BINARY_CONTENT);
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    let writtenData: unknown;
    vi.mocked(fs.writeFileSync).mockImplementation((_path, data) => {
      writtenData = data;
    });

    enableBinaryGate('swarm-mode', { cliPath: '/mock/claude/claude' });

    expect(Buffer.isBuffer(writtenData)).toBe(true);
  });

  it('should preserve binary length after patching', () => {
    mockNativeBinaryExists();
    const originalBuf = Buffer.from(MOCK_BINARY_CONTENT, 'latin1');
    mockBinaryReadFileSync(MOCK_BINARY_CONTENT);
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    let writtenData: Buffer | undefined;
    vi.mocked(fs.writeFileSync).mockImplementation((_path, data) => {
      writtenData = data as Buffer;
    });

    enableBinaryGate('swarm-mode', { cliPath: '/mock/claude/claude' });

    expect(writtenData).toBeDefined();
    expect(writtenData!.length).toBe(originalBuf.length);
  });
});

describe('enableAllBinaryGates', () => {
  const MOCK_SWARM_GATE =
    'function qR(){if(kT(process.env.CLAUDE_CODE_AGENT_SWARMS))return!1;return mN("tengu_brass_pebble",!1)}';
  const MOCK_TEAM_GATE = 'isEnabled(){return!qR()}';
  const MOCK_BINARY_CONTENT = `\x00HEADER${MOCK_SWARM_GATE}middle${MOCK_TEAM_GATE}FOOTER\x00`;

  it('should enable all patchable gates in binary', () => {
    mockNativeBinaryExists();
    mockBinaryReadFileSync(MOCK_BINARY_CONTENT);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableAllBinaryGates({ cliPath: '/mock/claude/claude' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged.length).toBeGreaterThan(0);
  });

  it('should create single backup for all gates', () => {
    mockNativeBinaryExists();
    mockBinaryReadFileSync(MOCK_BINARY_CONTENT);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    enableAllBinaryGates({ cliPath: '/mock/claude/claude' });

    expect(fs.copyFileSync).toHaveBeenCalledOnce();
  });

  it('should preserve total binary size after patching all gates', () => {
    mockNativeBinaryExists();
    const originalLen = Buffer.byteLength(MOCK_BINARY_CONTENT, 'latin1');
    mockBinaryReadFileSync(MOCK_BINARY_CONTENT);
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    let writtenData: Buffer | undefined;
    vi.mocked(fs.writeFileSync).mockImplementation((_path, data) => {
      writtenData = data as Buffer;
    });

    enableAllBinaryGates({ cliPath: '/mock/claude/claude' });

    expect(writtenData).toBeDefined();
    expect(writtenData!.length).toBe(originalLen);
  });
});
