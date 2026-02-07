/**
 * Claude Code Patcher — Type Definitions
 *
 * Types for the feature gate detection, analysis, and patching system.
 */

/**
 * Feature gate definition for Claude Code's Statsig-based feature flags.
 * Each gate controls a specific feature behind a tengu_* flag.
 */
export interface FeatureGate {
  /** Statsig flag name, e.g. 'tengu_brass_pebble' */
  name: string;
  /** Human-readable codename, e.g. 'swarm-mode' */
  codename: string;
  /** What this gate controls */
  description: string;
  /** Classification */
  category: 'feature' | 'experiment' | 'telemetry';
  /** Pattern to find the gate in minified JS */
  detectRegex: RegExp;
  /** Transform matched content to enable the gate (for JS bundles) */
  patchFn: (content: string, match: RegExpMatchArray) => string;
  /** Reverse a previous patch */
  unpatchFn: (content: string) => string;
  /** Environment variable that can also toggle this gate */
  envOverride?: string;
  /**
   * Return just the semantic replacement string for a regex match.
   * Used by the binary patcher to generate length-padded replacements.
   * If absent, the gate cannot be binary-patched.
   */
  semanticReplacement?: (match: RegExpMatchArray) => string;
}

/**
 * Resolved bundle information — either a plain JS file or a native binary
 * with embedded JS.
 */
export interface BundleInfo {
  /** The file content (utf-8 for JS, latin1 for binary) */
  content: string;
  /** Absolute path to the file */
  path: string;
  /** True when the file is a compiled native binary, not a .js file */
  isBinary: boolean;
}

/**
 * Runtime status of a detected feature gate
 */
export interface GateStatus {
  name: string;
  codename: string;
  detected: boolean;
  enabled: boolean;
  envOverride?: string;
}

/**
 * Result of a gate patching operation
 */
export interface GateResult {
  success: boolean;
  error?: string;
  gatesChanged: GateStatus[];
  backupPath?: string;
}

/**
 * Configuration for gate patching operations
 */
export interface GatePatchConfig {
  /** Path to CLI (auto-detected if not provided) */
  cliPath?: string;
  /** Whether to create backup before patching */
  backup?: boolean;
}

/**
 * CLI location information
 */
export interface CliLocation {
  path: string;
  version?: string;
  isPatched: boolean;
}
