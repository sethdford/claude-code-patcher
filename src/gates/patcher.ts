/**
 * Feature Gate Patcher
 *
 * Core logic for enabling/disabling feature gates in the Claude Code
 * JS bundle. Uses the same backup strategy as the tool-injection patcher
 * but with a distinct marker for gate patches.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { GateResult, GateStatus, GatePatchConfig } from '../types.js';
import { findPatchableGate, getPatchableGates, GATE_PATCH_MARKER, BINARY_PATCH_MARKER } from './registry.js';
import { resolveBundle as resolveBundleFromDetector } from './detector.js';
import { enableBinaryGate, enableAllBinaryGates } from './binary-patcher.js';

/**
 * Create a timestamped backup of the bundle
 */
function createBackup(bundlePath: string): string | null {
  const backupPath = `${bundlePath}.backup.${Date.now()}`;
  try {
    fs.copyFileSync(bundlePath, backupPath);
    return backupPath;
  } catch {
    return null;
  }
}

/**
 * Write patched content back to the bundle
 */
function writeBundle(bundlePath: string, content: string): boolean {
  try {
    fs.writeFileSync(bundlePath, content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Enable a single feature gate by name or codename.
 *
 * Supported names: 'swarm', 'swarm-mode', 'tengu_brass_pebble',
 * 'team', 'team-mode', etc.
 */
export function enableGate(nameOrCodename: string, config?: GatePatchConfig): GateResult {
  const gate = findPatchableGate(nameOrCodename);
  if (!gate) {
    return {
      success: false,
      error: `Unknown or unpatchable gate: "${nameOrCodename}". Use "gates" to list available gates.`,
      gatesChanged: [],
    };
  }

  const bundle = resolveBundleFromDetector(config?.cliPath);
  if (!bundle) {
    return {
      success: false,
      error: 'Could not find Claude Code CLI. Install with: npm install -g @anthropic-ai/claude-code',
      gatesChanged: [],
    };
  }

  // Route to binary patcher for native binaries
  if (bundle.isBinary) {
    return enableBinaryGate(nameOrCodename, config);
  }

  // Check if already patched (JS or binary marker)
  if (
    bundle.content.includes(`${GATE_PATCH_MARKER}:${gate.codename}`) ||
    bundle.content.includes(`${BINARY_PATCH_MARKER}:${gate.codename}`)
  ) {
    return {
      success: true,
      gatesChanged: [
        {
          name: gate.name,
          codename: gate.codename,
          detected: true,
          enabled: true,
          envOverride: gate.envOverride,
        },
      ],
    };
  }

  // Detect the gate pattern
  const match = bundle.content.match(gate.detectRegex);
  if (!match) {
    return {
      success: false,
      error: `Gate pattern for "${gate.codename}" not found in this version of Claude Code.`,
      gatesChanged: [],
    };
  }

  // Create backup
  let backupPath: string | undefined;
  if (config?.backup !== false) {
    const bp = createBackup(bundle.path);
    if (!bp) {
      return {
        success: false,
        error: 'Could not create backup before patching.',
        gatesChanged: [],
      };
    }
    backupPath = bp;
  }

  // Apply patch
  const patched = gate.patchFn(bundle.content, match);

  if (!writeBundle(bundle.path, patched)) {
    // Attempt restore
    if (backupPath) {
      try {
        fs.copyFileSync(backupPath, bundle.path);
      } catch {
        // best effort
      }
    }
    return {
      success: false,
      error: 'Could not write patched file.',
      gatesChanged: [],
    };
  }

  return {
    success: true,
    backupPath,
    gatesChanged: [
      {
        name: gate.name,
        codename: gate.codename,
        detected: true,
        enabled: true,
        envOverride: gate.envOverride,
      },
    ],
  };
}

/**
 * Disable a single feature gate (restore original behavior).
 * Prefers restoring from backup; falls back to unpatchFn.
 */
export function disableGate(nameOrCodename: string, config?: GatePatchConfig): GateResult {
  const gate = findPatchableGate(nameOrCodename);
  if (!gate) {
    return {
      success: false,
      error: `Unknown or unpatchable gate: "${nameOrCodename}".`,
      gatesChanged: [],
    };
  }

  const bundle = resolveBundleFromDetector(config?.cliPath);
  if (!bundle) {
    return {
      success: false,
      error: 'Could not find Claude Code CLI.',
      gatesChanged: [],
    };
  }

  // Check if it's even patched (JS or binary marker)
  const isPatched =
    bundle.content.includes(`${GATE_PATCH_MARKER}:${gate.codename}`) ||
    bundle.content.includes(`${BINARY_PATCH_MARKER}:${gate.codename}`);
  if (!isPatched) {
    return {
      success: true,
      gatesChanged: [
        {
          name: gate.name,
          codename: gate.codename,
          detected: bundle.content.match(gate.detectRegex) !== null,
          enabled: false,
          envOverride: gate.envOverride,
        },
      ],
    };
  }

  // Try to find and restore from backup
  const dir = path.dirname(bundle.path);
  const basename = path.basename(bundle.path);
  let restoredFromBackup = false;

  try {
    const backups = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(`${basename}.backup.`))
      .sort()
      .reverse();

    if (backups.length > 0) {
      const latestBackup = path.join(dir, backups[0]);
      // Verify the backup doesn't contain our gate patch marker
      const backupContent = fs.readFileSync(latestBackup, 'utf8');
      if (!backupContent.includes(`${GATE_PATCH_MARKER}:${gate.codename}`)) {
        fs.copyFileSync(latestBackup, bundle.path);
        restoredFromBackup = true;
      }
    }
  } catch {
    // Fall through to unpatchFn
  }

  if (!restoredFromBackup) {
    // Use the gate's unpatch function as fallback
    const unpatched = gate.unpatchFn(bundle.content);
    if (!writeBundle(bundle.path, unpatched)) {
      return {
        success: false,
        error: 'Could not write unpatched file.',
        gatesChanged: [],
      };
    }
  }

  return {
    success: true,
    gatesChanged: [
      {
        name: gate.name,
        codename: gate.codename,
        detected: true,
        enabled: false,
        envOverride: gate.envOverride,
      },
    ],
  };
}

/**
 * Enable all patchable gates at once
 */
export function enableAllGates(config?: GatePatchConfig): GateResult {
  const bundle = resolveBundleFromDetector(config?.cliPath);
  if (!bundle) {
    return {
      success: false,
      error: 'Could not find Claude Code CLI.',
      gatesChanged: [],
    };
  }

  // Route to binary patcher for native binaries
  if (bundle.isBinary) {
    return enableAllBinaryGates(config);
  }

  // Single backup for all gates
  let backupPath: string | undefined;
  if (config?.backup !== false) {
    const bp = createBackup(bundle.path);
    if (!bp) {
      return {
        success: false,
        error: 'Could not create backup before patching.',
        gatesChanged: [],
      };
    }
    backupPath = bp;
  }

  let content = bundle.content;
  const changed: GateStatus[] = [];

  for (const gate of getPatchableGates()) {
    // Skip if already patched
    if (content.includes(`${GATE_PATCH_MARKER}:${gate.codename}`)) {
      changed.push({
        name: gate.name,
        codename: gate.codename,
        detected: true,
        enabled: true,
        envOverride: gate.envOverride,
      });
      continue;
    }

    const match = content.match(gate.detectRegex);
    if (match) {
      content = gate.patchFn(content, match);
      changed.push({
        name: gate.name,
        codename: gate.codename,
        detected: true,
        enabled: true,
        envOverride: gate.envOverride,
      });
    }
  }

  if (!writeBundle(bundle.path, content)) {
    if (backupPath) {
      try {
        fs.copyFileSync(backupPath, bundle.path);
      } catch {
        // best effort
      }
    }
    return {
      success: false,
      error: 'Could not write patched file.',
      gatesChanged: [],
    };
  }

  return {
    success: true,
    backupPath,
    gatesChanged: changed,
  };
}

/**
 * Reset all gates by restoring from the most recent backup
 */
export function resetGates(cliPath?: string): GateResult {
  const bundle = resolveBundleFromDetector(cliPath);
  if (!bundle) {
    return {
      success: false,
      error: 'Could not find Claude Code CLI.',
      gatesChanged: [],
    };
  }

  const bundlePath = bundle.path;
  const dir = path.dirname(bundlePath);
  const basename = path.basename(bundlePath);

  let backups: string[];
  try {
    backups = fs
      .readdirSync(dir)
      .filter((f) => f.startsWith(`${basename}.backup.`))
      .sort()
      .reverse();
  } catch {
    backups = [];
  }

  if (backups.length === 0) {
    return {
      success: false,
      error: 'No backup found. Cannot reset gates.',
      gatesChanged: [],
    };
  }

  const latestBackup = path.join(dir, backups[0]);
  try {
    fs.copyFileSync(latestBackup, bundlePath);
  } catch (err) {
    return {
      success: false,
      error: `Could not restore from backup: ${err instanceof Error ? err.message : String(err)}`,
      gatesChanged: [],
    };
  }

  return {
    success: true,
    backupPath: latestBackup,
    gatesChanged: [],
  };
}
