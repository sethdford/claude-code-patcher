#!/usr/bin/env node
/**
 * Code validation hook — PostToolUse on Write/Edit
 *
 * Checks:
 * 1. TypeScript type errors (tsc --noEmit, filtered to modified file)
 * 2. Explicit `any` usage (project rule: no-explicit-any)
 * 3. Secret/credential patterns in source code
 *
 * Non-blocking: outputs warnings to stderr.
 */

import { parseStdin, getFilePath, isTypeScriptFile, log, getProjectRoot } from './lib/utils.js';
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const SECRET_PATTERNS = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]{8,}/i,
  /(?:secret|password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}/i,
  /AKIA[0-9A-Z]{16}/,                                      // AWS access key
  /(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}/,           // GitHub token
  /sk-[A-Za-z0-9]{20,}/,                                   // OpenAI/Anthropic key pattern
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
];

async function main() {
  const event = await parseStdin();
  const input = event.tool_input || {};
  const filePath = getFilePath(input);

  if (!filePath || !isTypeScriptFile(filePath)) {
    process.exit(0);
  }

  if (!existsSync(filePath)) {
    process.exit(0);
  }

  const root = getProjectRoot();
  const relPath = relative(root, filePath);
  let warnings = [];

  // 1. TypeScript type check (filtered to this file)
  try {
    const tscBin = join(root, 'node_modules', '.bin', 'tsc');
    if (existsSync(tscBin)) {
      execSync(`"${tscBin}" --noEmit 2>&1`, {
        cwd: root,
        encoding: 'utf8',
        timeout: 25000,
      });
    }
  } catch (err) {
    // Filter tsc output to only lines mentioning our file
    const output = err.stdout || err.stderr || '';
    const relevantLines = output
      .split('\n')
      .filter(line => line.includes(relPath))
      .slice(0, 5);

    if (relevantLines.length > 0) {
      warnings.push(`[type-check] TypeScript errors in ${relPath}:`);
      relevantLines.forEach(line => warnings.push(`  ${line.trim()}`));
    }
  }

  // 2. Check for explicit `any` usage
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const anyLines = [];

    lines.forEach((line, i) => {
      // Match `: any`, `as any`, `<any>` but not in comments
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      if (/:\s*any\b|as\s+any\b|<any>/.test(line)) {
        anyLines.push(i + 1);
      }
    });

    if (anyLines.length > 0) {
      warnings.push(`[no-any] Found explicit 'any' types at lines: ${anyLines.join(', ')} — use 'unknown' + type guards instead`);
    }
  } catch {
    // File read failure — skip
  }

  // 3. Check for secrets/credentials
  try {
    const content = readFileSync(filePath, 'utf8');
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        warnings.push(`[security] Possible credential/secret detected in ${relPath} — review before committing`);
        break;
      }
    }
  } catch {
    // File read failure — skip
  }

  if (warnings.length > 0) {
    log('');
    log('⚠️  Code validation warnings:');
    warnings.forEach(w => log(`  ${w}`));
    log('');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
