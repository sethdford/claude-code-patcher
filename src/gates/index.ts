/**
 * Feature Gates — barrel export
 */

export { getAllGates, getPatchableGates, findGate, findPatchableGate, getGatesByCategory, isPatchable, GATE_PATCH_MARKER, BINARY_PATCH_MARKER } from './registry.js';
export { detectAllGates, detectGate, detectPatchableGates, scanAllFlags, findJsBundle, resolveBundle } from './detector.js';
export { enableGate, disableGate, enableAllGates, resetGates } from './patcher.js';
export { enableBinaryGate, enableAllBinaryGates, createPaddedReplacement, patchBinaryGate, isBinaryPatched } from './binary-patcher.js';
