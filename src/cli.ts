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
import { findAllClis } from './cli-finder.js';
import { taskTools, gastownTools, builtInTools } from './tools/index.js';
import type { CustomToolDefinition } from './types.js';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import {
  detectAllGates,
  detectPatchableGates,
  scanAllFlags,
  enableGate,
  disableGate,
  enableAllGates,
  resetGates,
  getAllGates,
} from './gates/index.js';

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
  console.log('PATCHING COMMANDS:');
  console.log('  patch              Patch Claude Code with custom tools');
  console.log('  unpatch            Remove patch from Claude Code');
  console.log('  status             Check current patch status');
  console.log('  list               List available built-in tools');
  console.log('  find               Find all Claude Code installations');
  console.log('');
  console.log('FEATURE GATE COMMANDS:');
  console.log('  gates              List all detected feature gates');
  console.log('  gates enable <n>   Enable a feature gate (e.g., swarm, team)');
  console.log('  gates enable --all Enable all patchable feature gates');
  console.log('  gates disable <n>  Disable a feature gate');
  console.log('  gates reset        Restore all gates to defaults from backup');
  console.log('  gates scan         Scan binary for all tengu_* flags');
  console.log('');
  console.log('EXECUTION COMMANDS:');
  console.log('  exec <prompt>      Execute a prompt via Claude Code headless mode');
  console.log('');
  console.log('Patch Options:');
  console.log('  --tasks            Use task management tools (default)');
  console.log('  --gastown          Use Gastown multi-agent tools');
  console.log('  --all              Use all built-in tools');
  console.log('  --config <file>    Path to custom tools config file');
  console.log('  --cli <path>       Path to Claude Code CLI');
  console.log('  --no-backup        Skip creating backup');
  console.log('');
  console.log('Exec Options:');
  console.log('  --json             Output as JSON');
  console.log('  --model <model>    Model to use (e.g., sonnet, opus)');
  console.log('  --working-dir <d>  Working directory for Claude');
  console.log('  --timeout <ms>     Timeout in milliseconds (default: 300000)');
  console.log('  --output <file>    Write output to file');
  console.log('');
  console.log('General Options:');
  console.log('  --help, -h         Show this help');
  console.log('  --version, -v      Show version');
  console.log('');
  console.log('Examples:');
  console.log('  claude-patcher patch                    # Use task tools (default)');
  console.log('  claude-patcher patch --gastown          # Use Gastown tools');
  console.log('  claude-patcher patch --all              # Use all tools');
  console.log('  claude-patcher patch --config tools.js  # Use custom tools');
  console.log('  claude-patcher status                   # Check if patched');
  console.log('  claude-patcher unpatch                  # Remove patch');
  console.log('  claude-patcher gates                    # List detected gates');
  console.log('  claude-patcher gates enable swarm       # Enable swarm mode');
  console.log('  claude-patcher gates enable --all       # Enable all gates');
  console.log('  claude-patcher gates scan               # Scan for tengu flags');
  console.log('  claude-patcher exec "Explain this project"');
  console.log('  claude-patcher exec --json --model opus "Review src/cli.ts"');
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
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  TASK TOOLS (--tasks, default)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  for (const tool of taskTools) {
    console.log(`  ${tool.icon || '🔧'} ${tool.name}`);
    console.log(`     ${tool.description.slice(0, 70)}...`);
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  GASTOWN TOOLS (--gastown)');
  console.log('  Multi-agent orchestration for Claude Code');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  
  console.log('  Beads (Issue Tracking):');
  for (const tool of gastownTools.filter(t => t.name.startsWith('Bead'))) {
    console.log(`    ${tool.icon || '🔧'} ${tool.name} - ${tool.description.slice(0, 50)}...`);
  }
  console.log('');
  
  console.log('  Convoys (Work Bundles):');
  for (const tool of gastownTools.filter(t => t.name.startsWith('Convoy'))) {
    console.log(`    ${tool.icon || '🔧'} ${tool.name} - ${tool.description.slice(0, 50)}...`);
  }
  console.log('');
  
  console.log('  Agent Coordination:');
  for (const tool of gastownTools.filter(t => t.name.startsWith('Agent'))) {
    console.log(`    ${tool.icon || '🔧'} ${tool.name} - ${tool.description.slice(0, 50)}...`);
  }
  console.log('');
  
  console.log('  Hooks (Persistent State):');
  for (const tool of gastownTools.filter(t => t.name.startsWith('Hook'))) {
    console.log(`    ${tool.icon || '🔧'} ${tool.name} - ${tool.description.slice(0, 50)}...`);
  }
  console.log('');
  
  console.log('  Mail (Inter-Agent Messaging):');
  for (const tool of gastownTools.filter(t => t.name.startsWith('Mail'))) {
    console.log(`    ${tool.icon || '🔧'} ${tool.name} - ${tool.description.slice(0, 50)}...`);
  }
  console.log('');
  
  console.log('  Identity:');
  for (const tool of gastownTools.filter(t => t.name === 'WhoAmI')) {
    console.log(`    ${tool.icon || '🔧'} ${tool.name} - ${tool.description.slice(0, 50)}...`);
  }
  console.log('');
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('Usage:');
  console.log('  claude-patcher patch           # Task tools only');
  console.log('  claude-patcher patch --gastown # Gastown tools only');
  console.log('  claude-patcher patch --all     # All tools');
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
  let tools: CustomToolDefinition[] = taskTools;
  let toolSetName = 'Task Tools';
  let cliPath: string | undefined;
  let backup = true;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      const configPath = args[++i];
      const fullPath = configPath.startsWith('/') ? configPath : `${process.cwd()}/${configPath}`;
      tools = await loadCustomTools(fullPath);
      toolSetName = 'Custom Tools';
    } else if (args[i] === '--gastown') {
      tools = gastownTools;
      toolSetName = 'Gastown Tools';
    } else if (args[i] === '--tasks') {
      tools = taskTools;
      toolSetName = 'Task Tools';
    } else if (args[i] === '--all') {
      tools = builtInTools;
      toolSetName = 'All Built-in Tools';
    } else if (args[i] === '--cli' && args[i + 1]) {
      cliPath = args[++i];
    } else if (args[i] === '--no-backup') {
      backup = false;
    }
  }
  
  console.log(`Patching Claude Code with ${toolSetName}...`);
  console.log(`Tools: ${tools.map(t => t.name).join(', ')}`);
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
  console.log('╠════════════════════════════════════════════════════════════╣');
  
  if (toolSetName === 'Gastown Tools' || toolSetName === 'All Built-in Tools') {
    console.log('║  Gastown multi-agent coordination enabled!                 ║');
    console.log('║                                                            ║');
    console.log('║  Try it:                                                   ║');
    console.log('║    claude                                                  ║');
    console.log('║    > Who am I?                                             ║');
    console.log('║    > Create a bead to implement user authentication        ║');
    console.log('║    > List all beads                                        ║');
    console.log('║    > Check my mail                                         ║');
  } else {
    console.log('║  Try it:                                                   ║');
    console.log('║    claude                                                  ║');
    console.log('║    > Create a task to review the code                      ║');
  }
  
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

interface ExecOptions {
  json: boolean;
  model: string | null;
  workingDir: string | null;
  timeout: number;
  output: string | null;
}

function cmdExec(args: string[]) {
  const options: ExecOptions = {
    json: false,
    model: null,
    workingDir: null,
    timeout: 300000,
    output: null,
  };

  // Separate flags from the prompt
  const promptParts: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') {
      options.json = true;
    } else if (args[i] === '--model' && args[i + 1]) {
      options.model = args[++i];
    } else if (args[i] === '--working-dir' && args[i + 1]) {
      options.workingDir = args[++i];
    } else if (args[i] === '--timeout' && args[i + 1]) {
      options.timeout = parseInt(args[++i], 10) || 300000;
    } else if (args[i] === '--output' && args[i + 1]) {
      options.output = args[++i];
    } else if (!args[i].startsWith('--')) {
      promptParts.push(args[i]);
    }
  }

  const prompt = promptParts.join(' ');
  if (!prompt) {
    console.error('Error: exec requires a prompt argument');
    console.error('Usage: claude-patcher exec "your prompt here"');
    process.exit(1);
  }

  // Build claude CLI command
  const claudeArgs: string[] = ['--print'];

  if (options.json) {
    claudeArgs.push('--output-format', 'stream-json');
  }
  if (options.model) {
    claudeArgs.push('--model', options.model);
  }

  claudeArgs.push(prompt);

  // Find claude binary
  let claudeBin = 'claude';
  try {
    execSync('which claude', { encoding: 'utf8', stdio: 'pipe' });
  } catch {
    console.error('Error: Claude Code CLI not found. Install with:');
    console.error('  npm install -g @anthropic-ai/claude-code');
    process.exit(1);
  }

  const spawnOptions: { cwd?: string; timeout: number; stdio: [string, string, string] } = {
    timeout: options.timeout,
    stdio: ['pipe', 'pipe', 'pipe'],
  };

  if (options.workingDir) {
    spawnOptions.cwd = options.workingDir;
  }

  console.log(`Executing: claude ${claudeArgs.join(' ')}`);
  console.log('');

  try {
    const result = execSync(
      `${claudeBin} ${claudeArgs.map(a => `"${a.replace(/"/g, '\\"')}"`).join(' ')}`,
      {
        encoding: 'utf8',
        timeout: options.timeout,
        cwd: options.workingDir || undefined,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    if (options.output) {
      writeFileSync(options.output, result);
      console.log(`Output written to: ${options.output}`);
    } else {
      console.log(result);
    }
  } catch (err: unknown) {
    const execErr = err as { status?: number; stdout?: string; stderr?: string; signal?: string };
    if (execErr.signal === 'SIGTERM') {
      console.error('Error: Execution timed out');
      process.exit(124);
    }
    if (execErr.stderr) {
      console.error(execErr.stderr);
    }
    if (execErr.stdout && options.output) {
      writeFileSync(options.output, execErr.stdout);
      console.log(`Partial output written to: ${options.output}`);
    } else if (execErr.stdout) {
      console.log(execErr.stdout);
    }
    process.exit(execErr.status || 1);
  }
}

function printGateTable() {
  const gates = detectAllGates();

  if (gates.length === 0) {
    console.log('No gates detected. Is Claude Code installed?');
    return;
  }

  console.log('Feature Gates:');
  console.log('');
  console.log('  Status   │ Codename            │ Flag Name                    │ Env Override');
  console.log('  ─────────┼─────────────────────┼──────────────────────────────┼─────────────────────────────');

  for (const gate of gates) {
    const status = !gate.detected
      ? '  ⚫ n/a  '
      : gate.enabled
        ? '  ✅ on   '
        : '  ⚪ off  ';
    const codename = gate.codename.padEnd(19);
    const name = gate.name.padEnd(28);
    const env = gate.envOverride || '';
    console.log(`${status} │ ${codename} │ ${name} │ ${env}`);
  }

  console.log('');

  const patchable = detectPatchableGates().filter((g) => g.detected);
  console.log(`Patchable gates: ${patchable.length}`);
  console.log(`Total registered: ${getAllGates().length}`);
}

function printGateScan() {
  const flags = scanAllFlags();

  if (flags.length === 0) {
    console.log('No tengu_* flags found. Is Claude Code installed?');
    return;
  }

  const registeredNames = new Set(getAllGates().map((g) => g.name));

  console.log(`Found ${flags.length} tengu_* flags in binary:`);
  console.log('');

  let unknownCount = 0;
  for (const flag of flags) {
    const isKnown = registeredNames.has(flag);
    const marker = isKnown ? '  ✓' : '  ?';
    console.log(`${marker} ${flag}`);
    if (!isKnown) unknownCount++;
  }

  console.log('');
  console.log(`Known: ${flags.length - unknownCount}  Unknown: ${unknownCount}`);
}

function runGates(args: string[]) {
  const subCommand = args[0];
  let cliPath: string | undefined;

  // Extract --cli option
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cli' && args[i + 1]) {
      cliPath = args[++i];
    }
  }

  // No subcommand — list gates
  if (!subCommand || subCommand === 'list') {
    printGateTable();
    return;
  }

  if (subCommand === 'scan') {
    printGateScan();
    return;
  }

  if (subCommand === 'reset') {
    console.log('Resetting all gates to defaults...');
    const result = resetGates(cliPath);
    if (!result.success) {
      console.log('❌ Reset failed:', result.error);
      process.exit(1);
    }
    console.log('✅ Gates reset from backup:', result.backupPath);
    return;
  }

  if (subCommand === 'enable') {
    const target = args[1];

    if (target === '--all') {
      console.log('Enabling all patchable gates...');
      const result = enableAllGates({ cliPath });
      if (!result.success) {
        console.log('❌ Enable failed:', result.error);
        process.exit(1);
      }
      console.log('✅ Gates enabled:');
      for (const g of result.gatesChanged) {
        console.log(`  • ${g.codename} (${g.name})`);
      }
      if (result.backupPath) {
        console.log('Backup:', result.backupPath);
      }
      return;
    }

    if (!target || target.startsWith('-')) {
      console.log('Usage: claude-patcher gates enable <gate-name>');
      console.log('       claude-patcher gates enable --all');
      console.log('');
      console.log('Available gates: swarm, team');
      process.exit(1);
    }

    console.log(`Enabling gate: ${target}...`);
    const result = enableGate(target, { cliPath });
    if (!result.success) {
      console.log('❌ Enable failed:', result.error);
      process.exit(1);
    }
    for (const g of result.gatesChanged) {
      console.log(`✅ ${g.codename} (${g.name}) — enabled`);
    }
    if (result.backupPath) {
      console.log('Backup:', result.backupPath);
    }
    return;
  }

  if (subCommand === 'disable') {
    const target = args[1];
    if (!target || target.startsWith('-')) {
      console.log('Usage: claude-patcher gates disable <gate-name>');
      process.exit(1);
    }

    console.log(`Disabling gate: ${target}...`);
    const result = disableGate(target, { cliPath });
    if (!result.success) {
      console.log('❌ Disable failed:', result.error);
      process.exit(1);
    }
    for (const g of result.gatesChanged) {
      console.log(`✅ ${g.codename} (${g.name}) — disabled`);
    }
    return;
  }

  console.log(`Unknown gates subcommand: ${subCommand}`);
  console.log('');
  console.log('Available: gates, gates enable, gates disable, gates reset, gates scan');
  process.exit(1);
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

    case 'gates':
      runGates(args.slice(1));
      break;

    case 'exec':
      cmdExec(args.slice(1));
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
