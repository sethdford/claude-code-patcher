/**
 * Claude Code Patcher
 * 
 * Core patching logic that injects custom tools into the Claude Code CLI.
 * Based on reverse engineering of Claude Code v2.1.3.
 */

import * as fs from 'fs';
import * as path from 'path';
import { findCli, validateCliPath } from './cli-finder.js';
import { generateInjectionCode } from './tool-builder.js';
import type { PatchResult, PatcherConfig, CustomToolDefinition } from './types.js';

const PATCHER_MARKER = 'CLAUDE-CODE-PATCHER CUSTOM TOOLS';

/**
 * Pattern to find the tools array in the aU function
 * This is where Claude Code collects all available tools
 */
const TOOLS_ARRAY_PATTERN = /aU=\(A\)=>\{let B=\[([A-Za-z0-9_,\$]+),\.\.\.\[\],\.\.\.\[\],\.\.\.\[\]\]/;

/**
 * Pattern we'll replace to inject our custom tools
 */
const INJECTION_TARGET = ',...[],...[],...[]]';
const INJECTION_REPLACEMENT = ',...[],...[],...[],...(globalThis._CLAUDE_CUSTOM_TOOLS_||[])]';

/**
 * Apply the patch to Claude Code CLI
 */
export function patch(config: PatcherConfig): PatchResult {
  // Find or validate CLI path
  const cliPath = config.cliPath 
    ? validateCliPath(config.cliPath)?.path
    : findCli()?.path;
  
  if (!cliPath) {
    return {
      success: false,
      error: 'Could not find Claude Code CLI. Install it with: npm install -g @anthropic-ai/claude-code'
    };
  }
  
  // Read the CLI file
  let content: string;
  try {
    content = fs.readFileSync(cliPath, 'utf8');
  } catch (err) {
    return {
      success: false,
      error: `Could not read CLI file: ${err instanceof Error ? err.message : String(err)}`
    };
  }
  
  // Check if already patched
  if (content.includes(PATCHER_MARKER)) {
    return {
      success: true,
      alreadyPatched: true,
      toolsInjected: extractPatchedTools(content)
    };
  }
  
  // Verify the tools array pattern exists
  const match = content.match(TOOLS_ARRAY_PATTERN);
  if (!match) {
    return {
      success: false,
      error: 'Could not find tools array pattern. This version of Claude Code may not be compatible.'
    };
  }
  
  // Create backup if requested
  let backupPath: string | undefined;
  if (config.backup !== false) {
    backupPath = `${cliPath}.backup.${Date.now()}`;
    try {
      fs.copyFileSync(cliPath, backupPath);
    } catch (err) {
      return {
        success: false,
        error: `Could not create backup: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  }
  
  // Generate injection code
  const injectionCode = generateInjectionCode(config.tools);
  
  // Find injection point AFTER Zod (v) is defined
  // Zod is defined as: var v={...};
  // We need to inject after this so our schemas can use v.string(), v.object(), etc.
  const zodDefStart = content.indexOf('var v={');
  if (zodDefStart === -1) {
    return {
      success: false,
      error: 'Could not find Zod (v) definition. This version of Claude Code may not be compatible.'
    };
  }
  
  // Find the end of the Zod definition block
  // It ends with: });var  (next variable definition)
  // We'll look for the closing of the Zod IIFE
  let zodDefEnd = content.indexOf('});var ', zodDefStart);
  if (zodDefEnd === -1) {
    // Try alternative pattern
    zodDefEnd = content.indexOf('});', zodDefStart);
  }
  if (zodDefEnd === -1) {
    return {
      success: false,
      error: 'Could not find end of Zod definition'
    };
  }
  
  // Inject after the Zod definition closes
  const injectionPoint = zodDefEnd + 3; // After '});'
  
  // Verify the injection target exists
  if (!content.includes(INJECTION_TARGET)) {
    return {
      success: false,
      error: 'Could not find tools array spread pattern. This version of Claude Code may not be compatible.'
    };
  }
  
  // Apply patches
  let patchedContent = content.slice(0, injectionPoint) + injectionCode + '\n' + content.slice(injectionPoint);
  patchedContent = patchedContent.replace(INJECTION_TARGET, INJECTION_REPLACEMENT);
  
  // Write patched file
  try {
    fs.writeFileSync(cliPath, patchedContent);
  } catch (err) {
    // Try to restore backup
    if (backupPath && fs.existsSync(backupPath)) {
      try {
        fs.copyFileSync(backupPath, cliPath);
      } catch {
        // Ignore restore errors
      }
    }
    return {
      success: false,
      error: `Could not write patched CLI: ${err instanceof Error ? err.message : String(err)}`
    };
  }
  
  return {
    success: true,
    alreadyPatched: false,
    backupPath,
    toolsInjected: config.tools.map(t => t.name)
  };
}

/**
 * Remove the patch from Claude Code CLI
 */
export function unpatch(cliPath?: string): PatchResult {
  // Find or validate CLI path
  const resolvedPath = cliPath 
    ? validateCliPath(cliPath)?.path
    : findCli()?.path;
  
  if (!resolvedPath) {
    return {
      success: false,
      error: 'Could not find Claude Code CLI'
    };
  }
  
  // Find the most recent backup
  const dir = path.dirname(resolvedPath);
  const basename = path.basename(resolvedPath);
  
  let backups: string[];
  try {
    backups = fs.readdirSync(dir)
      .filter(f => f.startsWith(`${basename}.backup.`))
      .sort()
      .reverse();
  } catch {
    backups = [];
  }
  
  if (backups.length === 0) {
    // No backup, try to remove patch manually
    try {
      let content = fs.readFileSync(resolvedPath, 'utf8');
      
      if (!content.includes(PATCHER_MARKER)) {
        return {
          success: true,
          alreadyPatched: false
        };
      }
      
      // Remove injection code
      const startMarker = '// === CLAUDE-CODE-PATCHER CUSTOM TOOLS ===';
      const endMarker = '// === END CLAUDE-CODE-PATCHER CUSTOM TOOLS ===';
      
      const startIdx = content.indexOf(startMarker);
      const endIdx = content.indexOf(endMarker);
      
      if (startIdx !== -1 && endIdx !== -1) {
        content = content.slice(0, startIdx) + content.slice(endIdx + endMarker.length + 1);
      }
      
      // Restore original injection target
      content = content.replace(INJECTION_REPLACEMENT, INJECTION_TARGET);
      
      fs.writeFileSync(resolvedPath, content);
      
      return {
        success: true,
        alreadyPatched: false
      };
    } catch (err) {
      return {
        success: false,
        error: `Could not remove patch: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  }
  
  // Restore from backup
  const latestBackup = path.join(dir, backups[0]);
  
  try {
    fs.copyFileSync(latestBackup, resolvedPath);
  } catch (err) {
    return {
      success: false,
      error: `Could not restore from backup: ${err instanceof Error ? err.message : String(err)}`
    };
  }
  
  return {
    success: true,
    backupPath: latestBackup
  };
}

/**
 * Extract the list of patched tools from CLI content
 */
function extractPatchedTools(content: string): string[] {
  const toolsMatch = content.match(/\/\/ Tools: ([^\n]+)/);
  if (toolsMatch) {
    return toolsMatch[1].split(', ').map(t => t.trim());
  }
  return [];
}

/**
 * Check if CLI is patched and get tool info
 */
export function getPatchStatus(cliPath?: string): { 
  isPatched: boolean; 
  tools: string[];
  cliPath: string | null;
  version: string | null;
} {
  const cli = cliPath ? validateCliPath(cliPath) : findCli();
  
  if (!cli) {
    return {
      isPatched: false,
      tools: [],
      cliPath: null,
      version: null
    };
  }
  
  let tools: string[] = [];
  if (cli.isPatched) {
    try {
      const content = fs.readFileSync(cli.path, 'utf8');
      tools = extractPatchedTools(content);
    } catch {
      // Ignore read errors
    }
  }
  
  return {
    isPatched: cli.isPatched,
    tools,
    cliPath: cli.path,
    version: cli.version ?? null
  };
}
