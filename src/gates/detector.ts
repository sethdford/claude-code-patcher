/**
 * Feature Gate Detector
 *
 * Reads the Claude Code JS bundle and detects the state of feature gates.
 * Handles both npm-installed (direct JS file) and native binary installs.
 */

import * as fs from 'fs';
import * as path from 'path';
import { findCli } from '../cli-finder.js';
import type { GateStatus, BundleInfo } from '../types.js';
import { getAllGates, getPatchableGates, GATE_PATCH_MARKER, BINARY_PATCH_MARKER } from './registry.js';

/**
 * Resolve the JS bundle path from a CLI path.
 *
 * For npm installs the CLI path *is* the JS file.
 * For native binaries we look for an adjacent or embedded JS bundle.
 */
export function findJsBundle(cliPath: string): string | null {
  // If the path itself is a JS file, use it directly
  if (cliPath.endsWith('.js')) {
    return fs.existsSync(cliPath) ? cliPath : null;
  }

  // Native binary — look for adjacent cli.js or cli.mjs
  const dir = path.dirname(cliPath);
  for (const candidate of ['cli.js', 'cli.mjs', 'index.js']) {
    const full = path.join(dir, candidate);
    if (fs.existsSync(full)) {
      return full;
    }
  }

  return null;
}

/**
 * Resolve the Claude Code bundle — either a plain JS file or a native binary
 * with embedded JS. For JS bundles we read as utf-8; for native binaries we
 * read as latin1 so byte offsets stay consistent for patching.
 */
export function resolveBundle(cliPath?: string): BundleInfo | null {
  const cli = cliPath ? { path: cliPath } : findCli();
  if (!cli) return null;

  // Try JS bundle first (npm install or adjacent .js file)
  const jsBundle = findJsBundle(cli.path);
  if (jsBundle) {
    try {
      const content = fs.readFileSync(jsBundle, 'utf8');
      return { content, path: jsBundle, isBinary: false };
    } catch {
      return null;
    }
  }

  // Fall through to native binary (Node.js SEA)
  const ext = path.extname(cli.path);
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return null;

  try {
    if (!fs.existsSync(cli.path)) return null;
    const content = fs.readFileSync(cli.path, 'latin1');
    return { content, path: cli.path, isBinary: true };
  } catch {
    return null;
  }
}

/**
 * Detect the status of a single gate in the bundle content.
 * Checks both JS and binary patch markers.
 */
function detectGateInContent(
  content: string,
  gate: { name: string; codename: string; detectRegex: RegExp; envOverride?: string }
): GateStatus {
  const match = content.match(gate.detectRegex);
  const detected = match !== null;

  // Check if the gate has already been patched by us (JS or binary marker)
  const isPatchedByUs =
    content.includes(`${GATE_PATCH_MARKER}:${gate.codename}`) ||
    content.includes(`${BINARY_PATCH_MARKER}:${gate.codename}`);

  return {
    name: gate.name,
    codename: gate.codename,
    detected: detected || isPatchedByUs,
    enabled: isPatchedByUs,
    envOverride: gate.envOverride,
  };
}

/**
 * Detect all registered gates in the Claude Code binary
 */
export function detectAllGates(cliPath?: string): GateStatus[] {
  const bundle = resolveBundle(cliPath);
  if (!bundle) return [];

  return getAllGates().map((gate) => detectGateInContent(bundle.content, gate));
}

/**
 * Detect a single gate by name or codename
 */
export function detectGate(nameOrCodename: string, cliPath?: string): GateStatus | null {
  const bundle = resolveBundle(cliPath);
  if (!bundle) return null;

  const lower = nameOrCodename.toLowerCase();
  const gate = getAllGates().find(
    (g) => g.name === lower || g.codename === lower || g.name === `tengu_${lower.replace(/-/g, '_')}`
  );

  if (!gate) return null;
  return detectGateInContent(bundle.content, gate);
}

/**
 * Detect only patchable gates (those with real patch implementations)
 */
export function detectPatchableGates(cliPath?: string): GateStatus[] {
  const bundle = resolveBundle(cliPath);
  if (!bundle) return [];

  return getPatchableGates().map((gate) => detectGateInContent(bundle.content, gate));
}

/**
 * Scan the binary for all tengu_* flags (not just registered ones).
 * Uses string matching rather than the `strings` command for portability.
 */
export function scanAllFlags(cliPath?: string): string[] {
  const bundle = resolveBundle(cliPath);
  if (!bundle) return [];

  const matches = bundle.content.match(/tengu_[a-z0-9_]+/g);
  if (!matches) return [];

  return [...new Set(matches)].sort();
}
