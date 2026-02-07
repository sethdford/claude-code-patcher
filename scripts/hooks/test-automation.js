#!/usr/bin/env node
/**
 * Test automation hook — PostToolUse on Write/Edit
 *
 * When a source file is modified (not a test file), finds and runs
 * the related test file using Vitest.
 *
 * Non-blocking: test failures are reported but don't block Claude.
 */

import { parseStdin, getFilePath, isSourceFile, isTestFile, findRelatedTestFile, log, getProjectRoot } from './lib/utils.js';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

async function main() {
  const event = await parseStdin();
  const input = event.tool_input || {};
  const filePath = getFilePath(input);

  if (!filePath || !isSourceFile(filePath)) {
    process.exit(0);
  }

  // Don't trigger on test file edits (avoid infinite loops if tests auto-run)
  if (isTestFile(filePath)) {
    process.exit(0);
  }

  if (!existsSync(filePath)) {
    process.exit(0);
  }

  const root = getProjectRoot();
  const testFile = findRelatedTestFile(filePath);

  if (!testFile) {
    // No related test file — skip silently
    process.exit(0);
  }

  const vitestBin = join(root, 'node_modules', '.bin', 'vitest');
  if (!existsSync(vitestBin)) {
    // Vitest not installed — skip
    process.exit(0);
  }

  const relTest = relative(root, testFile);
  log(`[test] Running: ${relTest}`);

  try {
    const output = execSync(`"${vitestBin}" run "${testFile}" --reporter=dot 2>&1`, {
      cwd: root,
      encoding: 'utf8',
      timeout: 55000,
    });

    // Extract pass/fail summary
    const summary = output.split('\n').filter(l => /Tests|Pass|Fail/.test(l)).join('\n');
    if (summary) {
      log(`[test] ${summary.trim()}`);
    } else {
      log(`[test] ✅ ${relTest} passed`);
    }
  } catch (err) {
    const output = err.stdout || err.stderr || '';
    const failLines = output.split('\n').filter(l => /FAIL|Error|✗|×/.test(l)).slice(0, 5);

    log('');
    log(`[test] ❌ ${relTest} failed:`);
    failLines.forEach(l => log(`  ${l.trim()}`));
    log('');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
