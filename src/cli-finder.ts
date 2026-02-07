/**
 * Claude Code CLI Finder
 * 
 * Locates the Claude Code CLI installation across different
 * installation methods (npm global, local, npx, homebrew, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFileSync } from 'child_process';
import type { CliLocation } from './types.js';

const PATCHER_MARKER = 'CLAUDE-CODE-PATCHER CUSTOM TOOLS';

/**
 * Check if a CLI file exists and is readable
 */
function isValidCli(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract version from CLI if possible.
 * For npm installs, reads package.json.
 * For native binaries, the version is encoded in the filename
 * (e.g. ~/.local/share/claude/versions/2.1.34).
 */
function getCliVersion(cliPath: string): string | undefined {
  // Check package.json (npm installs)
  try {
    const packageJsonPath = path.join(path.dirname(cliPath), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return pkg.version;
    }
  } catch {
    // Ignore errors
  }

  // For native binaries: version is the filename under .../versions/X.Y.Z
  const basename = path.basename(cliPath);
  if (/^\d+\.\d+\.\d+/.test(basename)) {
    return basename;
  }

  // For symlinks pointing into versions dir, resolve and check
  try {
    const real = fs.realpathSync(cliPath);
    const realBase = path.basename(real);
    if (/^\d+\.\d+\.\d+/.test(realBase)) {
      return realBase;
    }
  } catch {
    // Ignore
  }

  return undefined;
}

/**
 * Check if CLI is already patched
 */
function isPatched(cliPath: string): boolean {
  try {
    const content = fs.readFileSync(cliPath, 'utf8');
    return content.includes(PATCHER_MARKER);
  } catch {
    return false;
  }
}

/**
 * Get all possible CLI locations.
 *
 * Native binary installs (e.g. ~/.local/bin/claude) are checked FIRST so the
 * actively-used installation takes priority over stale npm installs that may
 * linger in ~/node_modules.
 */
function getPossibleLocations(): string[] {
  const locations: string[] = [];
  const home = os.homedir();

  // ── Native binary install (highest priority) ────────────────────────
  // The official installer puts binaries here; `which claude` resolves here.
  // These are checked first so the active binary wins over stale npm installs.
  try {
    const whichResult = execFileSync('which', ['claude'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();

    if (whichResult) {
      const realPath = fs.realpathSync(whichResult);
      // Add the actual binary/symlink path first
      locations.push(realPath);
      if (realPath !== whichResult) {
        locations.push(whichResult);
      }

      // Also try npm-style paths derived from which result
      const possiblePaths = [
        realPath.replace(/\/bin\/claude$/, '/lib/node_modules/@anthropic-ai/claude-code/cli.js'),
        path.join(path.dirname(realPath), '..', 'lib', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js'),
        path.join(path.dirname(realPath), '..', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
      ];
      locations.push(...possiblePaths);
    }
  } catch {
    // which command failed, continue
  }

  // Standard native binary locations
  locations.push(path.join(home, '.local', 'bin', 'claude'));

  // Check ~/.local/share/claude/versions/ for versioned binaries
  const versionsDir = path.join(home, '.local', 'share', 'claude', 'versions');
  if (fs.existsSync(versionsDir)) {
    try {
      const versions = fs.readdirSync(versionsDir)
        .filter((v) => /^\d+\.\d+/.test(v))
        .sort()
        .reverse(); // newest first
      for (const v of versions) {
        locations.push(path.join(versionsDir, v));
      }
    } catch {
      // Ignore errors reading versions dir
    }
  }

  // ── npm installs ────────────────────────────────────────────────────
  // Current working directory node_modules
  locations.push(
    path.join(process.cwd(), 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
  );

  // Home directory node_modules
  locations.push(
    path.join(home, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
  );

  // Global npm locations
  locations.push(
    '/usr/local/lib/node_modules/@anthropic-ai/claude-code/cli.js',
    '/usr/lib/node_modules/@anthropic-ai/claude-code/cli.js',
    '/opt/homebrew/lib/node_modules/@anthropic-ai/claude-code/cli.js'
  );

  // Windows global npm
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    locations.push(
      path.join(appData, 'npm', 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
    );
  }

  // Check npx cache
  const npxPath = path.join(home, '.npm', '_npx');
  if (fs.existsSync(npxPath)) {
    try {
      const dirs = fs.readdirSync(npxPath);
      for (const dir of dirs) {
        locations.push(
          path.join(npxPath, dir, 'node_modules', '@anthropic-ai', 'claude-code', 'cli.js')
        );
      }
    } catch {
      // Ignore errors reading npx cache
    }
  }

  return locations;
}

/**
 * Find the Claude Code CLI
 */
export function findCli(): CliLocation | null {
  const locations = getPossibleLocations();
  
  for (const loc of locations) {
    if (isValidCli(loc)) {
      return {
        path: loc,
        version: getCliVersion(loc),
        isPatched: isPatched(loc)
      };
    }
  }
  
  return null;
}

/**
 * Find all Claude Code CLI installations
 */
export function findAllClis(): CliLocation[] {
  const locations = getPossibleLocations();
  const found: CliLocation[] = [];
  const seen = new Set<string>();
  
  for (const loc of locations) {
    if (isValidCli(loc)) {
      // Resolve to real path to avoid duplicates
      const realPath = fs.realpathSync(loc);
      if (!seen.has(realPath)) {
        seen.add(realPath);
        found.push({
          path: realPath,
          version: getCliVersion(realPath),
          isPatched: isPatched(realPath)
        });
      }
    }
  }
  
  return found;
}

/**
 * Validate a specific CLI path
 */
export function validateCliPath(cliPath: string): CliLocation | null {
  if (!isValidCli(cliPath)) {
    return null;
  }
  
  return {
    path: cliPath,
    version: getCliVersion(cliPath),
    isPatched: isPatched(cliPath)
  };
}
