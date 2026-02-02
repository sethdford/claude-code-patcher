import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import { enableGate, disableGate, enableAllGates, resetGates } from './patcher.js';
import { GATE_PATCH_MARKER } from './registry.js';
import { findCli } from '../cli-finder.js';

// Mock cli-finder
vi.mock('../cli-finder.js', () => ({
  findCli: vi.fn(() => ({ path: '/mock/claude/cli.js', version: '2.1.29', isPatched: false })),
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

const MOCK_SWARM_GATE_CONTENT = `var x=1;function qR(){if(kT(process.env.CLAUDE_CODE_AGENT_SWARMS))return!1;return mN("tengu_brass_pebble",!1)}var y=2;`;
const MOCK_TEAM_GATE_CONTENT = `var TodoWrite="TodoWrite";var z={isEnabled(){return!qR()}};`;
const MOCK_FULL_BUNDLE = MOCK_SWARM_GATE_CONTENT + MOCK_TEAM_GATE_CONTENT;

const MOCK_PATCHED_SWARM = `var x=1;function qR(){return!0}/*${GATE_PATCH_MARKER}:swarm-mode*/var y=2;` + MOCK_TEAM_GATE_CONTENT;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fs.existsSync).mockReturnValue(true);
});

describe('enableGate', () => {
  it('should patch the swarm gate', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableGate('swarm-mode', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged).toHaveLength(1);
    expect(result.gatesChanged[0].codename).toBe('swarm-mode');
    expect(result.gatesChanged[0].enabled).toBe(true);
  });

  it('should patch the team gate', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableGate('team-mode', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged).toHaveLength(1);
    expect(result.gatesChanged[0].codename).toBe('team-mode');
    expect(result.gatesChanged[0].enabled).toBe(true);
  });

  it('should create a backup before patching', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableGate('swarm-mode', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(true);
    expect(result.backupPath).toBeTruthy();
    expect(fs.copyFileSync).toHaveBeenCalledOnce();
  });

  it('should skip backup when backup is false', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = enableGate('swarm-mode', { cliPath: '/mock/claude/cli.js', backup: false });

    expect(result.success).toBe(true);
    expect(result.backupPath).toBeUndefined();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('should report already-enabled gates without re-patching', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_PATCHED_SWARM);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = enableGate('swarm-mode', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged[0].enabled).toBe(true);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('should fail for unknown gate', () => {
    const result = enableGate('nonexistent', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown or unpatchable');
  });

  it('should fail for detection-only gate', () => {
    const result = enableGate('marble-anvil', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown or unpatchable');
  });

  it('should fail when gate pattern not found in binary', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('no gates here');
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableGate('swarm-mode', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('should write patched content with marker', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    let writtenContent = '';
    vi.mocked(fs.writeFileSync).mockImplementation((_path, content) => {
      writtenContent = content as string;
    });

    enableGate('swarm-mode', { cliPath: '/mock/claude/cli.js' });

    expect(writtenContent).toContain(GATE_PATCH_MARKER);
    expect(writtenContent).toContain('return!0');
  });

  it('should restore backup if write fails', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});
    vi.mocked(fs.writeFileSync).mockImplementation(() => {
      throw new Error('EACCES');
    });

    const result = enableGate('swarm-mode', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(false);
    // copyFileSync called twice: once for backup, once for restore
    expect(fs.copyFileSync).toHaveBeenCalledTimes(2);
  });
});

describe('disableGate', () => {
  it('should report not-patched gate without changes', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);

    const result = disableGate('swarm-mode', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged[0].enabled).toBe(false);
  });

  it('should attempt to restore from backup for patched gate', () => {
    vi.mocked(fs.readFileSync).mockImplementation((path) => {
      if (String(path).includes('backup')) return MOCK_FULL_BUNDLE;
      return MOCK_PATCHED_SWARM;
    });
    vi.mocked(fs.readdirSync).mockReturnValue(['cli.js.backup.1706800000000'] as unknown as ReturnType<typeof fs.readdirSync>);
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = disableGate('swarm-mode', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged[0].enabled).toBe(false);
  });

  it('should fail for unknown gate', () => {
    const result = disableGate('nonexistent', { cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Unknown or unpatchable');
  });
});

describe('enableAllGates', () => {
  it('should enable all patchable gates', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = enableAllGates({ cliPath: '/mock/claude/cli.js' });

    expect(result.success).toBe(true);
    expect(result.gatesChanged.length).toBeGreaterThan(0);
    expect(result.backupPath).toBeTruthy();
  });

  it('should create a single backup for all gates', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(MOCK_FULL_BUNDLE);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    enableAllGates({ cliPath: '/mock/claude/cli.js' });

    // Only one backup created (one copyFileSync call)
    expect(fs.copyFileSync).toHaveBeenCalledOnce();
  });

  it('should fail when CLI not found', () => {
    vi.mocked(findCli).mockReturnValueOnce(null);

    const result = enableAllGates();

    expect(result.success).toBe(false);
  });
});

describe('resetGates', () => {
  it('should restore from the most recent backup', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([
      'cli.js.backup.1706800000000',
      'cli.js.backup.1706900000000',
    ] as unknown as ReturnType<typeof fs.readdirSync>);
    vi.mocked(fs.copyFileSync).mockImplementation(() => {});

    const result = resetGates('/mock/claude/cli.js');

    expect(result.success).toBe(true);
    expect(result.backupPath).toContain('1706900000000');
  });

  it('should fail when no backup exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    const result = resetGates('/mock/claude/cli.js');

    expect(result.success).toBe(false);
    expect(result.error).toContain('No backup found');
  });

  it('should fail when CLI not found', () => {
    vi.mocked(findCli).mockReturnValueOnce(null);

    const result = resetGates();

    expect(result.success).toBe(false);
  });
});
