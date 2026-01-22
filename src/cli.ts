#!/usr/bin/env node
/**
 * Claude Code Patcher CLI
 * 
 * Command-line interface for patching Claude Code with custom tools.
 * 
 * Usage:
 *   claude-patcher patch              # Patch with built-in task tools
 *   claude-patcher patch --config ./my-tools.js  # Patch with custom tools
 *   claude-patcher unpatch            # Remove patch
 *   claude-patcher status             # Check patch status
 *   claude-patcher list               # List available tools
 */

import { patch, unpatch, getPatchStatus } from './patcher.js';
import { findCli, findAllClis } from './cli-finder.js';
import { taskTools } from './tools/index.js';
import type { CustomToolDefinition } from './types.js';

const VERSION = '1.0.0';

function printBanner() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║            Claude Code Patcher v' + VERSION + '                      ║');
  console.log('║     Extend Claude Code with custom native tools            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
}

function printHelp() {
  console.log('Usage: claude-patcher <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  patch              Patch Claude Code with custom tools');
  console.log('  unpatch            Remove patch from Claude Code');
  console.log('  status             Check current patch status');
  console.log('  list               List available built-in tools');
  console.log('  find               Find all Claude Code installations');
  console.log('');
  console.log('Options:');
  console.log('  --config <file>    Path to custom tools config file');
  console.log('  --cli <path>       Path to Claude Code CLI');
  console.log('  --no-backup        Skip creating backup');
  console.log('  --help, -h         Show this help');
  console.log('  --version, -v      Show version');
  console.log('');
  console.log('Examples:');
  console.log('  claude-patcher patch                    # Use built-in task tools');
  console.log('  claude-patcher patch --config tools.js  # Use custom tools');
  console.log('  claude-patcher status                   # Check if patched');
  console.log('  claude-patcher unpatch                  # Remove patch');
  console.log('');
}

function printStatus() {
  const status = getPatchStatus();
  
  if (!status.cliPath) {
    console.log('❌ Claude Code CLI not found');
    console.log('');
    console.log('Install Claude Code with:');
    console.log('  npm install -g @anthropic-ai/claude-code');
    return;
  }
  
  console.log('CLI Path:', status.cliPath);
  console.log('Version:', status.version || 'unknown');
  console.log('');
  
  if (status.isPatched) {
    console.log('✅ Claude Code is PATCHED');
    console.log('');
    console.log('Installed tools:');
    for (const tool of status.tools) {
      console.log(`  • ${tool}`);
    }
  } else {
    console.log('⚪ Claude Code is NOT patched');
    console.log('');
    console.log('Run `claude-patcher patch` to add custom tools.');
  }
}

function printList() {
  console.log('Built-in Tools:');
  console.log('');
  
  for (const tool of taskTools) {
    console.log(`  ${tool.icon || '🔧'} ${tool.name}`);
    console.log(`     ${tool.description}`);
    console.log('');
  }
  
  console.log('To use these tools, run:');
  console.log('  claude-patcher patch');
}

function printFind() {
  const clis = findAllClis();
  
  if (clis.length === 0) {
    console.log('No Claude Code installations found.');
    console.log('');
    console.log('Install with: npm install -g @anthropic-ai/claude-code');
    return;
  }
  
  console.log('Found Claude Code installations:');
  console.log('');
  
  for (const cli of clis) {
    const status = cli.isPatched ? '✅ patched' : '⚪ not patched';
    console.log(`  ${status}`);
    console.log(`  Path: ${cli.path}`);
    console.log(`  Version: ${cli.version || 'unknown'}`);
    console.log('');
  }
}

async function loadCustomTools(configPath: string): Promise<CustomToolDefinition[]> {
  try {
    // Dynamic import for ESM compatibility
    const config = await import(configPath);
    
    if (Array.isArray(config.default)) {
      return config.default;
    }
    
    if (Array.isArray(config.tools)) {
      return config.tools;
    }
    
    console.error('Config file must export an array of tools as default or as `tools`');
    process.exit(1);
  } catch (err) {
    console.error(`Failed to load config: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

async function runPatch(args: string[]) {
  let tools = taskTools;
  let cliPath: string | undefined;
  let backup = true;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      const configPath = args[++i];
      const fullPath = configPath.startsWith('/') ? configPath : `${process.cwd()}/${configPath}`;
      tools = await loadCustomTools(fullPath);
    } else if (args[i] === '--cli' && args[i + 1]) {
      cliPath = args[++i];
    } else if (args[i] === '--no-backup') {
      backup = false;
    }
  }
  
  console.log('Patching Claude Code...');
  console.log('');
  
  const result = patch({
    tools,
    cliPath,
    backup
  });
  
  if (!result.success) {
    console.log('❌ Patch failed:', result.error);
    process.exit(1);
  }
  
  if (result.alreadyPatched) {
    console.log('✅ Already patched with tools:');
    for (const tool of result.toolsInjected || []) {
      console.log(`  • ${tool}`);
    }
    return;
  }
  
  console.log('✅ Patch successful!');
  console.log('');
  
  if (result.backupPath) {
    console.log('Backup:', result.backupPath);
  }
  
  console.log('');
  console.log('Installed tools:');
  for (const tool of result.toolsInjected || []) {
    console.log(`  • ${tool}`);
  }
  
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Custom tools are now available in Claude Code!            ║');
  console.log('║                                                            ║');
  console.log('║  Try it:                                                   ║');
  console.log('║    claude                                                  ║');
  console.log('║    > Create a task to review the code                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

function runUnpatch(args: string[]) {
  let cliPath: string | undefined;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cli' && args[i + 1]) {
      cliPath = args[++i];
    }
  }
  
  console.log('Removing patch...');
  console.log('');
  
  const result = unpatch(cliPath);
  
  if (!result.success) {
    console.log('❌ Unpatch failed:', result.error);
    process.exit(1);
  }
  
  if (result.backupPath) {
    console.log('✅ Restored from backup:', result.backupPath);
  } else {
    console.log('✅ Patch removed successfully');
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (args.includes('--help') || args.includes('-h') || !command) {
    printBanner();
    printHelp();
    return;
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    console.log(`claude-code-patcher v${VERSION}`);
    return;
  }
  
  printBanner();
  
  switch (command) {
    case 'patch':
      await runPatch(args.slice(1));
      break;
      
    case 'unpatch':
      runUnpatch(args.slice(1));
      break;
      
    case 'status':
      printStatus();
      break;
      
    case 'list':
      printList();
      break;
      
    case 'find':
      printFind();
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      console.log('');
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
