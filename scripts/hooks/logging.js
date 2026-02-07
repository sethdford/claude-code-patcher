#!/usr/bin/env node
/**
 * Activity logging hook — PostToolUse on all tools
 *
 * Appends a JSONL entry to logs/claude-activity.jsonl for every tool invocation.
 * Fields: timestamp, tool, file_path, session_id
 *
 * Fast and non-blocking (5s timeout).
 */

import { parseStdin, getFilePath, getProjectRoot } from './lib/utils.js';
import { appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const event = await parseStdin();
  const input = event.tool_input || {};
  const filePath = getFilePath(input);

  const root = getProjectRoot();
  const logDir = join(root, 'logs');
  const logFile = join(logDir, 'claude-activity.jsonl');

  if (!existsSync(logDir)) {
    try {
      mkdirSync(logDir, { recursive: true });
    } catch {
      process.exit(0);
    }
  }

  const entry = {
    timestamp: new Date().toISOString(),
    tool: event.tool_name || event.tool || 'unknown',
    file_path: filePath || null,
    session_id: process.env.CLAUDE_SESSION_ID || null,
  };

  try {
    appendFileSync(logFile, JSON.stringify(entry) + '\n');
  } catch {
    // Don't fail if we can't write logs
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
