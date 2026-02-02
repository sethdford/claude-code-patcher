/**
 * Binary Patcher
 *
 * Patches feature gates inside native Claude Code binaries (Node.js SEA).
 *
 * Key constraint: the JS is embedded as raw bytes in the binary, so any
 * replacement MUST be exactly the same byte length as the original match.
 * We pad replacements with JS block comments to preserve length.
 *
 * Encoding: we read binaries as latin1 (ISO-8859-1) which maps each byte
 * to exactly one character. This keeps byte offsets consistent between the
 * string representation and the underlying Buffer, and ASCII-range JS code
 * is preserved identically.
 */

import * as fs from 'fs';
import type { FeatureGate, GateResult, GateStatus, GatePatchConfig } from '../types.js';
import { findPatchableGate, getPatchableGates, GATE_PATCH_MARKER, BINARY_PATCH_MARKER } from './registry.js';
import { resolveBundle } from './detector.js';

export { BINARY_PATCH_MARKER };

/**
 * Create a replacement string padded to exactly the same byte length as
 * the original matched text.
 *
 * Padding strategy (in order of preference):
 *   1. Full marker:  `/*CCP:codename   *​/`  (if room)
 *   2. Short marker: `/*CCP   *​/`           (if room)
 *   3. Spaces only                           (last resort)
 */
export function createPaddedReplacement(
  originalMatch: string,
  semanticReplacement: string,
  codename: string
): string {
  const targetLen = Buffer.byteLength(originalMatch, 'latin1');
  const baseLen = Buffer.byteLength(semanticReplacement, 'latin1');
  const gap = targetLen - baseLen;

  if (gap < 0) {
    throw new Error(
      `Replacement is ${-gap} bytes longer than original (${baseLen} vs ${targetLen})`
    );
  }

  if (gap === 0) {
    return semanticReplacement;
  }

  // Try full marker: /*CCP:codename*/
  const fullPrefix = `/*${BINARY_PATCH_MARKER}:${codename}`;
  const suffix = '*/';
  const fullOverhead = Buffer.byteLength(fullPrefix + suffix, 'latin1');

  if (gap >= fullOverhead) {
    const innerPad = gap - fullOverhead;
    return semanticReplacement + fullPrefix + ' '.repeat(innerPad) + suffix;
  }

  // Try short marker: /*CCP*/
  const shortPrefix = `/*${BINARY_PATCH_MARKER}`;
  const shortOverhead = Buffer.byteLength(shortPrefix + suffix, 'latin1');

  if (gap >= shortOverhead) {
    const innerPad = gap - shortOverhead;
    return semanticReplacement + shortPrefix + ' '.repeat(innerPad) + suffix;
  }

  // Fall back to plain space padding
  return semanticReplacement + ' '.repeat(gap);
}

/**
 * Patch a single gate inside a binary buffer.
 *
 * Returns the modified buffer and whether a change was made.
 * The buffer is modified in-place for efficiency.
 */
export function patchBinaryGate(
  buf: Buffer,
  content: string,
  gate: FeatureGate
): { buf: Buffer; changed: boolean } {
  if (!gate.semanticReplacement) {
    return { buf, changed: false };
  }

  const match = content.match(gate.detectRegex);
  if (!match || match.index === undefined) {
    return { buf, changed: false };
  }

  const original = match[0];
  const semantic = gate.semanticReplacement(match);
  const padded = createPaddedReplacement(original, semantic, gate.codename);

  // Sanity check: byte lengths must be identical
  const originalBytes = Buffer.byteLength(original, 'latin1');
  const paddedBytes = Buffer.byteLength(padded, 'latin1');
  if (originalBytes !== paddedBytes) {
    throw new Error(
      `Binary patch byte mismatch: original ${originalBytes}, padded ${paddedBytes}`
    );
  }

  // Write the replacement at the exact byte offset
  const offset = match.index;
  buf.write(padded, offset, paddedBytes, 'latin1');

  return { buf, changed: true };
}

/**
 * Check whether a gate has been binary-patched by looking for the
 * binary marker or the full JS marker.
 */
export function isBinaryPatched(content: string, codename: string): boolean {
  return (
    content.includes(`${GATE_PATCH_MARKER}:${codename}`) ||
    content.includes(`${BINARY_PATCH_MARKER}:${codename}`)
  );
}

/**
 * Enable a single gate in a native binary.
 */
export function enableBinaryGate(
  nameOrCodename: string,
  config?: GatePatchConfig
): GateResult {
  const gate = findPatchableGate(nameOrCodename);
  if (!gate) {
    return {
      success: false,
      error: `Unknown or unpatchable gate: "${nameOrCodename}".`,
      gatesChanged: [],
    };
  }

  if (!gate.semanticReplacement) {
    return {
      success: false,
      error: `Gate "${gate.codename}" does not support binary patching (no semanticReplacement).`,
      gatesChanged: [],
    };
  }

  const bundle = resolveBundle(config?.cliPath);
  if (!bundle || !bundle.isBinary) {
    return {
      success: false,
      error: 'Could not find a native Claude Code binary.',
      gatesChanged: [],
    };
  }

  // Already patched?
  if (isBinaryPatched(bundle.content, gate.codename)) {
    return {
      success: true,
      gatesChanged: [
        { name: gate.name, codename: gate.codename, detected: true, enabled: true, envOverride: gate.envOverride },
      ],
    };
  }

  // Read as Buffer for byte-level replacement
  let buf: Buffer;
  try {
    buf = fs.readFileSync(bundle.path);
  } catch {
    return { success: false, error: 'Could not read binary file.', gatesChanged: [] };
  }

  // Backup
  let backupPath: string | undefined;
  if (config?.backup !== false) {
    backupPath = `${bundle.path}.backup.${Date.now()}`;
    try {
      fs.copyFileSync(bundle.path, backupPath);
    } catch {
      return { success: false, error: 'Could not create backup.', gatesChanged: [] };
    }
  }

  const { buf: patched, changed } = patchBinaryGate(buf, bundle.content, gate);
  if (!changed) {
    return {
      success: false,
      error: `Gate pattern for "${gate.codename}" not found in this binary.`,
      gatesChanged: [],
    };
  }

  try {
    fs.writeFileSync(bundle.path, patched);
  } catch {
    if (backupPath) {
      try { fs.copyFileSync(backupPath, bundle.path); } catch { /* best effort */ }
    }
    return { success: false, error: 'Could not write patched binary.', gatesChanged: [] };
  }

  return {
    success: true,
    backupPath,
    gatesChanged: [
      { name: gate.name, codename: gate.codename, detected: true, enabled: true, envOverride: gate.envOverride },
    ],
  };
}

/**
 * Enable all patchable gates in a native binary.
 */
export function enableAllBinaryGates(config?: GatePatchConfig): GateResult {
  const bundle = resolveBundle(config?.cliPath);
  if (!bundle || !bundle.isBinary) {
    return { success: false, error: 'Could not find a native Claude Code binary.', gatesChanged: [] };
  }

  let buf: Buffer;
  try {
    buf = fs.readFileSync(bundle.path);
  } catch {
    return { success: false, error: 'Could not read binary file.', gatesChanged: [] };
  }

  // Single backup
  let backupPath: string | undefined;
  if (config?.backup !== false) {
    backupPath = `${bundle.path}.backup.${Date.now()}`;
    try {
      fs.copyFileSync(bundle.path, backupPath);
    } catch {
      return { success: false, error: 'Could not create backup.', gatesChanged: [] };
    }
  }

  const changed: GateStatus[] = [];
  // We need to re-read content as latin1 from the buffer as we patch it
  let content = buf.toString('latin1');

  for (const gate of getPatchableGates()) {
    if (!gate.semanticReplacement) continue;

    if (isBinaryPatched(content, gate.codename)) {
      changed.push({ name: gate.name, codename: gate.codename, detected: true, enabled: true, envOverride: gate.envOverride });
      continue;
    }

    const result = patchBinaryGate(buf, content, gate);
    if (result.changed) {
      // Re-read content from the mutated buffer for subsequent gate detections
      content = buf.toString('latin1');
      changed.push({ name: gate.name, codename: gate.codename, detected: true, enabled: true, envOverride: gate.envOverride });
    }
  }

  try {
    fs.writeFileSync(bundle.path, buf);
  } catch {
    if (backupPath) {
      try { fs.copyFileSync(backupPath, bundle.path); } catch { /* best effort */ }
    }
    return { success: false, error: 'Could not write patched binary.', gatesChanged: [] };
  }

  return { success: true, backupPath, gatesChanged: changed };
}
