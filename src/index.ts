/**
 * Claude Code Patcher — Feature Gate Toolkit
 *
 * Detect, analyze, and patch Statsig feature gates in Claude Code.
 */

// Gate registry
export {
  getAllGates,
  getPatchableGates,
  findGate,
  findPatchableGate,
  getGatesByCategory,
  isPatchable,
  GATE_PATCH_MARKER,
  BINARY_PATCH_MARKER,
} from './gates/index.js';

// Gate detection
export {
  detectAllGates,
  detectGate,
  detectPatchableGates,
  scanAllFlags,
  findJsBundle,
  resolveBundle,
} from './gates/index.js';

// Gate patching
export {
  enableGate,
  disableGate,
  enableAllGates,
  resetGates,
} from './gates/index.js';

// Binary patching
export {
  enableBinaryGate,
  enableAllBinaryGates,
  createPaddedReplacement,
  patchBinaryGate,
  isBinaryPatched,
} from './gates/index.js';

// CLI finder
export { findCli, findAllClis, validateCliPath } from './cli-finder.js';

// Types
export type {
  FeatureGate,
  BundleInfo,
  GateStatus,
  GateResult,
  GatePatchConfig,
  CliLocation,
} from './types.js';
