#!/usr/bin/env node
/**
 * Auto-format hook — PostToolUse on Edit/Write
 *
 * Runs ESLint --fix on modified .ts/.tsx/.js/.jsx files.
 * Non-blocking: errors don't prevent Claude from continuing.
 */

import { parseStdin, getFilePath, isSourceFile, log, getProjectRoot } from './lib/utils.js';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const event = await parseStdin();
  const input = event.tool_input || {};
  const filePath = getFilePath(input);

  if (!filePath || !isSourceFile(filePath)) {
    process.exit(0);
  }

  if (!existsSync(filePath)) {
    process.exit(0);
  }

  const root = getProjectRoot();
  const eslintBin = join(root, 'node_modules', '.bin', 'eslint');

  if (!existsSync(eslintBin)) {
    // ESLint not installed — skip silently
    process.exit(0);
  }

  try {
    execSync(`"${eslintBin}" --fix "${filePath}"`, {
      cwd: root,
      encoding: 'utf8',
      timeout: 25000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    log(`[auto-format] Formatted: ${filePath}`);
  } catch (err) {
    // ESLint --fix returns non-zero if unfixable issues remain — that's fine
    log(`[auto-format] ESLint ran on: ${filePath} (some issues may remain)`);
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
