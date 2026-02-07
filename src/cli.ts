#!/usr/bin/env node
/**
 * Claude Code Patcher CLI
 *
 * Feature gate detection, analysis, and patching for Claude Code.
 *
 * Usage:
 *   claude-patcher gates              # List all detected gates
 *   claude-patcher gates enable swarm  # Enable a gate
 *   claude-patcher gates scan          # Scan for all tengu_* flags
 */

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

const VERSION = '2.0.0';

function printBanner(): void {
  console.log('');
  console.log('  Claude Code Patcher v' + VERSION);
  console.log('  Feature gate toolkit for Claude Code');
  console.log('');
}

function printHelp(): void {
  console.log('Usage: claude-patcher <command> [options]');
  console.log('');
  console.log('COMMANDS:');
  console.log('  gates              List all detected feature gates');
  console.log('  gates enable <n>   Enable a feature gate (e.g., swarm, team, oboe)');
  console.log('  gates enable --all Enable all patchable feature gates');
  console.log('  gates disable <n>  Disable a feature gate');
  console.log('  gates reset        Restore all gates to defaults from backup');
  console.log('  gates scan         Scan binary for all tengu_* flags');
  console.log('');
  console.log('OPTIONS:');
  console.log('  --cli <path>       Path to Claude Code CLI (auto-detected)');
  console.log('  --help, -h         Show this help');
  console.log('  --version, -v      Show version');
  console.log('');
  console.log('EXAMPLES:');
  console.log('  claude-patcher gates');
  console.log('  claude-patcher gates enable swarm');
  console.log('  claude-patcher gates enable --all');
  console.log('  claude-patcher gates scan');
  console.log('');
}

function printGateTable(): void {
  const gates = detectAllGates();

  if (gates.length === 0) {
    console.log('No gates detected. Is Claude Code installed?');
    return;
  }

  console.log('Feature Gates:');
  console.log('');
  console.log('  Status   | Codename              | Flag Name                          | Env Override');
  console.log('  ---------+-----------------------+------------------------------------+-----------------------------------');

  for (const gate of gates) {
    const status = !gate.detected
      ? '  -- n/a  '
      : gate.enabled
        ? '  ** on   '
        : '     off  ';
    const codename = gate.codename.padEnd(21);
    const name = gate.name.padEnd(34);
    const env = gate.envOverride || '';
    console.log(`${status} | ${codename} | ${name} | ${env}`);
  }

  console.log('');

  const patchable = detectPatchableGates().filter((g) => g.detected);
  console.log(`Patchable gates: ${patchable.length}`);
  console.log(`Total registered: ${getAllGates().length}`);
}

function printGateScan(): void {
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
    const marker = isKnown ? '  +' : '  ?';
    console.log(`${marker} ${flag}`);
    if (!isKnown) unknownCount++;
  }

  console.log('');
  console.log(`Known: ${flags.length - unknownCount}  Unknown: ${unknownCount}`);
}

function runGates(args: string[]): void {
  const subCommand = args[0];
  let cliPath: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cli' && args[i + 1]) {
      cliPath = args[++i];
    }
  }

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
      console.log('Reset failed:', result.error);
      process.exit(1);
    }
    console.log('Gates reset from backup:', result.backupPath);
    return;
  }

  if (subCommand === 'enable') {
    const target = args[1];

    if (target === '--all') {
      console.log('Enabling all patchable gates...');
      const result = enableAllGates({ cliPath });
      if (!result.success) {
        console.log('Enable failed:', result.error);
        process.exit(1);
      }
      console.log('Gates enabled:');
      for (const g of result.gatesChanged) {
        console.log(`  ${g.codename} (${g.name})`);
      }
      if (result.backupPath) {
        console.log('Backup:', result.backupPath);
      }
      return;
    }

    if (!target || target.startsWith('-')) {
      console.log('Usage: claude-patcher gates enable <gate-name>');
      console.log('       claude-patcher gates enable --all');
      process.exit(1);
    }

    console.log(`Enabling gate: ${target}...`);
    const result = enableGate(target, { cliPath });
    if (!result.success) {
      console.log('Enable failed:', result.error);
      process.exit(1);
    }
    for (const g of result.gatesChanged) {
      console.log(`${g.codename} (${g.name}) — enabled`);
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
      console.log('Disable failed:', result.error);
      process.exit(1);
    }
    for (const g of result.gatesChanged) {
      console.log(`${g.codename} (${g.name}) — disabled`);
    }
    return;
  }

  console.log(`Unknown subcommand: ${subCommand}`);
  console.log('');
  console.log('Available: gates, gates enable, gates disable, gates reset, gates scan');
  process.exit(1);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (args.includes('--version') || args.includes('-v')) {
    console.log(`claude-code-patcher v${VERSION}`);
    return;
  }

  if (args.includes('--help') || args.includes('-h') || !command) {
    printBanner();
    printHelp();
    return;
  }

  printBanner();

  if (command === 'gates') {
    runGates(args.slice(1));
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('');
    printHelp();
    process.exit(1);
  }
}

main();
