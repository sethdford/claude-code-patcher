/**
 * Claude Code Patcher
 * 
 * Extend Claude Code with custom native tools - no MCP required.
 * 
 * @example
 * ```typescript
 * import { patch, taskTools } from 'claude-code-patcher';
 * 
 * // Patch with built-in task tools
 * const result = patch({ tools: taskTools });
 * 
 * // Or create custom tools
 * import { patch, CustomToolDefinition } from 'claude-code-patcher';
 * 
 * const myTool: CustomToolDefinition = {
 *   name: 'MyTool',
 *   description: 'Does something useful',
 *   inputSchema: {
 *     type: 'object',
 *     properties: {
 *       input: { type: 'string', description: 'The input' }
 *     },
 *     required: ['input']
 *   },
 *   async execute(input) {
 *     return { result: `Processed: ${input.input}` };
 *   }
 * };
 * 
 * patch({ tools: [myTool] });
 * ```
 */

// Core patcher
export { patch, unpatch, getPatchStatus } from './patcher.js';

// CLI finder
export { findCli, findAllClis, validateCliPath } from './cli-finder.js';

// Tool builder
export { generateToolCode, generateInjectionCode } from './tool-builder.js';

// Built-in tools
export { 
  taskTools,
  TaskCreate,
  TaskGet,
  TaskUpdate,
  TaskList,
  builtInTools
} from './tools/index.js';

// Types
export type {
  ClaudeTool,
  CustomToolDefinition,
  JsonSchema,
  JsonSchemaProperty,
  PatchResult,
  PatcherConfig,
  CliLocation,
  ToolContext,
  ToolRenderMessage,
  PermissionResult,
  ValidationResult
} from './types.js';
