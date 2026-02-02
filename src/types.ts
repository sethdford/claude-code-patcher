/**
 * Claude Code Patcher - Type Definitions
 * 
 * These types mirror the internal structure of Claude Code tools
 * based on reverse engineering of the CLI.
 */

/**
 * Zod-like schema interface for tool input/output validation
 * In Claude Code, this is the 'v' (Zod) library
 */
export interface ZodSchema {
  _type: string;
  parse: (data: unknown) => unknown;
  safeParse: (data: unknown) => { success: boolean; data?: unknown; error?: unknown };
}

/**
 * Permission check result
 */
export interface PermissionResult {
  behavior: 'allow' | 'deny' | 'ask';
  updatedInput: unknown;
  message?: string;
}

/**
 * Tool render message for UI display
 */
export interface ToolRenderMessage {
  icon?: string;
  title: string;
  subtitle?: string;
  content?: string;
}

/**
 * Tool execution context passed to the call method
 */
export interface ToolContext {
  agentId: string;
  sessionId: string;
  workingDirectory: string;
  getAppState: () => Promise<AppState>;
  getToolPermissionContext: () => unknown;
  tools: ClaudeTool[];
  agents: unknown[];
  abortSignal?: AbortSignal;
}

/**
 * Application state
 */
export interface AppState {
  todos: Record<string, unknown[]>;
  [key: string]: unknown;
}

/**
 * Input validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * The core tool interface that matches Claude Code's internal tool structure
 * Based on reverse engineering of TodoWrite and other built-in tools
 */
export interface ClaudeTool<TInput = unknown, TOutput = unknown> {
  /** Unique tool name (e.g., "TaskCreate", "TaskList") */
  name: string;
  
  /** Whether to use strict schema validation */
  strict?: boolean;
  
  /** Async function returning the tool description for the AI */
  description: () => Promise<string>;
  
  /** Async function returning the system prompt guidance for the AI */
  prompt: () => Promise<string>;
  
  /** Zod schema for input validation */
  inputSchema: ZodSchema;
  
  /** Zod schema for output validation */
  outputSchema: ZodSchema;
  
  /** User-facing display name (can be empty string) */
  userFacingName: () => string;
  
  /** Whether the tool is currently enabled */
  isEnabled: () => boolean;
  
  /** Whether the tool can run concurrently with other tools */
  isConcurrencySafe: () => boolean;
  
  /** Whether the tool only reads data (no side effects) */
  isReadOnly: () => boolean;
  
  /** Check if the tool has permission to run with given input */
  checkPermissions: (input: TInput) => Promise<PermissionResult>;
  
  /** Validate input before execution */
  validateInput?: (input: TInput) => ValidationResult;
  
  /** Render the tool use message in the UI */
  renderToolUseMessage: (input: TInput, options: { verbose?: boolean }) => ToolRenderMessage | null;
  
  /** Render progress message during execution */
  renderToolUseProgressMessage?: (input: TInput) => ToolRenderMessage | null;
  
  /** Render message when tool use is rejected */
  renderToolUseRejectedMessage?: (input: TInput, reason: string) => ToolRenderMessage | null;
  
  /** Render error message when tool fails */
  renderToolUseErrorMessage?: (error: Error) => ToolRenderMessage | null;
  
  /** Render the result message in the UI */
  renderToolResultMessage: (result: TOutput) => ToolRenderMessage | null;
  
  /** 
   * The main tool execution function
   * This is an async generator that yields results
   */
  call: (input: TInput, context: ToolContext) => AsyncGenerator<TOutput, void, unknown>;
}

/**
 * Simplified tool definition for users creating custom tools
 * The patcher will fill in defaults for optional fields
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CustomToolDefinition<TInput = any, TOutput = any> {
  /** Unique tool name */
  name: string;
  
  /** Description shown to the AI */
  description: string;
  
  /** System prompt guidance for the AI */
  prompt?: string;
  
  /** JSON Schema for input (will be converted to Zod) */
  inputSchema: JsonSchema;
  
  /** JSON Schema for output (will be converted to Zod) */
  outputSchema?: JsonSchema;
  
  /** User-facing display name */
  displayName?: string;
  
  /** Whether tool only reads data */
  readOnly?: boolean;
  
  /** Whether tool can run concurrently */
  concurrencySafe?: boolean;
  
  /** Icon for UI display */
  icon?: string;
  
  /** The main execution function */
  execute: (input: TInput, context?: ToolContext) => Promise<TOutput>;
}

/**
 * JSON Schema representation for tool inputs/outputs
 */
export interface JsonSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  items?: JsonSchemaProperty;
  description?: string;
}

export interface JsonSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  optional?: boolean;
}

/**
 * Patch result information
 */
export interface PatchResult {
  success: boolean;
  alreadyPatched?: boolean;
  error?: string;
  backupPath?: string;
  toolsInjected?: string[];
}

/**
 * CLI location information
 */
export interface CliLocation {
  path: string;
  version?: string;
  isPatched: boolean;
}

/**
 * Patcher configuration
 */
export interface PatcherConfig {
  /** Custom tools to inject */
  tools: CustomToolDefinition[];

  /** Path to CLI (auto-detected if not provided) */
  cliPath?: string;

  /** Whether to create backup before patching */
  backup?: boolean;

  /** Custom storage path for tool data */
  storagePath?: string;
}

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
