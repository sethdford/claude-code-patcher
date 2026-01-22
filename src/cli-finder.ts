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
 * Extract version from CLI if possible
 */
function getCliVersion(cliPath: string): string | undefined {
  try {
    const packageJsonPath = path.join(path.dirname(cliPath), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return pkg.version;
    }
  } catch {
    // Ignore errors
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
 * Get all possible CLI locations
 */
function getPossibleLocations(): string[] {
  const locations: string[] = [];
  const home = os.homedir();
  
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
  
  // Try to find via `which claude`
  try {
    const whichResult = execFileSync('which', ['claude'], {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    
    if (whichResult) {
      const realPath = fs.realpathSync(whichResult);
      
      // Common patterns for npm global installs
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
