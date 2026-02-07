#!/usr/bin/env node
/**
 * Documentation sync hook — PostToolUse on Write/Edit
 *
 * Provides advisory warnings when modifying files that have
 * corresponding documentation that may need updating.
 */

import { parseStdin, getFilePath, log } from './lib/utils.js';
import { basename } from 'node:path';

const DOC_MAP = [
  { pattern: /cli\.ts$/, doc: 'README.md', section: 'CLI commands' },
  { pattern: /routes\//, doc: 'API docs', section: 'API endpoints' },
  { pattern: /types\.ts$/, doc: 'ARCHITECTURE.md', section: 'type definitions' },
  { pattern: /server\.ts$/, doc: 'deployment docs', section: 'server configuration' },
  { pattern: /patcher\.ts$/, doc: 'README.md', section: 'patching mechanism' },
  { pattern: /tool-builder\.ts$/, doc: 'README.md', section: 'tool authoring' },
  { pattern: /tools\/.*\.ts$/, doc: 'README.md', section: 'built-in tools list' },
  { pattern: /cli-finder\.ts$/, doc: 'README.md', section: 'CLI discovery' },
];

async function main() {
  const event = await parseStdin();
  const input = event.tool_input || {};
  const filePath = getFilePath(input);

  if (!filePath) {
    process.exit(0);
  }

  const name = basename(filePath);
  const matches = DOC_MAP.filter(entry => entry.pattern.test(filePath));

  if (matches.length > 0) {
    log('');
    log('📝 Documentation reminder:');
    for (const match of matches) {
      log(`   ${name} changed → consider updating ${match.doc} (${match.section})`);
    }
    log('');
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
