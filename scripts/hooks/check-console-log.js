#!/usr/bin/env node
/**
 * Console.log check hook — Stop event + PostToolUse on Edit
 *
 * Scans recently modified .ts/.js source files for console.log statements.
 * Advisory only — this project allows console.log in server/CLI startup code,
 * but flags them in library source files (src/patcher.ts, src/tool-builder.ts, etc.).
 */

import { parseStdin, getFilePath, isSourceFile, isTestFile, log, getProjectRoot, getModifiedFiles } from './lib/utils.js';
import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

// Files where console.log is expected (CLI output, server startup)
const ALLOWED_FILES = [
  'src/cli.ts',
  'src/server.ts',
  'scripts/',
];

function isAllowed(relPath) {
  return ALLOWED_FILES.some(allowed => relPath.startsWith(allowed));
}

function scanFile(filePath, root) {
  if (!existsSync(filePath)) return [];
  if (!isSourceFile(filePath)) return [];
  if (isTestFile(filePath)) return [];

  const relPath = relative(root, filePath);
  if (isAllowed(relPath)) return [];

  try {
    const content = readFileSync(filePath, 'utf8');
    const hits = [];
    content.split('\n').forEach((line, i) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
      if (/\bconsole\.log\b/.test(line)) {
        hits.push({ line: i + 1, text: trimmed.slice(0, 80) });
      }
    });
    return hits.map(h => ({ file: relPath, ...h }));
  } catch {
    return [];
  }
}

async function main() {
  const event = await parseStdin();
  const root = getProjectRoot();
  let filesToCheck = [];

  // If triggered by Edit/Write, check just that file
  const input = event.tool_input || {};
  const filePath = getFilePath(input);

  if (filePath) {
    filesToCheck = [filePath];
  } else {
    // Stop event — check all recently modified files
    const modified = getModifiedFiles();
    filesToCheck = modified.map(f => join(root, f));
  }

  const allHits = filesToCheck.flatMap(f => scanFile(f, root));

  if (allHits.length > 0) {
    log('');
    log('🔍 console.log found in library source files:');
    for (const hit of allHits.slice(0, 10)) {
      log(`   ${hit.file}:${hit.line} — ${hit.text}`);
    }
    if (allHits.length > 10) {
      log(`   ... and ${allHits.length - 10} more`);
    }
    log('   Consider removing before committing (or move to a proper logger).');
    log('');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
