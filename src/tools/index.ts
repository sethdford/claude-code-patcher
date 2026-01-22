/**
 * Built-in Tool Templates
 * 
 * Pre-built tools that can be used directly or as examples
 * for creating custom tools.
 */

export * from './task-tools.js';

// Re-export all built-in tools as a single array
import { taskTools } from './task-tools.js';
import type { CustomToolDefinition } from '../types.js';

/**
 * All built-in tools
 */
export const builtInTools: CustomToolDefinition[] = [
  ...taskTools
];
